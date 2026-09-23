import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

type TransitionType = 'slideUp' | 'fadeScale' | 'slideLeft';

interface Props {
  children: React.ReactNode;
  delay?: number;
  type?: TransitionType;
  style?: StyleProp<ViewStyle>;
}

export function ScreenTransition({
  children,
  delay = 0,
  type = 'slideUp',
  style,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, { damping: 18, stiffness: 120 }));
  }, [delay, progress]);

  const animStyle = useAnimatedStyle(() => {
    if (type === 'fadeScale') {
      return {
        opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
        transform: [
          { scale: interpolate(progress.value, [0, 1], [0.88, 1], Extrapolation.CLAMP) },
        ],
      };
    }
    if (type === 'slideLeft') {
      return {
        opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
        transform: [
          { translateX: interpolate(progress.value, [0, 1], [-30, 0], Extrapolation.CLAMP) },
        ],
      };
    }
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [40, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  return <Animated.View style={[{ flex: 1 }, animStyle, style]}>{children}</Animated.View>;
}

interface StaggerProps {
  children: React.ReactNode;
  staggerMs?: number;
}

export function StaggerChildren({ children, staggerMs = 80 }: StaggerProps) {
  const items = React.Children.toArray(children);
  return (
    <>
      {items.map((child, i) => (
        <ScreenTransition key={i} delay={i * staggerMs} type="slideUp" style={{ flex: 0 }}>
          {child}
        </ScreenTransition>
      ))}
    </>
  );
}
