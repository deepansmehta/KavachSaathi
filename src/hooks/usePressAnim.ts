import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ANIM } from '../constants/animations';

export function usePressAnim() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.96, ANIM.spring);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, ANIM.bounce);
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
