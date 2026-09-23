/**
 * KavachSaathi Firebase Cloud Functions
 *
 * Deploy:
 *   cd functions && npm install
 *   firebase functions:config:set razorpay.key_id="rzp_test_XXX" razorpay.key_secret="XXX"
 *   firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();
const db = admin.firestore();

function getRazorpay() {
  const key_id = functions.config().razorpay?.key_id as string | undefined;
  const key_secret = functions.config().razorpay?.key_secret as string | undefined;
  if (!key_id || !key_secret) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Razorpay keys configured nahi hain. firebase functions:config:set razorpay.key_id=... razorpay.key_secret=...',
    );
  }
  return new Razorpay({ key_id, key_secret });
}

/** 1. Card scan → FCM to owner */
export const onCardScanned = functions.firestore
  .document('cardScans/{scanId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const userId = data.userId as string;
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken as string | undefined;
    if (!fcmToken) return;

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'Card scan hua',
        body: 'Aapka KavachSaathi card scan kiya gaya.',
      },
      data: { type: 'card_scanned', scanId: snap.id },
    });
  });

/** 2. Medicine reminder cron — every 15 min */
export const medicineReminderCron = functions.pubsub
  .schedule('every 15 minutes')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    functions.logger.info('medicineReminderCron tick');
  });

/** 3. Refill reminder — daily 9 AM IST */
export const refillReminderCron = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    functions.logger.info('refillReminderCron tick');
  });

/** 4. Emergency page API */
export const emergencyPage = functions.https.onRequest(async (req, res) => {
  const token = String(req.query.token ?? '');
  if (!token) {
    res.status(400).json({ error: 'token required' });
    return;
  }

  // Prefer inventory cards collection (qrToken), fall back to members
  const cards = await db
    .collection('cards')
    .where('qrToken', '==', token)
    .limit(1)
    .get();

  if (!cards.empty) {
    const card = cards.docs[0].data();
    const userId = card.assignedTo as string | null;
    let memberData: admin.firestore.DocumentData | undefined;
    if (userId && card.memberLinked) {
      const m = await db
        .collection('users')
        .doc(userId)
        .collection('members')
        .doc(card.memberLinked)
        .get();
      memberData = m.data();
    }
    await db.collection('cardScans').add({
      qrToken: token,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId,
      memberId: card.memberLinked ?? null,
      cardId: card.cardId,
    });
    res.json({
      cardId: card.cardId,
      name: memberData?.name ?? 'KavachSaathi Cardholder',
      bloodGroup: memberData?.bloodGroup ?? '—',
      allergies: memberData?.allergies ?? [],
      chronicConditions: memberData?.chronicConditions ?? [],
      emergencyContact1: memberData?.emergencyContact1,
      emergencyContact2: memberData?.emergencyContact2,
      insuranceId: memberData?.insuranceId,
      abhaNumber: memberData?.abhaNumber,
      organDonor: memberData?.organDonor,
    });
    return;
  }

  const members = await db
    .collectionGroup('members')
    .where('qrToken', '==', token)
    .limit(1)
    .get();

  if (members.empty) {
    res.status(404).json({ error: 'not found' });
    return;
  }

  const memberDoc = members.docs[0];
  const member = memberDoc.data();
  const userId = memberDoc.ref.parent.parent?.id;

  await db.collection('cardScans').add({
    qrToken: token,
    scannedAt: admin.firestore.FieldValue.serverTimestamp(),
    userId,
    memberId: memberDoc.id,
  });

  res.json({
    name: member.name,
    bloodGroup: member.bloodGroup,
    allergies: member.allergies ?? [],
    chronicConditions: member.chronicConditions ?? [],
    emergencyContact1: member.emergencyContact1,
    emergencyContact2: member.emergencyContact2,
    insuranceId: member.insuranceId,
    abhaNumber: member.abhaNumber,
    organDonor: member.organDonor,
  });
});

/** 5. Chemist verify — 24h token */
export const chemistVerify = functions.https.onRequest(async (req, res) => {
  const token = String(req.query.token ?? '');
  res.json({ token, medicines: [], note: 'Implement token lookup' });
});

/** 6. Plan expiry reminder — daily */
export const planExpiryReminder = functions.pubsub
  .schedule('0 10 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    functions.logger.info('planExpiryReminder tick');
  });

// ─── Card ordering + activation ─────────────────────────────────────────────

