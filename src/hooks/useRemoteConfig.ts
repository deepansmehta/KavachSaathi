import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { refreshRemoteConfig } from '../services/remoteConfig.service';
import { useRemoteConfigStore } from '../store/remoteConfigStore';

export function useRemoteConfig() {
  const { config, bannerDismissed, setConfig, dismissBanner } = useRemoteConfigStore();

  const refresh = useCallback(async () => {
    const next = await refreshRemoteConfig();
    setConfig(next);
  }, [setConfig]);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    ...config,
    bannerDismissed,
    dismissBanner,
    refresh,
  };
}
