import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, spacing } from '../../constants';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';

export function AboutScreen() {
  return (
    <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="About" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedEntry>
            <View style={styles.hero}>
              <LinearGradient
                colors={['#0E2438', '#122040']}
                style={styles.mark}
              >
                <Text style={styles.markLetter}>K</Text>
              </LinearGradient>
              <Text style={styles.appName}>KavachSaathi</Text>
              <Text style={styles.tagline}>Ek Card. Poori Suraksha.</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={60}>
            <GlassCard style={styles.tributeCard} intensity={20}>
              <Text style={styles.tributeLabel}>DEDICATED TO</Text>
              <Text style={styles.tributeName}>Late Shri Ganga Dhar Mehta</Text>
              <View style={styles.yearsRow}>
                <View style={styles.yearPill}>
                  <Text style={styles.yearLabel}>Born</Text>
                  <Text style={styles.yearValue}>1949</Text>
                </View>
                <View style={styles.yearDivider} />
                <View style={styles.yearPill}>
                  <Text style={styles.yearLabel}>Passed</Text>
                  <Text style={styles.yearValue}>2012</Text>
                </View>
              </View>
              <Text style={styles.tributeBody}>
                GDM Technoworld unke naam aur sanskaar se prernit hai — family
                ki sehat aur suraksha ke liye yeh app unki yaad mein.
              </Text>
            </GlassCard>
          </AnimatedEntry>

          <AnimatedEntry delay={120}>
            <GlassCard style={styles.block} intensity={18}>
              <Text style={styles.blockTitle}>Company</Text>
              <Text style={styles.blockBody}>GDM Technoworld Pvt. Ltd.</Text>
              <Text style={styles.blockMeta}>Fatehabad, Haryana · India</Text>
            </GlassCard>
          </AnimatedEntry>

          <AnimatedEntry delay={160}>
            <GlassCard style={styles.block} intensity={18}>
              <Text style={styles.blockTitle}>Mission</Text>
              <Text style={styles.blockBody}>
                Har parivaar ke paas emergency mein turant health info ho —
                physical card + digital profile, ek saath.
              </Text>
            </GlassCard>
          </AnimatedEntry>

          <AnimatedEntry delay={200}>
            <Text style={styles.footer}>
              Built with care · GDM Technoworld
            </Text>
          </AnimatedEntry>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    marginBottom: spacing.md,
  },
  markLetter: {
    fontFamily: fonts.heading,
    fontSize: 38,
    color: colors.teal,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.white,
    letterSpacing: 0.3,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gray300,
    marginTop: spacing.xs,
  },
  version: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  tributeCard: {
    marginBottom: spacing.md,
    borderColor: 'rgba(201, 162, 39, 0.35)',
  },
  tributeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  tributeName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
    marginBottom: spacing.md,
  },
  yearsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  yearPill: {
    flex: 1,
    backgroundColor: 'rgba(201, 162, 39, 0.08)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.2)',
  },
  yearDivider: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(201, 162, 39, 0.4)',
    marginHorizontal: spacing.sm,
  },
  yearLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gray500,
    marginBottom: 2,
  },
  yearValue: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.gold,
  },
  tributeBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray300,
  },
  block: {
    marginBottom: spacing.md,
  },
  blockTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 13,
    color: colors.teal,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  blockBody: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
  },
  blockMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
