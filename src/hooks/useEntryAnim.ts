import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ANIM } from '../constants/animations';

export function useSlideUp(delay = 0) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, ANIM.spring));
    opacity.value = withDelay(delay, withTiming(1, { duration: ANIM.normal }));
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
}

export function useFadeScale(delay = 0) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, ANIM.spring));
    opacity.value = withDelay(delay, withTiming(1, { duration: ANIM.normal }));
  }, [delay, opacity, scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
}

export function useStagger(index: number, baseDelay = 0) {
  return useSlideUp(baseDelay + index * ANIM.stagger);
}
