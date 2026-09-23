import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CountdownRingProps {
  seconds: number;
  total?: number;
  size?: number;
  color?: string;
  done?: boolean;
}

export function CountdownRing({
  seconds,
  total = 5,
  size = 120,
  color = '#FF1744',
  done = false,
}: CountdownRingProps) {
  const RADIUS = (size - 12) / 2;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, seconds / total), {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });
  }, [seconds, total, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUM * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke={`${color}33`}
          strokeWidth={6}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${CIRCUM}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.num, { color }]}>{done ? '✓' : seconds}</Text>
    </View>
  );
}

interface MedicineProgressRingProps {
  taken: number;
  total: number;
  color?: string;
  size?: number;
}

export function MedicineProgressRing({
  taken,
  total,
  color = '#22D3EE',
  size = 80,
}: MedicineProgressRingProps) {
  const RADIUS = (size - 16) / 2;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const progress = useSharedValue(0);
  const ratio = total > 0 ? taken / total : 0;

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [ratio, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUM * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={5}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${CIRCUM}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.medLabel}>
        {taken}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  num: {
    fontFamily: fonts.heading,
    fontSize: 42,
  },
  medLabel: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
