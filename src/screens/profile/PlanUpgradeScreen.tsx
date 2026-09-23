import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useAuthStore } from '../../store/authStore';

const STANDARD_FEATURES = [
  '1 Health Card',
  'Basic medicine reminders',
  'SOS alerts',
  'QR scan history',
];

const PRO_FEATURES = [
  'Unlimited family cards',
  'Pro card design + NFC',
  'AI prescription scan',
  'Priority SOS routing',
  'Chemist WhatsApp share',
  'Advanced health logs',
];

export function PlanUpgradeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const currentPlan = user?.plan ?? 'standard';
  const isPro = currentPlan === 'pro';

  const handleUpgrade = () => {
    if (!user || user.uid === 'guest') {
      Alert.alert('Login chahiye', 'Plan upgrade ke liye login karo.');
      return;
    }
    navigation.navigate('CardOrder');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Plan Upgrade" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Apne parivaar ki safety ke liye Pro plan choose karo
        </Text>

        <View style={styles.plans}>
          <GlassCard style={{ ...styles.planCard, ...(!isPro ? styles.planActive : {}) }}>
            <Text style={styles.planName}>Standard</Text>
            <Text style={styles.planPrice}>₹249/yr</Text>
            {STANDARD_FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
            {currentPlan === 'standard' ? (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Current Plan</Text>
              </View>
            ) : null}
          </GlassCard>

          <GlassCard style={{ ...styles.planCard, ...styles.proCard, ...(isPro ? styles.planActive : {}) }}>
            <Text style={[styles.planName, styles.proName]}>Pro</Text>
            <Text style={[styles.planPrice, styles.proPrice]}>₹449/yr</Text>
            {PRO_FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={[styles.check, styles.proCheck]}>★</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
            {isPro ? (
              <View style={[styles.currentBadge, styles.proBadge]}>
                <Text style={styles.currentText}>Current Plan</Text>
              </View>
            ) : null}
          </GlassCard>
        </View>

        {!isPro ? (
          <Button title="Order Card / Upgrade" onPress={handleUpgrade} />
        ) : (
          <Text style={styles.alreadyPro}>Aap already Pro plan par ho! 🛡️</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...textStyles.body },
  plans: { gap: spacing.lg },
  planCard: { position: 'relative' },
  proCard: {
    borderColor: colors.gold,
    borderWidth: 1,
  },
  planActive: {
    borderColor: colors.teal,
    borderWidth: 1.5,
  },
  planName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  proName: { color: colors.gold },
  planPrice: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.teal,
    marginBottom: spacing.md,
  },
  proPrice: { color: colors.gold },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  check: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.teal,
    width: 18,
  },
  proCheck: { color: colors.gold },
  featureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray300,
    lineHeight: 20,
  },
  currentBadge: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.tealGlow,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  proBadge: {
    backgroundColor: colors.goldGlow,
    borderColor: colors.gold,
  },
  currentText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.white,
  },
  alreadyPro: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.gold,
    textAlign: 'center',
  },
});
