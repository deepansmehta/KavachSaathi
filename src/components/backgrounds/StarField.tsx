import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

function TwinkleStar({
  x,
  y,
  size,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
}) {
  const twinkle = useSharedValue(0.2 + (delay % 800) / 1000);

  useEffect(() => {
    twinkle.value = withRepeat(
      withTiming(0.85, {
        duration: 1200 + delay,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [delay, twinkle]);

  const style = useAnimatedStyle(() => ({ opacity: twinkle.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: '#FFFFFF',
        },
        style,
      ]}
    />
  );
}

/** Twinkling star field for Welcome / auth heroes */
export function StarField({ count = 48 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i * 53) % W) + (i % 4),
        y: ((i * 89) % (H * 0.72)) + (i % 6),
        size: (i % 3) * 0.6 + 0.8,
        delay: (i % 12) * 160,
      })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star, i) => (
        <TwinkleStar key={i} {...star} />
      ))}
    </View>
  );
}
