import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EmergencyContact, FamilyMember, Medicine } from '../types';

const KEYS = {
  emergency: '@kavach/offline_emergency',
  medicinesToday: '@kavach/offline_medicines_today',
} as const;

export interface OfflineEmergencyBundle {
  memberId: string;
  name: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  organDonor: boolean;
  qrToken: string;
  updatedAt: number;
}

export async function cacheEmergencyProfile(member: FamilyMember): Promise<void> {
  const contacts: EmergencyContact[] = [];
  if (member.emergencyContact1) contacts.push(member.emergencyContact1);
  if (member.emergencyContact2) contacts.push(member.emergencyContact2);

  const bundle: OfflineEmergencyBundle = {
    memberId: member.id,
    name: member.name,
    bloodGroup: member.bloodGroup,
    allergies: member.allergies,
    chronicConditions: member.chronicConditions,
    emergencyContacts: contacts,
    organDonor: member.organDonor,
    qrToken: member.qrToken,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(KEYS.emergency, JSON.stringify(bundle));
}

export async function readEmergencyCache(): Promise<OfflineEmergencyBundle | null> {
  const raw = await AsyncStorage.getItem(KEYS.emergency);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OfflineEmergencyBundle;
  } catch {
    return null;
  }
}

export async function cacheTodaysMedicines(medicines: Medicine[]): Promise<void> {
  const slim = medicines
    .filter((m) => m.active)
    .map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      timing: m.timing,
      mealRelation: m.mealRelation,
      takenToday: m.takenToday ?? {},
    }));
  await AsyncStorage.setItem(KEYS.medicinesToday, JSON.stringify(slim));
}

export async function readTodaysMedicinesCache(): Promise<Medicine[] | null> {
  const raw = await AsyncStorage.getItem(KEYS.medicinesToday);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Medicine[];
  } catch {
    return null;
  }
}
