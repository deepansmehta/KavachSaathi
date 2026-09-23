import React, { useEffect } from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  shimmerColors?: string[];
  duration?: number;
}

/**
 * Gold/teal shimmer without MaskedView — safer in Expo Go / all platforms.
 */
export function ShimmerText({
  text,
  style,
  shimmerColors = ['#C9A227', '#FFE082', '#C9A227', '#FFE082', '#C9A227'],
  duration = 2200,
}: ShimmerTextProps) {
  const position = useSharedValue(0);

  useEffect(() => {
    position.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, position]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(position.value, [0, 1], [-80, 80], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(position.value, [0, 0.5, 1], [0.35, 0.9, 0.35]),
  }));

  return (
    <View style={styles.wrap}>
      <Text style={style}>{text}</Text>
      <Animated.View style={[styles.sheen, animStyle]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', shimmerColors[1] ?? '#FFE082', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sheenGrad}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  sheen: {
    ...StyleSheet.absoluteFill,
    width: 60,
  },
  sheenGrad: {
    flex: 1,
    opacity: 0.35,
  },
});
