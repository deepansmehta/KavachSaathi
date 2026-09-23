/**
 * Seed pre-generated KavachSaathi card inventory into Firestore.
 *
 * Usage:
 *   1. Fill firebaseConfig below (or set EXPO_PUBLIC_* env vars)
 *   2. npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seedCards.ts
 *
 * Creates:
 *   - 100 standard cards (status: ready)
 *   - 50 pro cards (status: ready)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:xxxxxxxx',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function makeCardId(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `KVS-${year}-${suffix}`;
}

function makeQrToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2, 10);
}

async function generateCards(count: number, type: 'standard' | 'pro') {
  for (let i = 0; i < count; i++) {
    const cardId = makeCardId();
    const qrToken = makeQrToken();

    await setDoc(doc(db, 'cards', cardId), {
      cardId,
      type,
      status: 'ready',
      assignedTo: null,
      orderId: null,
      activatedAt: null,
      memberLinked: null,
      qrToken,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ ${cardId} (${type}) — qrToken: ${qrToken}`);
  }
}

async function main() {
  if (!process.env.EXPO_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    console.error(
      '❌ Set EXPO_PUBLIC_FIREBASE_* env vars (or edit firebaseConfig) before seeding.',
    );
    process.exit(1);
  }

  console.log('Seeding 100 standard + 50 pro cards…');
  await generateCards(100, 'standard');
  await generateCards(50, 'pro');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
