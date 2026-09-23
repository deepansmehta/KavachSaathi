import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../constants';
import { SOSIcon } from '../icons/KavachIcons';

interface Props {
  active?: boolean;
  size?: number;
}

export function SOSPulseRings({ active = true, size = 100 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {[0, 1, 2].map((i) => (
        <PulseRing key={i} index={i} active={active} size={size} />
      ))}
      <View style={styles.core}>
        <SOSIcon size={36} color={colors.white} />
      </View>
    </View>
  );
}

function PulseRing({
  index,
  active,
  size,
}: {
  index: number;
  active: boolean;
  size: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      return;
    }
    const delay = index * 400;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(2.4, { duration: 1600, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 200 }),
          withTiming(0, { duration: 1400 }),
        ),
        -1,
        false,
      ),
    );
  }, [active, index, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF1744',
  },
  core: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF1744',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1744',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
});
