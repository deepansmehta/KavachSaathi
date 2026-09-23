import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import * as SplashScreenExpo from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastHost } from './src/components/common/Toast';
import { colors } from './src/constants';
import { useAuthStore } from './src/store/authStore';
import { useProfileStore } from './src/store/profileStore';
import { useMedicinesStore } from './src/store/medicinesStore';
import { useShakeDetection } from './src/hooks/useShakeDetection';
import { initRemoteConfig } from './src/services/remoteConfig.service';
import { useRemoteConfigStore } from './src/store/remoteConfigStore';
import { navigationRef } from './src/navigation/navigationRef';
import {
  cacheEmergencyProfile,
  cacheTodaysMedicines,
} from './src/services/offlineCache.service';

SplashScreenExpo.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.navy,
    primary: colors.orange,
    text: colors.white,
    border: colors.glassBorder,
    notification: colors.orange,
  },
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadProfile = useProfileStore((s) => s.loadDevData);
  const loadMeds = useMedicinesStore((s) => s.loadDevData);
  const members = useProfileStore((s) => s.members);
  const medicines = useMedicinesStore((s) => s.medicines);
  const getActiveMember = useProfileStore((s) => s.getActiveMember);
  const setConfig = useRemoteConfigStore((s) => s.setConfig);

  const [fontsLoaded] = useFonts({
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMMono_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const config = await initRemoteConfig();
        setConfig(config);
        if (isAuthenticated && members.length === 0) {
          loadProfile();
          loadMeds();
        }
      } finally {
        setLoading(false);
        setAppReady(true);
      }
    }
    void prepare();
  }, [isAuthenticated, loadMeds, loadProfile, members.length, setConfig, setLoading]);

  useEffect(() => {
    const active = getActiveMember();
    if (active) {
      void cacheEmergencyProfile(active);
    }
    if (medicines.length > 0) {
      void cacheTodaysMedicines(medicines);
    }
  }, [getActiveMember, members, medicines]);

  useShakeDetection({
    enabled: isAuthenticated,
    onShake: () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('SOS');
      }
    },
  });

  const onLayoutRootView = useCallback(async () => {
    if (appReady && fontsLoaded) {
      await SplashScreenExpo.hideAsync();
    }
  }, [appReady, fontsLoaded]);

  if (!appReady || !fontsLoaded) {
    return <View style={styles.boot} />;
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef} theme={navTheme}>
            <StatusBar barStyle="light-content" />
            <RootNavigator />
            <ToastHost />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  boot: { flex: 1, backgroundColor: colors.navy },
});
