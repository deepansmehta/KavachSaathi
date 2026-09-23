import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { openThalSaathi } from '../../services/whatsapp.service';

export function BloodDonorScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const getActiveMember = useProfileStore((s) => s.getActiveMember);

  const member = getActiveMember();
  const bloodGroup = member?.bloodGroup ?? 'Unknown';
  const name = member?.name ?? user?.name ?? 'User';
  const isDonor = user?.isBloodDonor ?? member?.isBloodDonor ?? false;

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, [scale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleMarkDonor = () => {
    if (!user) {
      Alert.alert('Login chahiye', 'Donor mark karne ke liye login karo.');
      return;
    }
    setUser({ ...user, isBloodDonor: !isDonor });
    Alert.alert(
      isDonor ? 'Updated' : 'Shukriya! ❤️',
      isDonor
        ? 'Donor status hata diya gaya.'
        : 'Aap blood donor ke roop mein register ho gaye.',
    );
  };

  const handleThalSaathi = () => {
    void openThalSaathi(bloodGroup, name);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Blood Donor" />
      <View style={styles.content}>
        <Animated.Text style={[styles.heart, heartStyle]}>❤️</Animated.Text>
        <Text style={styles.subtitle}>
          Apna blood group share karo aur ThalSaathi se connect karo
        </Text>

        <GlassCard style={styles.groupCard}>
          <Text style={styles.groupLabel}>Aapka Blood Group</Text>
          <Text style={styles.groupValue}>{bloodGroup}</Text>
          {isDonor ? (
            <View style={styles.donorBadge}>
              <Text style={styles.donorBadgeText}>Registered Donor ✓</Text>
            </View>
          ) : null}
        </GlassCard>

        <GlassCard>
          <Text style={styles.thalTitle}>ThalSaathi Campaign</Text>
          <Text style={styles.thalBody}>
            ThalSaathi app se thalassemia patients ke liye blood donor ban sakte ho.
            Ek click mein register karo!
          </Text>
          <Button
            title="ThalSaathi Kholo"
            variant="secondary"
            onPress={handleThalSaathi}
            style={styles.thalBtn}
          />
        </GlassCard>

        <Button
          title={isDonor ? 'Donor Status Hatao' : 'Main Donor Hoon'}
          variant={isDonor ? 'outline' : 'primary'}
          onPress={handleMarkDonor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  heart: { fontSize: 72, marginTop: spacing.lg },
  subtitle: { ...textStyles.body, textAlign: 'center' },
  groupCard: { width: '100%', alignItems: 'center' },
  groupLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
  },
  groupValue: {
    fontFamily: fonts.heading,
    fontSize: 48,
    color: colors.danger,
    marginVertical: spacing.sm,
  },
  donorBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  donorBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.success,
  },
  thalTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  thalBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray300,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  thalBtn: { marginTop: spacing.sm },
});
