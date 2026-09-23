import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { DEV_MODE, getFirestoreDb } from './firebase';
import { DEV_MEDICINES } from '../data/devData';
import type { Medicine, MedicineTiming, Prescription } from '../types';
import { cacheTodaysMedicines } from './offlineCache.service';

export async function fetchMedicines(uid: string, memberId: string): Promise<Medicine[]> {
  if (DEV_MODE) return DEV_MEDICINES.map((m) => ({ ...m }));

  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await getDocs(
    collection(db, 'users', uid, 'members', memberId, 'medicines'),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Medicine);
}

export async function saveMedicine(
  uid: string,
  memberId: string,
  medicine: Medicine,
): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(
    doc(db, 'users', uid, 'members', memberId, 'medicines', medicine.id),
    medicine,
    { merge: true },
  );
}

export async function markMedicineTakenRemote(
  uid: string,
  memberId: string,
  medicineId: string,
  timing: MedicineTiming,
  takenToday: Partial<Record<MedicineTiming, boolean>>,
): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, 'users', uid, 'members', memberId, 'medicines', medicineId), {
    takenToday: { ...takenToday, [timing]: true },
  });
}

export async function deleteMedicine(
  uid: string,
  memberId: string,
  medicineId: string,
): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, 'users', uid, 'members', memberId, 'medicines', medicineId));
}

export async function savePrescription(
  uid: string,
  memberId: string,
  prescription: Prescription,
): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(
    doc(db, 'users', uid, 'members', memberId, 'prescriptions', prescription.id),
    prescription,
  );
}

export async function persistLocalMedicineCache(medicines: Medicine[]): Promise<void> {
  await cacheTodaysMedicines(medicines);
}

export function createMedicineDraft(
  name: string,
  dosage: string,
  timing: MedicineTiming[],
  mealRelation: Medicine['mealRelation'],
): Medicine {
  return {
    id: `med-${Date.now()}`,
    name,
    dosage,
    timing,
    mealRelation,
    startDate: Date.now(),
    active: true,
    takenToday: {},
    stockCount: 30,
    refillReminderDays: 7,
  };
}
