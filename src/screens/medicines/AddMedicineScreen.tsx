import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useMedicinesStore } from '../../store/medicinesStore';
import type { MealRelation, MedicineTiming } from '../../types';
import { mealRelationLabel, timingLabel } from '../../utils/helpers';

const TIMINGS: MedicineTiming[] = ['morning', 'afternoon', 'evening', 'night'];
const MEALS: MealRelation[] = ['before', 'after', 'with', 'any'];

export function AddMedicineScreen() {
  const navigation = useNavigation();
  const addMedicine = useMedicinesStore((s) => s.addMedicine);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState<MedicineTiming[]>(['morning']);
  const [mealRelation, setMealRelation] = useState<MealRelation>('after');
  const [saving, setSaving] = useState(false);

  const toggleTiming = (t: MedicineTiming) => {
    setTiming((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Naam zaroori hai', 'Medicine ka naam likho.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Dosage zaroori hai', 'Dosage likho, jaise 500mg.');
      return;
    }
    if (timing.length === 0) {
      Alert.alert('Timing chuno', 'Kam se kam ek time select karo.');
      return;
    }

    setSaving(true);
    addMedicine({
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim(),
      timing,
      mealRelation,
      startDate: Date.now(),
      active: true,
    });
    setSaving(false);

    Alert.alert('Saved!', 'Medicine add ho gayi.', [
      { text: 'Theek hai', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Nayi Medicine" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Manually dawai add karo</Text>

        <Input
          label="Medicine ka naam"
          placeholder="jaise Metformin"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Dosage"
          placeholder="jaise 500mg"
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={styles.sectionLabel}>Kab leni hai?</Text>
        <View style={styles.chips}>
          {TIMINGS.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, timing.includes(t) && styles.chipActive]}
              onPress={() => toggleTiming(t)}
            >
              <Text style={[styles.chipText, timing.includes(t) && styles.chipTextActive]}>
                {timingLabel(t)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Khaane ke saath?</Text>
        <View style={styles.chips}>
          {MEALS.map((m) => (
            <Pressable
              key={m}
              style={[styles.chip, mealRelation === m && styles.chipActive]}
              onPress={() => setMealRelation(m)}
            >
              <Text style={[styles.chipText, mealRelation === m && styles.chipTextActive]}>
                {mealRelationLabel(m)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title="Save Karo" loading={saving} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...textStyles.body, marginBottom: spacing.lg },
  sectionLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.gray300,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealGlow,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gray300,
  },
  chipTextActive: { color: colors.teal },
});
