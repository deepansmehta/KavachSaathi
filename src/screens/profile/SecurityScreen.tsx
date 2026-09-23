import React from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useAuthStore } from '../../store/authStore';

export function SecurityScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const biometricEnabled = user?.biometricEnabled ?? false;

  const toggleBiometric = (value: boolean) => {
    if (!user) {
      Alert.alert('Login chahiye', 'Security settings ke liye login karo.');
      return;
    }
    setUser({ ...user, biometricEnabled: value });
    Alert.alert(
      value ? 'Enabled' : 'Disabled',
      value
        ? 'Biometric lock ab app open karte waqt use hoga.'
        : 'Biometric lock band kar diya gaya.',
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Security" />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Apni app ko secure rakho biometric lock se
        </Text>

        <GlassCard>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.emoji}>🔐</Text>
              <View>
                <Text style={styles.rowTitle}>Biometric Lock</Text>
                <Text style={styles.rowSub}>
                  Face ID / Fingerprint se app unlock karo
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: colors.gray700, true: colors.tealGlow }}
              thumbColor={biometricEnabled ? colors.teal : colors.gray300}
            />
          </View>
        </GlassCard>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🛡️ Biometric data sirf aapke device par store hota hai. KavachSaathi
            kabhi aapka fingerprint ya face data collect nahi karta.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  subtitle: { ...textStyles.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  emoji: { fontSize: 28 },
  rowTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.white,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: 2,
    maxWidth: 220,
  },
  infoBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray300,
    lineHeight: 20,
  },
});
