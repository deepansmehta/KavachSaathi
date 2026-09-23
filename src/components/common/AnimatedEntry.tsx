import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeScale, useSlideUp } from '../../hooks/useEntryAnim';

interface Props {
  children: React.ReactNode;
  delay?: number;
  mode?: 'slide' | 'scale';
  style?: StyleProp<ViewStyle>;
}

export function AnimatedEntry({ children, delay = 0, mode = 'slide', style }: Props) {
  const slideStyle = useSlideUp(delay);
  const scaleStyle = useFadeScale(delay);

  return (
    <Animated.View style={[mode === 'slide' ? slideStyle : scaleStyle, style]}>
      {children}
    </Animated.View>
  );
}
