import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

function Particle({
  index,
  active,
  burstKey,
}: {
  index: number;
  active: boolean;
  burstKey: number;
}) {
  const angle = (index / 16) * Math.PI * 2;
  const distance = 55 + (index % 5) * 14;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance;
  const size = 3 + (index % 4);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      x.value = 0;
      y.value = 0;
      return;
    }
    x.value = 0;
    y.value = 0;
    opacity.value = withTiming(1, { duration: 80 });
    x.value = withTiming(targetX, {
      duration: 550 + (index % 4) * 80,
      easing: Easing.out(Easing.cubic),
    });
    y.value = withTiming(targetY, {
      duration: 550 + (index % 4) * 80,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withDelay(480, withTiming(0, { duration: 280 }));
  }, [active, burstKey, index, opacity, targetX, targetY, x, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: opacity.value,
  }));

  const color = index % 3 === 0 ? '#FF1744' : index % 3 === 1 ? '#FF5722' : '#FFFFFF';

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** Radial particle explosion — fire when SOS sends */
export function ParticleBurst({ active }: { active: boolean }) {
  const [burstKey, setBurstKey] = React.useState(0);

  useEffect(() => {
    if (active) setBurstKey((k) => k + 1);
  }, [active]);

  return (
    <View style={styles.anchor} pointerEvents="none">
      {Array.from({ length: 16 }, (_, i) => (
        <Particle key={i} index={i} active={active} burstKey={burstKey} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
