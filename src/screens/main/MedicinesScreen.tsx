import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import {
  SwipeableMedicineCard,
  AnimatedNumber,
} from '../../components/animations/MicroInteractions';
import { useMedicinesStore } from '../../store/medicinesStore';
import { colors, fonts, spacing } from '../../constants';
import { MedicineIcon } from '../../components/icons/KavachIcons';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { MedicineProgressRing } from '../../components/effects/ProgressRings';
import { GlassCard } from '../../components/common/GlassCard';

export function MedicinesScreen() {
  const navigation = useNavigation<any>();
  const medicines = useMedicinesStore((s) => s.medicines);
  const markTaken = useMedicinesStore((s) => s.markTaken);
  const removeMedicine = useMedicinesStore((s) => s.removeMedicine);
  const dailyProgress = useMedicinesStore((s) => s.dailyProgress);

  const activeMeds = useMemo(
    () => medicines.filter((m) => m.active),
    [medicines],
  );
  const progress = dailyProgress();

  if (activeMeds.length === 0) {
    return (
      <ScreenTransition>
        <AnimatedBackground variant="navy">
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.title}>Medicines</Text>
            <EmptyState
              emoji="💊"
              title="Koi medicine nahi hai"
              subtitle="Prescription scan karo ya manually add karo apni dawai track karne ke liye"
              actionLabel="Scan Prescription"
              onAction={() => navigation.navigate('ScanPrescription')}
            />
            <View style={styles.emptyActions}>
              <Button
                title="Add Medicine"
                onPress={() => navigation.navigate('AddMedicine')}
                variant="outline"
              />
            </View>
          </View>
        </SafeAreaView>
        </AnimatedBackground>
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition>
      <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedEntry>
            <View style={styles.header}>
              <View>
                <Text style={styles.titleInline}>Medicines</Text>
                <Text style={styles.subtitle}>Aaj ka progress track karo</Text>
                <View style={styles.progressRow}>
                  <MedicineIcon size={18} color={colors.teal} />
                  <AnimatedNumber value={progress} suffix="%" style={styles.progressNum} />
                </View>
              </View>
              <MedicineProgressRing
                taken={Math.round((progress / 100) * Math.max(activeMeds.length, 1))}
                total={Math.max(activeMeds.length, 1)}
                size={72}
              />
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={80}>
            <View style={styles.topActions}>
              <Button
                title="Scan Prescription"
                onPress={() => navigation.navigate('ScanPrescription')}
                variant="secondary"
                style={styles.halfBtn}
                fullWidth={false}
              />
              <Button
                title="Add Medicine"
                onPress={() => navigation.navigate('AddMedicine')}
                variant="outline"
                style={styles.halfBtn}
                fullWidth={false}
              />
            </View>
          </AnimatedEntry>

          <View style={styles.listPad}>
            {activeMeds.map((med) => (
              <GlassCard key={med.id} style={styles.medCard} glowColor={colors.teal} noPadding>
                <SwipeableMedicineCard
                  medicine={med}
                  onDelete={removeMedicine}
                  onMarkTaken={(id, timing) => {
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    markTaken(id, timing);
                  }}
                />
              </GlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleInline: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressNum: {
    fontSize: 22,
    color: colors.teal,
  },
  topActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  halfBtn: {
    flex: 1,
  },
  listPad: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  medCard: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  emptyActions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});
