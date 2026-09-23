import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type BgVariant = 'navy' | 'light' | 'sos' | 'card';

const GRADIENTS: Record<BgVariant, readonly [string, string, string]> = {
  navy: ['#0A1528', '#0C1829', '#0E1C30'],
  light: ['#0A1528', '#0D1A2E', '#101F36'],
  sos: ['#1A0508', '#22080C', '#2A0A10'],
  card: ['#0A1528', '#0C1A2C', '#0E1E32'],
};

interface AnimatedBackgroundProps {
  variant?: BgVariant;
  children: React.ReactNode;
  /** @deprecated decorative dots removed — kept for API compat, ignored */
  showDots?: boolean;
  /** @deprecated decorative grid removed — kept for API compat, ignored */
  showGrid?: boolean;
  style?: ViewStyle;
}

/**
 * Clean solid gradient background — no floating orbs/dots/particles.
 */
export function AnimatedBackground({
  variant = 'navy',
  children,
  style,
}: AnimatedBackgroundProps) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <LinearGradient
        colors={[...GRADIENTS[variant]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}
