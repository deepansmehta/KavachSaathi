import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Medicine, MedicineTiming } from '../../types';
import { mealRelationLabel, timingLabel } from '../../utils/helpers';
import { colors, fonts, radius, spacing } from '../../constants';
import { PressScale } from '../common/PressScale';
import { AnimatedEntry } from '../common/AnimatedEntry';
import { GlassCard } from '../common/GlassCard';
import { MedicineProgressRing } from '../effects/ProgressRings';

interface Props {
  medicines: Medicine[];
  progress: number;
  onMarkTaken: (id: string, timing: MedicineTiming) => void;
}

export function TodayMedicines({ medicines, progress, onMarkTaken }: Props) {
  const slots: MedicineTiming[] = ['morning', 'afternoon', 'evening', 'night'];

  const { taken, total } = useMemo(() => {
    let t = 0;
    let n = 0;
    for (const med of medicines) {
      if (!med.active) continue;
      for (const slot of med.timing) {
        n += 1;
        if (med.takenToday?.[slot]) t += 1;
      }
    }
    if (n === 0) {
      return { taken: Math.round(progress / 100), total: 1 };
    }
    return { taken: t, total: n };
  }, [medicines, progress]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Aaj ki medicines</Text>
        <MedicineProgressRing taken={taken} total={total} size={64} />
      </View>

      {slots.map((slot) => {
        const items = medicines.filter((m) => m.active && m.timing.includes(slot));
        if (items.length === 0) return null;

        return (
          <View key={slot} style={styles.slot}>
            <Text style={styles.slotTitle}>{timingLabel(slot)}</Text>
            {items.map((med, index) => {
              const takenSlot = !!med.takenToday?.[slot];
              return (
                <AnimatedEntry key={`${med.id}-${slot}`} delay={index * 60}>
                  <GlassCard style={styles.rowCard} noPadding>
                    <View style={styles.row}>
                      <View style={styles.info}>
                        <Text style={styles.name}>
                          {med.name} {med.dosage}
                        </Text>
                        <Text style={styles.meta}>{mealRelationLabel(med.mealRelation)}</Text>
                      </View>
                      <PressScale
                        onPress={() => {
                          if (!takenSlot) {
                            void Haptics.notificationAsync(
                              Haptics.NotificationFeedbackType.Success,
                            );
                            onMarkTaken(med.id, slot);
                          }
                        }}
                        disabled={takenSlot}
                      >
                        <View style={[styles.check, takenSlot && styles.checkDone]}>
                          <Text style={styles.checkText}>{takenSlot ? '✓' : ''}</Text>
                        </View>
                      </PressScale>
                    </View>
                  </GlassCard>
                </AnimatedEntry>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.headingMedium,
    fontSize: 18,
    color: colors.white,
  },
  slot: {
    marginBottom: spacing.md,
  },
  slotTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gray500,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rowCard: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.white,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  check: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.teal,
  },
  checkText: {
    color: colors.navy,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
});
