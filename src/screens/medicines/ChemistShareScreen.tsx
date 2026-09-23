import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useProfileStore } from '../../store/profileStore';
import { useMedicinesStore } from '../../store/medicinesStore';
import {
  buildChemistMessage,
  shareViaWhatsApp,
  shareGeneric,
  openSms,
} from '../../services/whatsapp.service';

const VERIFY_URL = 'https://kavachsaathi.app/verify';

export function ChemistShareScreen() {
  const navigation = useNavigation();
  const getActiveMember = useProfileStore((s) => s.getActiveMember);
  const medicines = useMedicinesStore((s) => s.medicines.filter((m) => m.active));

  const member = getActiveMember();

  const message = useMemo(() => {
    if (!member) return '';
    return buildChemistMessage(member, medicines, VERIFY_URL);
  }, [member, medicines]);

  const handleCopy = async () => {
    try {
      await shareGeneric(message);
      Alert.alert('Share Sheet', 'Message copy/share karne ke liye option choose karo.');
    } catch {
      Alert.alert('Error', 'Copy nahi ho paya.');
    }
  };

  const handleWhatsApp = async () => {
    try {
      await shareViaWhatsApp(message);
    } catch {
      Alert.alert('Error', 'WhatsApp share nahi ho paya.');
    }
  };

  const handleSms = async () => {
    try {
      await openSms(message);
    } catch {
      Alert.alert('Error', 'SMS open nahi ho paya.');
    }
  };

  if (!member) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Chemist Share" />
        <View style={styles.empty}>
          <Text style={textStyles.h4}>Koi member select nahi hai</Text>
          <Button title="Wapas Jao" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Chemist Ko Bhejo" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          WhatsApp ya SMS se apni medicine list chemist ko share karo
        </Text>

        <GlassCard style={styles.previewCard}>
          <Text style={styles.previewLabel}>Message Preview</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>{message}</Text>
          </View>
        </GlassCard>

        <View style={styles.stats}>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Medicines</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{member.bloodGroup}</Text>
            <Text style={styles.statLabel}>Blood Group</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Copy Karo" variant="secondary" onPress={() => void handleCopy()} />
          <Button
            title="WhatsApp Share"
            onPress={() => void handleWhatsApp()}
            icon={<Text style={styles.waIcon}>💬</Text>}
          />
          <Button title="SMS Bhejo" variant="outline" onPress={() => void handleSms()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...textStyles.body },
  previewCard: {},
  previewLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.teal,
    marginBottom: spacing.md,
  },
  previewBox: {
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  previewText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 22,
    color: colors.gray300,
  },
  stats: { flexDirection: 'row', gap: spacing.md },
  statPill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statNum: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  actions: { gap: spacing.md },
  waIcon: { fontSize: 18 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
