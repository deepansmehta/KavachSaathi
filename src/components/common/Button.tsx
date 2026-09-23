import React from 'react';
import {
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native-gesture-handler';
import { colors, fonts, radius, spacing } from '../../constants';
import { usePressAnim } from '../../hooks/usePressAnim';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'apple' | 'google';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: Props) {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnim();
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'google' ? colors.gray900 : colors.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, textStyles[variant], textStyle]}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <Animated.View style={[fullWidth && styles.full, animatedStyle, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          style={[styles.base, isDisabled && styles.disabled]}
        >
          <LinearGradient
            colors={[colors.orange, colors.orangeLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {content}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[fullWidth && styles.full, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={[styles.base, variantStyles[variant], isDisabled && styles.disabled]}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  full: { width: '100%' },
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  gradient: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  disabled: { opacity: 0.5 },
});

const variantStyles: Record<Exclude<Variant, 'primary'>, ViewStyle> = {
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.orange,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.danger,
  },
  apple: {
    backgroundColor: '#000000',
  },
  google: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

const textStyles: Record<Variant, TextStyle> = {
  primary: { color: colors.white },
  secondary: { color: colors.white },
  outline: { color: colors.orange },
  ghost: { color: colors.gray300 },
  danger: { color: colors.white },
  apple: { color: colors.white },
  google: { color: colors.gray900 },
};