/** Create Razorpay order + pending Firestore order */
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const cardType = data?.cardType as 'standard' | 'pro';
  const shippingAddress = data?.shippingAddress as {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  if (cardType !== 'standard' && cardType !== 'pro') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid cardType');
  }
  if (
    !shippingAddress?.name ||
    !shippingAddress?.phone ||
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    throw new functions.https.HttpsError('invalid-argument', 'Incomplete shipping address');
  }

  const amountRupees = cardType === 'pro' ? 449 : 249;
  const amountPaise = amountRupees * 100;
  const razorpay = getRazorpay();

  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: `kvs_${Date.now()}`,
  });

  const orderId = `ORD-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
  await db.collection('orders').doc(orderId).set({
    orderId,
    userId: context.auth.uid,
    cardType,
    amount: amountRupees,
    status: 'pending',
    razorpayOrderId: razorpayOrder.id,
    razorpayPaymentId: null,
    shippingAddress,
    digitalCardId: null,
    trackingNumber: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    paidAt: null,
    shippedAt: null,
  });

  return { orderId, razorpayOrderId: razorpayOrder.id, amount: amountPaise };
});

/** Verify payment signature + assign pre-generated card instantly */
export const confirmPaymentAndAssignCard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const { orderId, razorpayPaymentId, razorpaySignature } = data as {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  if (!orderId || !razorpayPaymentId || !razorpaySignature) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing payment fields');
  }

  const orderRef = db.collection('orders').doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Order nahi mila');
  }

  const order = orderDoc.data()!;
  if (order.userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Yeh order aapka nahi hai');
  }
  if (order.status === 'paid' && order.digitalCardId) {
    const existing = await db
      .collection('users')
      .doc(context.auth.uid)
      .collection('digitalCards')
      .doc(order.digitalCardId)
      .get();
    return {
      success: true,
      cardId: order.digitalCardId,
      qrToken: existing.data()?.qrToken ?? '',
    };
  }

  const keySecret = functions.config().razorpay?.key_secret as string;
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSig !== razorpaySignature) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment verification failed');
  }

  // Transaction-safe assign: query outside, lock doc inside
  const available = await db
    .collection('cards')
    .where('type', '==', order.cardType)
    .where('status', '==', 'ready')
    .limit(5)
    .get();

  if (available.empty) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'No cards available. Hum aapse contact karenge.',
    );
  }

  let assigned: { cardId: string; qrToken: string } | null = null;

  for (const candidate of available.docs) {
    try {
      assigned = await db.runTransaction(async (tx) => {
        const fresh = await tx.get(candidate.ref);
        const card = fresh.data();
        if (!fresh.exists || !card || card.status !== 'ready') {
          throw new Error('taken');
        }

        tx.update(candidate.ref, {
          status: 'shipped',
          assignedTo: context.auth!.uid,
          orderId,
        });

        tx.update(orderRef, {
          status: 'paid',
          razorpayPaymentId,
          digitalCardId: card.cardId,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        tx.set(
          db
            .collection('users')
            .doc(context.auth!.uid)
            .collection('digitalCards')
            .doc(card.cardId),
          {
            cardId: card.cardId,
            type: order.cardType,
            status: 'digital_only',
            qrToken: card.qrToken,
            orderId,
            activatedAt: null,
            memberLinked: null,
          },
        );

        tx.set(
          db.collection('users').doc(context.auth!.uid),
          {
            plan: order.cardType,
            healthId: card.cardId,
            planExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
          },
          { merge: true },
        );

        return { cardId: card.cardId as string, qrToken: card.qrToken as string };
      });
      break;
    } catch {
      // Card taken by another payment — try next candidate
    }
  }

  if (!assigned) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'No cards available. Hum aapse contact karenge.',
    );
  }

  return { success: true, cardId: assigned.cardId, qrToken: assigned.qrToken };
});

/** Activate physical card with slip / printed card ID */
export const activatePhysicalCard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  const activationId = String(data?.activationId ?? '')
    .trim()
    .toUpperCase();
  const memberId = (data?.memberId as string | undefined) ?? null;

  if (!activationId.startsWith('KVS-')) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid activation ID format');
  }

  const cardRef = db.collection('cards').doc(activationId);
  const cardDoc = await cardRef.get();

  if (!cardDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Invalid activation ID. Slip dubara check karein.',
    );
  }

  const card = cardDoc.data()!;

  if (card.assignedTo !== context.auth.uid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Yeh card kisi aur account ka hai.',
    );
  }

  if (card.status === 'active') {
    throw new functions.https.HttpsError('already-exists', 'Card already activated.');
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.update(cardRef, {
    status: 'active',
    activatedAt: now,
    memberLinked: memberId,
  });

  batch.update(
    db.collection('users').doc(context.auth.uid).collection('digitalCards').doc(activationId),
    {
      status: 'fully_active',
      activatedAt: now,
      memberLinked: memberId,
    },
  );

  if (orderIdSafe(card.orderId)) {
    batch.update(db.collection('orders').doc(card.orderId), {
      status: 'delivered',
    });
  }

  await batch.commit();
  return {
    success: true,
    message: 'Card activated! Aapka physical KavachSaathi card ab live hai.',
  };
});

function orderIdSafe(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}
