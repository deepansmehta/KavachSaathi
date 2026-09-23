import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants';

type BadgeTone = 'orange' | 'teal' | 'gold' | 'success' | 'danger' | 'neutral';

interface Props {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
}

const TONE: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  orange: { bg: 'rgba(255,87,34,0.18)', fg: colors.orangeLight, border: colors.orangeGlow },
  teal: { bg: 'rgba(34,211,238,0.15)', fg: colors.teal, border: colors.tealGlow },
  gold: { bg: 'rgba(201,162,39,0.18)', fg: colors.goldLight, border: colors.goldGlow },
  success: { bg: 'rgba(34,197,94,0.18)', fg: colors.success, border: 'rgba(34,197,94,0.35)' },
  danger: { bg: 'rgba(255,68,68,0.18)', fg: colors.danger, border: 'rgba(255,68,68,0.35)' },
  neutral: { bg: colors.glass, fg: colors.gray300, border: colors.glassBorder },
};

export function Badge({ label, tone = 'neutral', style }: Props) {
  const c = TONE[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  text: {
    fontFamily: fonts.headingMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
