import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { FamilyMember } from '../../types';
import { colors, fonts, radius, spacing } from '../../constants';
import { NFCIcon } from '../icons/KavachIcons';
import { ShimmerText } from '../ShimmerText';

interface Props {
  member: FamilyMember;
}

export function CardFront({ member }: Props) {
  const isPro = member.cardType === 'pro';
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (isPro) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [isPro, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-280, 280]),
      },
    ],
  }));

  if (isPro) {
    return (
      <LinearGradient
        colors={[colors.navy, colors.navyLight, '#1A3055']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', colors.goldGlow, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={styles.topRow}>
          <View>
            <Text style={styles.logoPro}>KavachSaathi</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <NFCIcon size={22} color={colors.goldLight} />
        </View>

        <View style={styles.center}>
          <Text style={styles.namePro}>{member.name}</Text>
          <View style={styles.bloodPill}>
            <Text style={styles.bloodText}>{member.bloodGroup}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <ShimmerText
            text={member.qrToken.toUpperCase().slice(0, 12)}
            style={styles.healthId}
          />
          <Text style={styles.gdmGold}>GDM</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, styles.standard]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.logoStd}>KavachSaathi</Text>
          <Text style={styles.stdLabel}>STANDARD</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.nameStd}>{member.name}</Text>
        <View style={styles.bloodPill}>
          <Text style={styles.bloodText}>{member.bloodGroup}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <ShimmerText
          text={member.qrToken.toUpperCase().slice(0, 12)}
          style={[styles.healthId, { color: colors.navy }]}
          shimmerColors={['#09142A', '#22D3EE', '#09142A', '#22D3EE', '#09142A']}
        />
        <Text style={styles.gdmNavy}>GDM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: radius.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldGlow,
  },
  standard: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoPro: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
  },
  logoStd: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.navy,
  },
  proBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  proBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.navy,
    letterSpacing: 1,
  },
  stdLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.gray500,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  nfc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.goldLight,
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  namePro: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
  },
  nameStd: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.navy,
    textAlign: 'center',
  },
  bloodPill: {
    backgroundColor: colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  bloodText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  healthId: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.teal,
  },
  gdmGold: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.gold,
  },
  gdmNavy: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.navy,
  },
});
