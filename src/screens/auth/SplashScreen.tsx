import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, ANIM } from '../../constants';
import { useAuthStore } from '../../store/authStore';

type SplashRoute = 'Home' | 'Onboarding' | 'Welcome';

interface Props {
  onFinish: (route: SplashRoute) => void;
}

export function SplashScreen({ onFinish }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((s) => s.hasSeenOnboarding);

  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);
  const brandOpacity = useSharedValue(0);
  const lineWidth = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: ANIM.normal });
    logoScale.value = withSequence(
      withSpring(1.04, ANIM.spring),
      withSpring(1, ANIM.spring),
    );
    lineWidth.value = withDelay(400, withTiming(64, { duration: 500 }));
    brandOpacity.value = withDelay(600, withTiming(1, { duration: ANIM.normal }));
  }, [brandOpacity, lineWidth, logoOpacity, logoScale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        onFinish('Home');
      } else if (!hasSeenOnboarding) {
        onFinish('Onboarding');
      } else {
        onFinish('Welcome');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, isAuthenticated, onFinish]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
    opacity: brandOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A1528', '#0C1A30', '#09142A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Animated.View style={[styles.mark, logoStyle]}>
            <Text style={styles.markLetter}>K</Text>
          </Animated.View>
          <Animated.Text style={[styles.appName, logoStyle]}>KavachSaathi</Animated.Text>
          <Animated.View style={[styles.accentLine, lineStyle]} />
          <Animated.Text style={[styles.tagline, brandStyle]}>
            Ek Card. Poori Suraksha.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.footer, brandStyle]}>
          <Text style={styles.brand}>GDM Technoworld</Text>
          <Text style={styles.dedication}>
            In memory of Late Shri Ganga Dhar Mehta · 1949–2012
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  markLetter: {
    fontFamily: fonts.heading,
    fontSize: 44,
    color: colors.navy,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.white,
    letterSpacing: 0.4,
  },
  accentLine: {
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gray300,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.gray500,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  dedication: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});
