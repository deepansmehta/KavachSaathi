import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { darken } from '../../utils/helpers';
import { colors, fonts, radius, spacing } from '../../constants';
import { PressScale } from '../common/PressScale';
import type { HomeBannerConfig } from '../../types';

interface Props {
  banner: HomeBannerConfig;
  onPress?: () => void;
  onDismiss: () => void;
}

export function RemoteBanner({ banner, onPress, onDismiss }: Props) {
  if (!banner.visible) return null;

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.wrap}>
      <LinearGradient
        colors={[banner.color, darken(banner.color, 20)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <PressScale onPress={onPress} style={styles.content}>
          <Text style={styles.icon}>🛡️</Text>
          <View style={styles.text}>
            <Text style={styles.title}>{banner.title}</Text>
            <Text style={styles.subtitle}>{banner.subtitle}</Text>
          </View>
          <Text style={styles.cta}>Jaanein →</Text>
        </PressScale>
        <PressScale onPress={onDismiss} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </PressScale>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  banner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: { fontSize: 22 },
  text: { flex: 1 },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  cta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
  close: {
    marginLeft: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.white,
    fontSize: 12,
  },
});
