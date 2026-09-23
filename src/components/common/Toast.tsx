import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { colors, fonts, radius, spacing, ANIM } from '../../constants';

type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  tone: ToastTone;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  tone: 'info',
  show: (message, tone = 'info') => set({ visible: true, message, tone }),
  hide: () => set({ visible: false }),
}));

export function toast(message: string, tone: ToastTone = 'info') {
  useToastStore.getState().show(message, tone);
}

const TONE_BAR: Record<ToastTone, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.teal,
};

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const { visible, message, tone, hide } = useToastStore();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    setMounted(true);
    translateY.value = withSpring(0, ANIM.spring);
    opacity.value = withTiming(1, { duration: ANIM.fast });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: ANIM.normal });
      opacity.value = withTiming(0, { duration: ANIM.normal }, (finished) => {
        if (finished) {
          runOnJS(hide)();
          runOnJS(setMounted)(false);
        }
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [visible, message, hide, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.host, { top: insets.top + 10 }, animStyle]}
    >
      <View style={styles.toast}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.leftBar, { backgroundColor: TONE_BAR[tone] }]} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(9,20,42,0.55)',
  },
  leftBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 3,
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.white,
  },
});
