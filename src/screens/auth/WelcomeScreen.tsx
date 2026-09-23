import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, spacing, radius, ANIM, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import {
  completeGoogleSignIn,
  signInWithApple,
  signInAsGuest,
  useGoogleAuthRequest,
  isGoogleAuthConfigured,
} from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useMedicinesStore } from '../../store/medicinesStore';
import { toast } from '../../components/common/Toast';

type AuthStackParamList = {
  Main: undefined;
  ProfileSetup: undefined;
  Welcome: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

type SignInMethod = 'google' | 'apple' | 'guest';

type GooglePrompt = () => Promise<{
  type: string;
  params?: { id_token?: string };
}>;

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return <Text style={styles.appleIcon}>􀣺</Text>;
}

export function WelcomeScreen() {
  if (isGoogleAuthConfigured()) {
    return <WelcomeWithGoogleAuth />;
  }
  return <WelcomeContent googlePrompt={null} />;
}

function WelcomeWithGoogleAuth() {
  const [, , googlePrompt] = useGoogleAuthRequest();
  return <WelcomeContent googlePrompt={googlePrompt as GooglePrompt} />;
}

function WelcomeContent({ googlePrompt }: { googlePrompt: GooglePrompt | null }) {
  const navigation = useNavigation<NavigationProp>();
  const setUser = useAuthStore((s) => s.setUser);
  const setGuest = useAuthStore((s) => s.setGuest);
  const [loadingMethod, setLoadingMethod] = useState<SignInMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(16);

  useEffect(() => {
    logoOpacity.value = withDelay(120, withTiming(1, { duration: ANIM.normal }));
    logoY.value = withDelay(120, withSpring(0, ANIM.spring));
  }, [logoOpacity, logoY]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));

  const finishLogin = useCallback(
    (profile: Awaited<ReturnType<typeof completeGoogleSignIn>>, asGuest = false) => {
      if (asGuest) {
        setGuest(true);
      } else {
        setUser(profile);
        useProfileStore.getState().loadDevData();
        useMedicinesStore.getState().loadDevData();
      }

      toast(asGuest ? 'Guest mode on' : `Namaste, ${profile.name.split(' ')[0]}!`, 'success');

      if (profile.onboardingComplete || asGuest) {
        navigation.navigate('Main');
      } else {
        navigation.navigate('ProfileSetup');
      }
    },
    [navigation, setGuest, setUser],
  );

  const handleSignIn = useCallback(
    async (method: SignInMethod) => {
      setError(null);
      setLoadingMethod(method);

      try {
        if (method === 'google') {
          if (!googlePrompt) {
            const profile = await completeGoogleSignIn('dev-token');
            finishLogin(profile);
            return;
          }

          const result = await googlePrompt();
          if (result.type !== 'success') {
            if (result.type !== 'dismiss' && result.type !== 'cancel') {
              throw new Error('Google sign-in cancel ho gaya.');
            }
            return;
          }
          const idToken = result.params?.id_token;
          if (!idToken) throw new Error('Google id token nahi mila.');
          const profile = await completeGoogleSignIn(idToken);
          finishLogin(profile);
          return;
        }

        if (method === 'apple') {
          const profile = await signInWithApple();
          finishLogin(profile);
          return;
        }

        const guest = await signInAsGuest();
        finishLogin(guest, true);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Sign in fail ho gaya. Kripya dobara try karein.';
        setError(message);
        toast('Kuch gadbad ho gayi. Dobara try karein.', 'error');
      } finally {
        setLoadingMethod(null);
      }
    },
    [finishLogin, googlePrompt],
  );

  return (
    <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.hero}>
          <Animated.View style={[styles.logoBlock, logoStyle]}>
            <View style={styles.mark}>
              <Text style={styles.markLetter}>K</Text>
            </View>
            <Text style={styles.appName}>KavachSaathi</Text>
            <Text style={styles.tagline}>Ek Card. Poori Suraksha.</Text>
          </Animated.View>
        </View>

        <GlassCard style={styles.sheet} intensity={24}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title="Google se continue karein"
            onPress={() => void handleSignIn('google')}
            variant="google"
            loading={loadingMethod === 'google'}
            disabled={loadingMethod !== null && loadingMethod !== 'google'}
            icon={<GoogleIcon />}
          />

          {Platform.OS === 'ios' ? (
            <Button
              title="Apple se continue karein"
              onPress={() => void handleSignIn('apple')}
              variant="apple"
              loading={loadingMethod === 'apple'}
              disabled={loadingMethod !== null && loadingMethod !== 'apple'}
              icon={<AppleIcon />}
              style={styles.appleBtn}
            />
          ) : null}

          <Button
            title="Guest ke roop mein dekhein"
            onPress={() => void handleSignIn('guest')}
            variant="ghost"
            loading={loadingMethod === 'guest'}
            disabled={loadingMethod !== null && loadingMethod !== 'guest'}
            style={styles.guestBtn}
          />

          <Text style={styles.terms}>
            Aage badhkar aap hamari Terms & Privacy Policy se agree karte hain.
          </Text>
        </GlassCard>

        <Text style={styles.footer}>GDM Technoworld · Fatehabad, Haryana</Text>
        <Text style={styles.dedication}>
          In memory of Late Shri Ganga Dhar Mehta · 1949–2012
        </Text>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoBlock: {
    alignItems: 'center',
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  markLetter: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.navy,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 34,
    color: colors.white,
    marginBottom: spacing.sm,
    letterSpacing: 0.4,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.gray300,
    letterSpacing: 0.2,
  },
  sheet: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 20,
    color: colors.white,
  },
  appleBtn: {
    marginTop: spacing.sm,
  },
  guestBtn: {
    marginTop: spacing.sm,
  },
  terms: {
    ...textStyles.caption,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  footer: {
    ...textStyles.caption,
    textAlign: 'center',
    color: colors.gray500,
  },
  dedication: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gray500,
    textAlign: 'center',
    paddingBottom: spacing.md,
    marginTop: 4,
    opacity: 0.85,
  },
});
