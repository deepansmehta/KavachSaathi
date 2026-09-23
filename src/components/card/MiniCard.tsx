import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { FamilyMember } from '../../types';
import { colors, fonts, radius, spacing } from '../../constants';
import { PressScale } from '../common/PressScale';

interface Props {
  member: FamilyMember;
  active?: boolean;
  onPress: () => void;
}

export function MiniCard({ member, active, onPress }: Props) {
  const isPro = member.cardType === 'pro';

  return (
    <PressScale onPress={onPress} style={[styles.wrap, active && styles.active]}>
      <LinearGradient
        colors={isPro ? [colors.navy, colors.navyLight] : [colors.white, colors.offWhite]}
        style={styles.card}
      >
        <Text style={[styles.name, !isPro && styles.nameDark]} numberOfLines={1}>
          {member.name.split(' ')[0]}
        </Text>
        <View style={styles.blood}>
          <Text style={styles.bloodText}>{member.bloodGroup}</Text>
        </View>
        <Text style={[styles.id, !isPro && styles.idDark]} numberOfLines={1}>
          {member.qrToken.slice(0, 10).toUpperCase()}
        </Text>
      </LinearGradient>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 150,
    marginRight: spacing.md,
  },
  active: {
    transform: [{ scale: 1.05 }],
    borderWidth: 2,
    borderColor: colors.orange,
    borderRadius: radius.lg + 2,
  },
  card: {
    height: 95,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
  },
  nameDark: {
    color: colors.navy,
  },
  blood: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  bloodText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.white,
  },
  id: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.teal,
    letterSpacing: 1,
  },
  idDark: {
    color: colors.gray500,
  },
});
