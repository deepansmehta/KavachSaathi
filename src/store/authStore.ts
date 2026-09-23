import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  setUser: (user: UserProfile | null) => void;
  setGuest: (guest: boolean) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingSeen: (seen: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,
      hasSeenOnboarding: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isGuest: false,
          isLoading: false,
        }),
      setGuest: (guest) =>
        set({
          isGuest: guest,
          isAuthenticated: guest,
          user: guest
            ? {
                uid: 'guest',
                name: 'Guest',
                email: '',
                plan: 'guest',
                healthId: 'KVS-GUEST',
                createdAt: Date.now(),
                lastSeen: Date.now(),
                onboardingComplete: true,
              }
            : null,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnboardingSeen: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      signOut: () =>
        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
        }),
    }),
    {
      name: 'kavach-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
