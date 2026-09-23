import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { DEV_MODE, getFirestoreDb } from './firebase';
import { DEV_MEMBERS, DEV_USER } from '../data/devData';
import type { FamilyMember, UserProfile } from '../types';
import { generateHealthId, generateQrToken } from '../utils/helpers';
import { cacheEmergencyProfile } from './offlineCache.service';

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (DEV_MODE) {
    return uid === DEV_USER.uid || uid === 'dev-user-001' ? { ...DEV_USER } : null;
  }

  const db = getFirestoreDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(
    doc(db, 'users', profile.uid),
    { ...profile, lastSeen: Date.now(), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function fetchMembers(uid: string): Promise<FamilyMember[]> {
  if (DEV_MODE) return DEV_MEMBERS.map((m) => ({ ...m }));

  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, 'users', uid, 'members'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FamilyMember);
}

export async function saveMember(uid: string, member: FamilyMember): Promise<void> {
  await cacheEmergencyProfile(member);
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, 'users', uid, 'members', member.id), member, { merge: true });
}

export async function updateMemberFields(
  uid: string,
  memberId: string,
  patch: Partial<FamilyMember>,
): Promise<void> {
  if (DEV_MODE) return;

  const db = getFirestoreDb();
  if (!db) return;
  await updateDoc(doc(db, 'users', uid, 'members', memberId), patch);
}

export function createBlankMember(
  name: string,
  relation: string,
  cardType: 'standard' | 'pro',
): FamilyMember {
  return {
    id: `member-${Date.now()}`,
    name,
    relation,
    bloodGroup: 'B+',
    allergies: [],
    chronicConditions: [],
    organDonor: false,
    isBloodDonor: false,
    cardType,
    qrToken: generateQrToken(),
    nfcId: cardType === 'pro' ? `NFC-${generateQrToken().slice(0, 6).toUpperCase()}` : undefined,
    cardActivated: false,
  };
}

export function ensureHealthId(profile: UserProfile): UserProfile {
  if (profile.healthId && profile.healthId !== 'KVS-GUEST') return profile;
  return { ...profile, healthId: generateHealthId() };
}
