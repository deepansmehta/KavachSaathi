import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useMedicinesStore } from '../../store/medicinesStore';
import { mealRelationLabel, timingLabel } from '../../utils/helpers';

type Params = {
  PrescriptionDetail: { prescriptionId?: string };
};

export function PrescriptionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Params, 'PrescriptionDetail'>>();
  const prescriptions = useMedicinesStore((s) => s.prescriptions);

  const prescription = useMemo(() => {
    const id = route.params?.prescriptionId;
    if (id) return prescriptions.find((p) => p.id === id);
    return prescriptions[0];
  }, [prescriptions, route.params?.prescriptionId]);

  if (!prescription) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Prescription" />
        <View style={styles.empty}>
          <Text style={textStyles.h4}>Koi prescription nahi mili</Text>
          <Text style={styles.emptySub}>Pehle ek prescription scan karo</Text>
          <Button title="Wapas Jao" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const dateStr = new Date(prescription.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Prescription" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{dateStr}</Text>
        {prescription.doctorName ? (
          <Text style={styles.doctor}>Dr. {prescription.doctorName}</Text>
        ) : null}

        <View style={styles.badgeRow}>
          <View style={[styles.badge, prescription.verified && styles.badgeVerified]}>
            <Text style={styles.badgeText}>
              {prescription.verified ? 'Verified ✓' : 'Unverified'}
            </Text>
          </View>
          <Text style={styles.count}>{prescription.medicines.length} medicines</Text>
        </View>

        {prescription.medicines.map((med, index) => (
          <GlassCard key={med.id} style={styles.medCard}>
            <Text style={styles.medIndex}>{index + 1}</Text>
            <View style={styles.medBody}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
              <Text style={styles.medMeta}>
                {med.timing.map(timingLabel).join(' · ')} · {mealRelationLabel(med.mealRelation)}
              </Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  subtitle: { ...textStyles.body },
  doctor: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.teal,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  badgeVerified: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.white,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  medIndex: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.teal,
    width: 28,
  },
  medBody: { flex: 1 },
  medName: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
  },
  medDosage: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray300,
    marginTop: 2,
  },
  medMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptySub: { ...textStyles.body, textAlign: 'center' },
});
