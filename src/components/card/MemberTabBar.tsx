import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FamilyMember } from '../../types';
import { colors, fonts, spacing } from '../../constants';
import { PressScale } from '../common/PressScale';

interface Props {
  members: FamilyMember[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function MemberTabBar({ members, activeId, onSelect, onAdd }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {members.map((m) => {
        const active = m.id === activeId;
        return (
          <PressScale key={m.id} onPress={() => onSelect(m.id)}>
            <View style={styles.tab}>
              <Text style={[styles.label, active && styles.labelActive]}>
                {m.name.split(' ')[0]}
              </Text>
              {active ? <View style={styles.underline} /> : null}
            </View>
          </PressScale>
        );
      })}
      <PressScale onPress={onAdd}>
        <View style={styles.tab}>
          <Text style={styles.add}>+ Add</Text>
        </View>
      </PressScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    alignItems: 'flex-end',
  },
  tab: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.gray500,
  },
  labelActive: {
    fontFamily: fonts.heading,
    color: colors.white,
  },
  underline: {
    marginTop: 6,
    height: 3,
    width: '80%',
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  add: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.orange,
  },
});
