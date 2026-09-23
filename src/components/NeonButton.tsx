import React, { useEffect } from 'react';
import { Text, View, StyleSheet, type TextStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from './common/PressableScale';
import { fonts } from '../constants';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, borderRadius: 10 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, borderRadius: 14 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 19, borderRadius: 18 },
} as const;

export function NeonButton({
  label,
  onPress,
  color = '#FF5722',
  icon,
  size = 'md',
  disabled,
  loading,
}: NeonButtonProps) {
  const glow = useSharedValue(0.4);
  const s = SIZES[size];

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={{ width: '100%' }}>
      <Animated.View
        style={[
          {
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 16,
            elevation: 8,
            borderRadius: s.borderRadius,
            opacity: disabled || loading ? 0.7 : 1,
          },
          glowStyle,
        ]}
      >
        <LinearGradient
          colors={[`${color}EE`, color, `${color}CC`]}
          style={[
            styles.btn,
            {
              paddingVertical: s.paddingVertical,
              paddingHorizontal: s.paddingHorizontal,
              borderRadius: s.borderRadius,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: s.borderRadius, borderWidth: 1, borderColor: `${color}88` },
            ]}
          />
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.text, { fontSize: s.fontSize }]}>
            {loading ? '...' : label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { marginRight: 8 },
  text: {
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    letterSpacing: 0.5,
  } as TextStyle,
});
