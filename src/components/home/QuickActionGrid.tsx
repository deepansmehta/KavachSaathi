import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../constants';
import { PressableScale } from '../common/PressableScale';
import { AnimatedEntry } from '../common/AnimatedEntry';
import { GlassCard } from '../common/GlassCard';
import type { IconProps } from '../icons/KavachIcons';

interface Action {
  id: string;
  label: string;
  accent: string;
  onPress: () => void;
  Icon: React.ComponentType<IconProps>;
}

interface Props {
  actions: Action[];
}

export function QuickActionGrid({ actions }: Props) {
  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <AnimatedEntry key={action.id} delay={index * 80} style={styles.cell}>
          <PressableScale onPress={action.onPress}>
            <GlassCard
              glowColor={action.accent}
              noPadding
              style={{ ...styles.card, borderColor: `${action.accent}55` }}
            >
              <View style={styles.inner}>
                <View style={[styles.iconWrap, { backgroundColor: `${action.accent}22` }]}>
                  <action.Icon size={24} color={action.accent} />
                </View>
                <Text style={styles.label}>{action.label}</Text>
              </View>
            </GlassCard>
          </PressableScale>
        </AnimatedEntry>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    flexGrow: 1,
  },
  card: {
    minHeight: 100,
  },
  inner: {
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
});
