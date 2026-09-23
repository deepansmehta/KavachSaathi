import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/** Diagonal light sweep across health cards — repeats every ~4s */
export function CardShineSweep() {
  const translateX = useSharedValue(-220);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (cancelled) return;
      translateX.value = -220;
      translateX.value = withTiming(420, {
        duration: 900,
        easing: Easing.out(Easing.quad),
      });
      timeout = setTimeout(run, 4000);
    };

    timeout = setTimeout(run, 1200);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [translateX]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: '20deg' }],
  }));

  return (
    <View style={styles.clip} pointerEvents="none">
      <Animated.View style={[styles.beam, style]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.18)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: 20,
  },
  beam: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    width: 56,
  },
});
