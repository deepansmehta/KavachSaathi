import React, { useEffect } from 'react';
import { Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

interface FloatingHealthIconProps {
  icon: string;
  x: number;
  y: number;
  delay?: number;
  size?: number;
  opacity?: number;
}

export function FloatingHealthIcon({
  icon,
  x,
  y,
  delay = 0,
  size = 28,
  opacity = 0.14,
}: FloatingHealthIconProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-12, {
        duration: 2000 + delay,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    rotate.value = withRepeat(
      withTiming(8, {
        duration: 3000 + delay,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [delay, rotate, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x, top: y, opacity }, style]}
    >
      <Text style={{ fontSize: size }}>{icon}</Text>
    </Animated.View>
  );
}

export const ONBOARDING_FLOATERS = [
  { icon: '💊', x: 20, y: 80, delay: 0 },
  { icon: '🩺', x: W - 60, y: 120, delay: 400 },
  { icon: '❤️', x: 30, y: H - 220, delay: 800 },
  { icon: '🧬', x: W - 50, y: H - 280, delay: 200 },
] as const;
