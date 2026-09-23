import { httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { DEV_MODE, getFirebaseFunctions, getFirestoreDb } from './firebase';
import { useAuthStore } from '../store/authStore';
import { useCardsStore } from '../store/cardsStore';
import { useProfileStore } from '../store/profileStore';
import type { ShippingAddress, DigitalCard, CardOrder } from '../types';

export type { ShippingAddress };

export interface CreateOrderResult {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
}

export interface ConfirmPaymentResult {
  success: boolean;
  cardId: string;
  qrToken: string;
}

export interface ActivateCardResult {
  success: boolean;
  message: string;
}

function uidOrThrow(): string {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid || uid === 'guest') {
    throw new Error('Login required to order a card.');
  }
  return uid;
}

/** Step 1 — create Razorpay order (server) or DEV pending order */
export async function createOrder(
  cardType: 'standard' | 'pro',
  shippingAddress: ShippingAddress,
): Promise<CreateOrderResult> {
  const uid = uidOrThrow();
  const amountRupees = cardType === 'pro' ? 449 : 249;
  const amountPaise = amountRupees * 100;

  if (DEV_MODE) {
    useCardsStore.getState().seedDevInventory();
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const razorpayOrderId = `order_dev_${Date.now()}`;
    const order: CardOrder = {
      orderId,
      userId: uid,
      cardType,
      amount: amountRupees,
      status: 'pending',
      razorpayOrderId,
      razorpayPaymentId: null,
      shippingAddress,
      digitalCardId: null,
      trackingNumber: null,
      createdAt: Date.now(),
      paidAt: null,
      shippedAt: null,
    };
    useCardsStore.getState().addOrder(order);
    return { orderId, razorpayOrderId, amount: amountPaise };
  }

  const fns = getFirebaseFunctions();
  if (!fns) throw new Error('Firebase Functions configured nahi hai.');

  const callable = httpsCallable<
    { cardType: string; shippingAddress: ShippingAddress },
    CreateOrderResult
  >(fns, 'createRazorpayOrder');
  const result = await callable({ cardType, shippingAddress });
  return result.data;
}

