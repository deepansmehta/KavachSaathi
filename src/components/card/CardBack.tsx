import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { FamilyMember } from '../../types';
import { colors, fonts, radius, spacing } from '../../constants';

interface Props {
  member: FamilyMember;
}

export function CardBack({ member }: Props) {
  const emergencyUrl = `https://kavachsaathi.in/e/${member.qrToken}`;
  const emergencyPhone =
    member.emergencyContact1?.phone ?? member.emergencyContact2?.phone ?? '108';

  return (
    <View style={styles.card}>
      <Text style={styles.scanLabel}>Scan for emergency info</Text>

      <View style={styles.qrWrap}>
        <QRCode
          value={emergencyUrl}
          size={130}
          backgroundColor={colors.white}
          color={colors.navy}
          logoBackgroundColor={colors.white}
        />
        <View style={styles.logoOverlay}>
          <Text style={styles.shield}>🛡️</Text>
        </View>
      </View>

      <Text style={styles.emergency}>
        Emergency: <Text style={styles.phone}>{emergencyPhone}</Text>
      </Text>

      {member.cardType === 'pro' ? (
        <Text style={styles.nfcHint}>NFC enabled · Tap to read</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: colors.navyLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray300,
  },
  qrWrap: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: radius.md,
    position: 'relative',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    fontSize: 22,
    backgroundColor: colors.white,
  },
  emergency: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray300,
  },
  phone: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.orange,
  },
  nfcHint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1,
  },
});
