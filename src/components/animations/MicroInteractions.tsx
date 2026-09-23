import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '../../constants';
import { PressableScale } from '../common/PressableScale';
import type { Medicine, MedicineTiming } from '../../types';
import { mealRelationLabel, timingLabel } from '../../utils/helpers';

interface SwipeProps {
  medicine: Medicine;
  onDelete: (id: string) => void;
  onMarkTaken?: (id: string, timing: MedicineTiming) => void;
}

export function SwipeableMedicineCard({ medicine, onDelete, onMarkTaken }: SwipeProps) {
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const confirmDelete = (id: string) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(id);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -88);
        deleteOpacity.value = interpolate(translateX.value, [0, -88], [0, 1]);
      }
    })
    .onEnd(() => {
      if (translateX.value < -64) {
        runOnJS(confirmDelete)(medicine.id);
      }
      translateX.value = withSpring(0);
      deleteOpacity.value = withTiming(0);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  return (
    <View style={styles.swipeWrap}>
      <Animated.View style={[styles.deleteBg, deleteStyle]}>
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>
          <MedicineCardContent medicine={medicine} onMarkTaken={onMarkTaken} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function MedicineCardContent({
  medicine,
  onMarkTaken,
}: {
  medicine: Medicine;
  onMarkTaken?: (id: string, timing: MedicineTiming) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {medicine.name} {medicine.dosage}
          </Text>
          <Text style={styles.meta}>
            {medicine.timing.map(timingLabel).join(' · ')} ·{' '}
            {mealRelationLabel(medicine.mealRelation)}
          </Text>
        </View>
      </View>
      <View style={styles.chips}>
        {medicine.timing.map((t) => {
          const taken = !!medicine.takenToday?.[t];
          return (
            <PressableScale
              key={t}
              disabled={taken || !onMarkTaken}
              onPress={() => onMarkTaken?.(medicine.id, t)}
            >
              <View style={[styles.chip, taken && styles.chipDone]}>
                <Text style={styles.chipText}>{taken ? '✓ ' : ''}{timingLabel(t)}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

interface FabProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FabProps) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);

  const handlePress = () => {
    ripple.value = 0;
    ripple.value = withTiming(1, { duration: 400 });
    scale.value = withSequence(withSpring(0.88), withSpring(1));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(ripple.value, [0, 1], [0.4, 0]),
  }));

  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Animated.View style={[styles.fabRipple, rippleStyle]} />
      <Animated.View style={btnStyle}>
        <PressableScale onPress={handlePress} scaleDown={0.9} haptic={false}>
          <LinearGradient
            colors={['#FF7043', '#FF5722']}
            style={styles.fab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.fabPlus}>+</Text>
          </LinearGradient>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

interface NumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: object;
}

export function AnimatedNumber({ value, prefix = '', suffix = '', style }: NumberProps) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(value, { duration: 900 });
  }, [animValue, value]);

  const display = useSharedValue(`${prefix}${value}${suffix}`);

  useEffect(() => {
    // Keep text in sync for simplicity (Reanimated text derived values need ReText)
    display.value = `${prefix}${value}${suffix}`;
  }, [display, prefix, suffix, value]);

  return (
    <Text style={[styles.number, style]}>
      {prefix}
      {Math.floor(value)}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  swipeWrap: {
    marginBottom: spacing.md,
  },
  deleteBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.white,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  chipDone: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: colors.success,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.white,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
  },
  fabRipple: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPlus: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: fonts.heading,
  },
  number: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 32,
  },
});
