import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../../constants';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';

interface Props {
  title: string;
  body: string;
}

export function InfoScreen({ title, body }: Props) {
  return (
    <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title={title} />
        <ScrollView contentContainerStyle={styles.content}>
          <AnimatedEntry>
            <GlassCard intensity={18}>
              <Text style={styles.body}>{body}</Text>
            </GlassCard>
          </AnimatedEntry>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.gray300,
    lineHeight: 26,
  },
});
