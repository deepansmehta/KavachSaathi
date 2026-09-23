import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { colors, fonts, radius, spacing } from '../../constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const shieldPulse = require('../../../assets/lottie/shieldPulse.json');

type HeroKind = 'card' | 'scan' | 'family';

interface Props {
  kind: HeroKind;
}

export function OnboardingHero({ kind }: Props) {
  if (kind === 'card') return <CardHero />;
  if (kind === 'scan') return <ScanHero />;
  return <FamilyHero />;
}

function CardHero() {
  const tilt = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    tilt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    shimmer.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false);
  }, [shimmer, tilt]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${interpolate(tilt.value, [0, 1], [-12, 12])}deg` },
      { rotateX: `${interpolate(tilt.value, [0, 1], [4, -4])}deg` },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-120, 180]) }],
  }));

  return (
    <View style={styles.stage}>
      <LottieView source={shieldPulse} autoPlay loop style={styles.lottieBg} />
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.cardBrand}>KavachSaathi</Text>
        <View style={styles.proPill}>
          <Text style={styles.proText}>PRO</Text>
        </View>
        <Text style={styles.cardName}>Aapka Card</Text>
        <View style={styles.blood}>
          <Text style={styles.bloodText}>B+</Text>
        </View>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </Animated.View>
    </View>
  );
}

function ScanHero() {
  const line = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    line.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
    pulse.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [line, pulse]);

  const lineStyle = useAnimatedStyle(() => ({
    top: interpolate(line.value, [0, 1], [16, 140]),
  }));

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: pulse.value > 0.5 ? colors.teal : colors.tealGlow,
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.03]) }],
  }));

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.scanFrame, frameStyle]}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        <Animated.View style={[styles.scanLine, lineStyle]} />
        <Text style={styles.scanEmoji}>📱</Text>
        <Text style={styles.scanHint}>QR Scan</Text>
      </Animated.View>
    </View>
  );
}

function FamilyHero() {
  const members = ['👨', '👩', '👴', '👵', '🧒', '👧'];
  return (
    <View style={styles.stage}>
      <View style={styles.familyGrid}>
        {members.map((emoji, i) => (
          <FamilyChip key={emoji} emoji={emoji} delay={i * 120} />
        ))}
      </View>
      <View style={styles.shieldOverlay}>
        <Text style={styles.shieldEmoji}>🛡️</Text>
      </View>
    </View>
  );
}

function FamilyChip({ emoji, delay }: { emoji: string; delay: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[styles.chip, style]}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 260,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  lottieBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },
  card: {
    width: 190,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.navyLight,
    borderWidth: 1,
    borderColor: colors.goldGlow,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardBrand: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.white,
  },
  proPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  proText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.navy,
    letterSpacing: 1,
  },
  cardName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.sm,
  },
  blood: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  bloodText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.white,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scanFrame: {
    width: 170,
    height: 170,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: colors.teal,
  },
  tl: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: colors.teal,
    shadowColor: colors.teal,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  scanEmoji: { fontSize: 42 },
  scanHint: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.teal,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipEmoji: { fontSize: 26 },
  shieldOverlay: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: colors.navy,
    borderRadius: radius.full,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  shieldEmoji: { fontSize: 22 },
});
