import { create } from 'zustand';
import type { RemoteConfigState } from '../types';
import { DEV_REMOTE_CONFIG } from '../data/devData';

interface RemoteConfigStore {
  config: RemoteConfigState;
  bannerDismissed: boolean;
  lastFetchedAt: number;
  setConfig: (config: RemoteConfigState) => void;
  dismissBanner: () => void;
  resetBanner: () => void;
}

export const useRemoteConfigStore = create<RemoteConfigStore>((set) => ({
  config: DEV_REMOTE_CONFIG,
  bannerDismissed: false,
  lastFetchedAt: 0,
  setConfig: (config) => set({ config, lastFetchedAt: Date.now(), bannerDismissed: false }),
  dismissBanner: () => set({ bannerDismissed: true }),
  resetBanner: () => set({ bannerDismissed: false }),
}));
