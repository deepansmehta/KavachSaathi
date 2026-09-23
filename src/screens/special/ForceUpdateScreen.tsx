import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';

const STORE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/kavachsaathi'
    : 'https://play.google.com/store/apps/details?id=com.kavachsaathi.app';

export function ForceUpdateScreen() {
  const { minAppVersion, forceUpdate } = useRemoteConfig();

  const handleUpdate = () => {
    void Linking.openURL(STORE_URL);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.navy, colors.surfaceDark, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.emoji}>⬆️</Text>
          <Text style={textStyles.h2}>Update Zaroori Hai</Text>
          <Text style={styles.message}>
            {forceUpdate
              ? 'App ka naya version available hai. Security aur naye features ke liye abhi update karo.'
              : 'Better experience ke liye latest version install karo.'}
          </Text>

          {minAppVersion ? (
            <View style={styles.versionBox}>
              <Text style={styles.versionLabel}>Minimum version</Text>
              <Text style={styles.versionValue}>v{minAppVersion}+</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button title="Abhi Update Karo" onPress={handleUpdate} />
          </View>

          <Text style={styles.footer}>
            Update ke baad app dubara open karo
          </Text>
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
  versionBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  versionLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
  },
  versionValue: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.orange,
    marginTop: 4,
  },
  actions: { width: '100%', marginTop: spacing.md },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
  },
});
