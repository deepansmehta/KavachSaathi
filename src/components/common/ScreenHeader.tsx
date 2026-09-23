import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PressableScale } from './PressableScale';
import { colors, fonts, spacing, radius } from '../../constants';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
  style,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.row, style]}>
      {showBack ? (
        <PressableScale onPress={handleBack} haptic style={styles.backBtn}>
          <View style={styles.backCircle}>
            <Text style={styles.backChevron}>‹</Text>
          </View>
        </PressableScale>
      ) : (
        <View style={styles.backBtn} />
      )}

      <View style={styles.center}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  backBtn: {
    minWidth: 48,
    paddingVertical: 4,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
    lineHeight: 28,
    marginTop: -1,
    marginLeft: -1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: 1,
  },
  right: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
});
