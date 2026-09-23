import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, textStyles } from '../../constants';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

export function MaintenanceScreen() {
  const { maintenance } = useRemoteConfig();
  const message =
    maintenance.message ||
    'Hum thodi der ke liye maintenance kar rahe hain. Jald wapas aayenge!';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.navy, colors.navyLight, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🔧</Text>
          <Text style={textStyles.h2}>Maintenance Mode</Text>
          <Text style={styles.message}>{message}</Text>
          <ActivityIndicator size="large" color={colors.teal} style={styles.loader} />
          <Text style={styles.footer}>KavachSaathi · Jald wapas milenge</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emoji: { fontSize: 64 },
  message: {
    ...textStyles.body,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 320,
  },
  loader: { marginTop: spacing.md },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
