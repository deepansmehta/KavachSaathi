import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radius, spacing, textStyles, ANIM } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { recognizePrescription, pickPrescriptionImage } from '../../services/ocr.service';
import type { OcrSource } from '../../services/ocr.service';
import { useMedicinesStore } from '../../store/medicinesStore';
import type { ExtractedMedicine, Medicine, MealRelation, MedicineTiming } from '../../types';
import { mealRelationLabel, timingLabel } from '../../utils/helpers';
import { toast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';

type ScreenState = 'camera' | 'processing' | 'results';

const TIMINGS: MedicineTiming[] = ['morning', 'afternoon', 'evening', 'night'];
const MEALS: MealRelation[] = ['before', 'after', 'with', 'any'];

function CornerBracket({ style }: { style?: object }) {
  return <Animated.View style={[styles.bracket, style]} />;
}

export function ScanPrescriptionScreen() {
  const navigation = useNavigation();
  const addMedicine = useMedicinesStore((s) => s.addMedicine);
  const addPrescription = useMedicinesStore((s) => s.addPrescription);

  const [screenState, setScreenState] = useState<ScreenState>('camera');
  const [permission, requestPermission] = useCameraPermissions();
  const [results, setResults] = useState<ExtractedMedicine[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrSource, setOcrSource] = useState<OcrSource>('demo');
  const cameraRef = useRef<CameraView>(null);

  const bracketPulse = useSharedValue(1);

  useEffect(() => {
    bracketPulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [bracketPulse]);

  const bracketStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bracketPulse.value }],
  }));

  const processImage = useCallback(async (uri: string) => {
    setImageUri(uri);
    setScreenState('processing');
    try {
      const extracted = await recognizePrescription(uri);
      setResults(extracted.medicines);
      setOcrSource(extracted.source);
      setScreenState('results');
      toast(
        extracted.source === 'mlkit'
          ? 'ML Kit se medicines mili'
          : 'AI demo se medicines extract hui',
        'success',
      );
    } catch {
      toast('Prescription scan nahi ho payi. Dobara try karo.', 'error');
      setScreenState('camera');
    }
  }, []);

  const handleCapture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        await processImage(photo.uri);
      }
    } catch {
      Alert.alert('Error', 'Photo capture fail ho gaya.');
    }
  };

  const handleGallery = async () => {
    const uri = await pickPrescriptionImage();
    if (uri) await processImage(uri);
  };

  const updateResult = (index: number, patch: Partial<ExtractedMedicine>) => {
    setResults((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeResult = (index: number) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTiming = (index: number, timing: MedicineTiming) => {
    setResults((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const has = item.timing.includes(timing);
        return {
          ...item,
          timing: has ? item.timing.filter((t) => t !== timing) : [...item.timing, timing],
        };
      }),
    );
  };

  const handleConfirmSave = () => {
    if (results.length === 0) {
      Alert.alert('Kuch nahi mila', 'Kam se kam ek medicine add karo.');
      return;
    }

    const prescriptionId = `rx-${Date.now()}`;
    const now = Date.now();

    results.forEach((item, idx) => {
      const medicine: Medicine = {
        id: `med-${now}-${idx}`,
        name: item.name,
        dosage: item.dosage,
        timing: item.timing.length ? item.timing : ['morning'],
        mealRelation: item.mealRelation,
        startDate: now,
        active: true,
        prescriptionId,
      };
      addMedicine(medicine);
    });

    if (imageUri) {
      addPrescription({
        id: prescriptionId,
        imageUrl: imageUri,
        medicines: results.map((r, idx) => ({
          id: `med-${now}-${idx}`,
          name: r.name,
          dosage: r.dosage,
          timing: r.timing.length ? r.timing : ['morning'],
          mealRelation: r.mealRelation,
          startDate: now,
          active: true,
          prescriptionId,
        })),
        date: now,
        verified: false,
      });
    }

    toast(`${results.length} medicines save ho gayi`, 'success');
    navigation.goBack();
  };

  const hasCamera = permission?.granted;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Prescription Scan" />
      <View style={styles.header}>
        <Text style={styles.hint}>Camera se ya gallery se upload karo</Text>
      </View>

      {screenState === 'camera' && (
        <View style={styles.cameraSection}>
          {hasCamera ? (
            <View style={styles.frameWrap}>
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
              <Animated.View style={[styles.overlay, bracketStyle]} pointerEvents="none">
                <CornerBracket style={styles.topLeft} />
                <CornerBracket style={styles.topRight} />
                <CornerBracket style={styles.bottomLeft} />
                <CornerBracket style={styles.bottomRight} />
              </Animated.View>
            </View>
          ) : (
            <View style={styles.placeholderFrame}>
              <Animated.View style={[styles.overlay, bracketStyle]}>
                <CornerBracket style={styles.topLeft} />
                <CornerBracket style={styles.topRight} />
                <CornerBracket style={styles.bottomLeft} />
                <CornerBracket style={styles.bottomRight} />
              </Animated.View>
              <Text style={styles.placeholderText}>
                {permission?.canAskAgain === false
                  ? 'Camera permission denied — gallery use karo'
                  : 'Camera preview yahan dikhega'}
              </Text>
            </View>
          )}

          <View style={styles.cameraActions}>
            {!hasCamera && permission?.canAskAgain !== false ? (
              <Button title="Camera Allow Karo" onPress={() => void requestPermission()} />
            ) : null}
            {hasCamera ? (
              <Button title="Capture Karo" onPress={() => void handleCapture()} />
            ) : null}
            <Button title="Gallery Se Chuno" variant="secondary" onPress={() => void handleGallery()} />
          </View>
        </View>
      )}

      {screenState === 'processing' && (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.processingText}>AI scan kar raha hai...</Text>
          <Text style={styles.processingSub}>Thoda wait karo, dawaiyan identify ho rahi hain</Text>
        </View>
      )}

      {screenState === 'results' && (
        <View style={styles.results}>
          <View style={styles.sourceRow}>
            <Text style={styles.resultsTitle}>Yeh medicines mili hain</Text>
            <Badge
              label={ocrSource === 'mlkit' ? 'ML Kit' : ocrSource === 'parser' ? 'Parser' : 'Demo AI'}
              tone={ocrSource === 'mlkit' ? 'teal' : 'gold'}
            />
          </View>
          {results.map((item, index) => (
            <AnimatedEntry key={`${item.name}-${index}`} delay={index * ANIM.cardStagger}>
              <GlassCard style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <TextInput
                    style={styles.nameInput}
                    value={item.name}
                    onChangeText={(text) => updateResult(index, { name: text })}
                    placeholderTextColor={colors.gray500}
                  />
                  <Pressable onPress={() => removeResult(index)}>
                    <Text style={styles.removeBtn}>Hatao</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={styles.dosageInput}
                  value={item.dosage}
                  onChangeText={(text) => updateResult(index, { dosage: text })}
                  placeholder="Dosage"
                  placeholderTextColor={colors.gray500}
                />
                <Text style={styles.chipLabel}>Timing</Text>
                <View style={styles.chips}>
                  {TIMINGS.map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.chip, item.timing.includes(t) && styles.chipActive]}
                      onPress={() => toggleTiming(index, t)}
                    >
                      <Text
                        style={[styles.chipText, item.timing.includes(t) && styles.chipTextActive]}
                      >
                        {timingLabel(t)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.chipLabel}>Meal</Text>
                <View style={styles.chips}>
                  {MEALS.map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.chip, item.mealRelation === m && styles.chipActive]}
                      onPress={() => updateResult(index, { mealRelation: m })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          item.mealRelation === m && styles.chipTextActive,
                        ]}
                      >
                        {mealRelationLabel(m)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {item.confidence === 'low' ? (
                  <Text style={styles.lowConf}>⚠️ Low confidence — verify karo</Text>
                ) : null}
              </GlassCard>
            </AnimatedEntry>
          ))}

          <View style={styles.resultActions}>
            <Button title="Confirm & Save" onPress={handleConfirmSave} />
            <Button
              title="Dobara Scan"
              variant="ghost"
              onPress={() => {
                setResults([]);
                setScreenState('camera');
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const bracketBase = {
  position: 'absolute' as const,
  width: 28,
  height: 28,
  borderColor: colors.teal,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  hint: { ...textStyles.body, marginTop: spacing.xs },
  cameraSection: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  frameWrap: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceDark,
    minHeight: 320,
  },
  camera: { flex: 1 },
  placeholderFrame: {
    flex: 1,
    minHeight: 320,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  bracket: {},
  topLeft: {
    ...bracketBase,
    top: spacing.lg,
    left: spacing.lg,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    ...bracketBase,
    top: spacing.lg,
    right: spacing.lg,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    ...bracketBase,
    bottom: spacing.lg,
    left: spacing.lg,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    ...bracketBase,
    bottom: spacing.lg,
    right: spacing.lg,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraActions: { gap: spacing.md },
  processing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  processingText: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.white,
  },
  processingSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
  },
  results: { flex: 1, padding: spacing.lg, gap: spacing.md },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  resultsTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
  },
  resultCard: { marginBottom: spacing.sm },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
    marginRight: spacing.sm,
  },
  dosageInput: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gray300,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingBottom: spacing.xs,
  },
  removeBtn: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.danger,
  },
  chipLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 13,
    color: colors.gray500,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  lowConf: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  resultActions: { gap: spacing.md, marginTop: spacing.md, paddingBottom: spacing.lg },
});
