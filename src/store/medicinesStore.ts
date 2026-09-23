import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Medicine, MedicineTiming, Prescription } from '../types';
import { DEV_MEDICINES } from '../data/devData';

interface MedicinesState {
  medicines: Medicine[];
  prescriptions: Prescription[];
  setMedicines: (medicines: Medicine[]) => void;
  addMedicine: (medicine: Medicine) => void;
  removeMedicine: (id: string) => void;
  markTaken: (id: string, timing: MedicineTiming) => void;
  addPrescription: (prescription: Prescription) => void;
  loadDevData: () => void;
  dailyProgress: () => number;
}

export const useMedicinesStore = create<MedicinesState>()(
  persist(
    (set, get) => ({
      medicines: [],
      prescriptions: [],
      setMedicines: (medicines) => set({ medicines }),
      addMedicine: (medicine) =>
        set((state) => ({ medicines: [...state.medicines, medicine] })),
      removeMedicine: (id) =>
        set((state) => ({
          medicines: state.medicines.filter((m) => m.id !== id),
        })),
      markTaken: (id, timing) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === id
              ? {
                  ...m,
                  takenToday: { ...m.takenToday, [timing]: true },
                }
              : m,
          ),
        })),
      addPrescription: (prescription) =>
        set((state) => ({
          prescriptions: [prescription, ...state.prescriptions],
        })),
      loadDevData: () => set({ medicines: DEV_MEDICINES }),
      dailyProgress: () => {
        const { medicines } = get();
        const active = medicines.filter((m) => m.active);
        let total = 0;
        let taken = 0;
        for (const med of active) {
          for (const t of med.timing) {
            total += 1;
            if (med.takenToday?.[t]) taken += 1;
          }
        }
        return total === 0 ? 0 : Math.round((taken / total) * 100);
      },
    }),
    {
      name: 'kavach-medicines',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
