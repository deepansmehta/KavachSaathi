import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderColor?: string;
  glowColor?: string;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 28,
  tint = 'dark',
  borderColor = 'rgba(255,255,255,0.12)',
  glowColor,
  noPadding = false,
}: Props) {
  return (
    <View
      style={[
        styles.wrapper,
        glowColor
          ? {
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 4,
            }
          : null,
        style,
      ]}
    >
      <BlurView intensity={Math.min(intensity, 22)} tint={tint} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={[styles.border, { borderColor }]} />
      <View style={noPadding ? undefined : styles.inner}>{children}</View>
    </View>
  );
}

/** Gold gradient drag handle for sheets / modals */
export function BottomSheetHandle() {
  return (
    <View style={styles.handleWrap}>
      <LinearGradient
        colors={['rgba(201,162,39,0.0)', 'rgba(201,162,39,0.65)', 'rgba(201,162,39,0.0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.handle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.glass,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  inner: {
    padding: spacing.lg,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
});