/** Step 2 — confirm payment + assign digital card */
export async function confirmPayment(params: {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ConfirmPaymentResult> {
  const uid = uidOrThrow();

  if (DEV_MODE) {
    const store = useCardsStore.getState();
    const order = store.orders.find((o) => o.orderId === params.orderId);
    if (!order) throw new Error('Order nahi mila.');

    const card = store.takeReadyCard(order.cardType);
    if (!card) {
      throw new Error('No cards available. Hum aapse contact karenge.');
    }

    store.updateOrder(params.orderId, {
      status: 'paid',
      razorpayPaymentId: params.razorpayPaymentId,
      digitalCardId: card.cardId,
      paidAt: Date.now(),
    });

    const digital: DigitalCard = {
      cardId: card.cardId,
      type: order.cardType,
      status: 'digital_only',
      qrToken: card.qrToken,
      orderId: params.orderId,
      activatedAt: null,
      memberLinked: null,
    };
    store.addDigitalCard(digital);

    // Upgrade user plan locally when Pro purchased
    const auth = useAuthStore.getState();
    if (auth.user && order.cardType === 'pro') {
      auth.setUser({ ...auth.user, plan: 'pro', healthId: card.cardId });
    } else if (auth.user) {
      auth.setUser({ ...auth.user, plan: 'standard', healthId: card.cardId });
    }

    void uid;
    return { success: true, cardId: card.cardId, qrToken: card.qrToken };
  }

  const fns = getFirebaseFunctions();
  if (!fns) throw new Error('Firebase Functions configured nahi hai.');

  const callable = httpsCallable<typeof params, ConfirmPaymentResult>(
    fns,
    'confirmPaymentAndAssignCard',
  );
  const result = await callable(params);
  return result.data;
}

/** Step 3 — activate physical card with slip ID */
export async function activateCard(
  activationId: string,
  memberId?: string,
): Promise<ActivateCardResult> {
  const uid = uidOrThrow();
  const id = activationId.trim().toUpperCase();

  if (DEV_MODE) {
    const store = useCardsStore.getState();
    const digital = store.digitalCards.find((c) => c.cardId === id);
    if (!digital) {
      // Also allow activating from inventory assigned in this session
      throw new Error('Invalid activation ID. Slip check karein.');
    }
    if (digital.status === 'fully_active') {
      throw new Error('Card already activated.');
    }

    store.updateDigitalCard(id, {
      status: 'fully_active',
      activatedAt: Date.now(),
      memberLinked: memberId ?? null,
    });

    const profile = useProfileStore.getState();
    const targetId = memberId ?? profile.activeMemberId;
    if (targetId) {
      profile.updateMember(targetId, { cardActivated: true });
    }

    void uid;
    return {
      success: true,
      message: 'Card activated! Aapka physical KavachSaathi card ab live hai.',
    };
  }

  const fns = getFirebaseFunctions();
  if (!fns) throw new Error('Firebase Functions configured nahi hai.');

  const callable = httpsCallable<
    { activationId: string; memberId?: string },
    ActivateCardResult
  >(fns, 'activatePhysicalCard');
  const result = await callable({ activationId: id, memberId });
  return result.data;
}

export async function getUserCards(): Promise<DigitalCard[]> {
  if (DEV_MODE) {
    return useCardsStore.getState().digitalCards;
  }

  const uid = useAuthStore.getState().user?.uid;
  const db = getFirestoreDb();
  if (!uid || !db) return [];

  const snap = await getDocs(
    query(collection(db, 'users', uid, 'digitalCards'), orderBy('orderId', 'desc')),
  );
  const cards = snap.docs.map((d) => d.data() as DigitalCard);
  useCardsStore.getState().setDigitalCards(cards);
  return cards;
}

export async function getOrderStatus(orderId: string): Promise<CardOrder | null> {
  if (DEV_MODE) {
    return useCardsStore.getState().orders.find((o) => o.orderId === orderId) ?? null;
  }

  const db = getFirestoreDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? (snap.data() as CardOrder) : null;
}

/**
 * Opens Razorpay checkout when native module is available.
 * In Expo Go / DEV_MODE, simulates a successful payment.
 */
export async function openRazorpayCheckout(options: {
  amountPaise: number;
  razorpayOrderId: string;
  description: string;
  name: string;
  email: string;
  contact: string;
}): Promise<{ razorpay_payment_id: string; razorpay_signature: string }> {
  const key = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

  if (DEV_MODE || !key || key.includes('XXXX')) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      razorpay_payment_id: `pay_dev_${Date.now()}`,
      razorpay_signature: `sig_dev_${Date.now()}`,
    };
  }

  try {
    // Native module — requires a development build (`npx expo prebuild` / EAS)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RazorpayCheckout = require('react-native-razorpay').default as {
      open: (opts: Record<string, unknown>) => Promise<{
        razorpay_payment_id: string;
        razorpay_signature: string;
      }>;
    };

    return await RazorpayCheckout.open({
      description: options.description,
      image: 'https://kavachsaathi.in/logo.png',
      currency: 'INR',
      key,
      amount: options.amountPaise,
      order_id: options.razorpayOrderId,
      name: 'KavachSaathi by GDM',
      prefill: {
        name: options.name,
        contact: options.contact,
        email: options.email,
      },
      theme: { color: '#FF5722' },
    });
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';
    if (code === 'PAYMENT_CANCELLED' || code === '2') {
      throw new Error('PAYMENT_CANCELLED');
    }
    // Fallback to DEV simulation if native module missing
    if (String(err).includes('RNRazorpay') || String(err).includes('null')) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`,
      };
    }
    throw err instanceof Error ? err : new Error('Payment fail ho gaya.');
  }
}
