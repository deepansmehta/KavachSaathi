import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FamilyMember, ActivityItem } from '../types';
import { DEV_MEMBERS, DEV_ACTIVITY } from '../data/devData';

interface ProfileState {
  members: FamilyMember[];
  activeMemberId: string | null;
  activity: ActivityItem[];
  setMembers: (members: FamilyMember[]) => void;
  setActiveMember: (id: string) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, patch: Partial<FamilyMember>) => void;
  setActivity: (activity: ActivityItem[]) => void;
  loadDevData: () => void;
  getActiveMember: () => FamilyMember | undefined;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      members: [],
      activeMemberId: null,
      activity: [],
      setMembers: (members) =>
        set({
          members,
          activeMemberId: members[0]?.id ?? null,
        }),
      setActiveMember: (activeMemberId) => set({ activeMemberId }),
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
          activeMemberId: state.activeMemberId ?? member.id,
        })),
      updateMember: (id, patch) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      setActivity: (activity) => set({ activity }),
      loadDevData: () =>
        set({
          members: DEV_MEMBERS,
          activeMemberId: DEV_MEMBERS[0].id,
          activity: DEV_ACTIVITY,
        }),
      getActiveMember: () => {
        const { members, activeMemberId } = get();
        return members.find((m) => m.id === activeMemberId) ?? members[0];
      },
    }),
    {
      name: 'kavach-profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
