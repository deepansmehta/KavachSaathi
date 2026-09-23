import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { HealthCard } from '../../components/card/HealthCard';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { shareGeneric } from '../../services/whatsapp.service';
import { shareCardImage } from '../../services/cardExport.service';
import { toast } from '../../components/common/Toast';
import { CardIcon } from '../../components/icons/KavachIcons';
import { PressableScale } from '../../components/common/PressableScale';
import { ScreenHeader } from '../../components/common/ScreenHeader';

type Params = {
  CardDetail: { memberId?: string };
};

export function CardDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Params, 'CardDetail'>>();
  const members = useProfileStore((s) => s.members);
  const getActiveMember = useProfileStore((s) => s.getActiveMember);
  const healthId = useAuthStore((s) => s.user?.healthId);
  const cardShotRef = useRef<ViewShotRef>(null);
  const [exporting, setExporting] = useState(false);

  const member = useMemo(() => {
    const id = route.params?.memberId;
    if (id) return members.find((m) => m.id === id);
    return getActiveMember();
  }, [members, route.params?.memberId, getActiveMember]);

  const emergencyUrl = member ? `https://kavachsaathi.in/e/${member.qrToken}` : '';

  if (!member) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Card" />
        <View style={styles.empty}>
          <Text style={textStyles.h4}>Koi card nahi mila</Text>
          <Text style={styles.emptySub}>Pehle ek family member add karo</Text>
          <Button title="Wapas Jao" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await shareGeneric(
      [
        '🆘 *KavachSaathi Emergency Link*',
        `Patient: ${member.name}`,
        `Blood Group: ${member.bloodGroup}`,
        healthId ? `Health ID: ${healthId}` : '',
        '',
        `Emergency info: ${emergencyUrl}`,
        '',
        '— KavachSaathi · Ek Card. Poori Suraksha.',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    toast('Emergency link share ho gaya', 'success');
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(emergencyUrl);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast('Link copy ho gaya ✓', 'success');
  };

  const handleExportImage = async () => {
    setExporting(true);
    try {
      await shareCardImage(cardShotRef as React.RefObject<unknown>, member);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast('Card image ready — share karein', 'success');
    } catch {
      toast('Card image save nahi ho payi', 'error');
    } finally {
      setExporting(false);
    }
  };

  const nav = navigation as { navigate: (n: string, p?: object) => void; goBack: () => void };

  return (
    <ScreenTransition type="fadeScale">
    <AnimatedBackground variant="card">
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={member.name} subtitle={`${member.relation} · ${member.bloodGroup}`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedEntry>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <CardIcon size={22} color={colors.gold} />
                <Badge
                  label={member.cardType === 'pro' ? 'PRO' : 'STANDARD'}
                  tone={member.cardType === 'pro' ? 'gold' : 'neutral'}
                />
              </View>
            </View>
          </View>
          {healthId ? (
            <Text style={styles.healthId}>{healthId}</Text>
          ) : null}
        </AnimatedEntry>

        <AnimatedEntry delay={80} style={styles.cardWrap}>
          <ViewShot ref={cardShotRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.shotPad}>
              <HealthCard member={member} />
            </View>
          </ViewShot>
          <Text style={styles.flipHint}>Tap card to flip · Save image neeche</Text>
        </AnimatedEntry>

        <AnimatedEntry delay={140}>
          <GlassCard style={styles.qrSection}>
            <Text style={styles.qrTitle}>Emergency QR</Text>
            <Text style={styles.qrHint}>Scanner pe dikhao — login ki zaroorat nahi</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={emergencyUrl}
                size={220}
                backgroundColor={colors.white}
                color={colors.navy}
              />
            </View>
            <Text style={styles.qrToken}>{emergencyUrl.replace('https://', '')}</Text>
            {member.cardActivated ? (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Card Activated ✓</Text>
              </View>
            ) : (
              <Text style={styles.inactiveText}>Card abhi activate nahi hua</Text>
            )}
          </GlassCard>
        </AnimatedEntry>

        <AnimatedEntry delay={180} style={styles.meta}>
          <Detail label="Blood Group" value={member.bloodGroup} />
          <Detail
            label="Allergies"
            value={member.allergies.length ? member.allergies.join(' · ') : 'Koi nahi'}
          />
          <Detail
            label="Conditions"
            value={
              member.chronicConditions.length
                ? member.chronicConditions.join(' · ')
                : 'Koi nahi'
            }
          />
          {member.nfcId ? <Detail label="NFC ID" value={member.nfcId} /> : null}
          {member.abhaNumber ? <Detail label="ABHA" value={member.abhaNumber} /> : null}
          {member.insuranceId ? <Detail label="Insurance" value={member.insuranceId} /> : null}
          <Detail label="Organ Donor" value={member.organDonor ? 'Haan ✓' : 'Nahi'} />
        </AnimatedEntry>

        <AnimatedEntry delay={220} style={styles.actions}>
          {!member.cardActivated ? (
            <PressableScale onPress={() => nav.navigate('CardActivation')}>
              <View style={styles.activatePhysicalBtn}>
                <Text style={styles.activatePhysicalText}>🔑 Activate Physical Card</Text>
              </View>
            </PressableScale>
          ) : null}
          <Button title="Share Emergency Link" onPress={() => void handleShare()} />
          <Button
            title="Save Card Image"
            variant="secondary"
            loading={exporting}
            onPress={() => void handleExportImage()}
          />
          <Button title="Copy Link" variant="outline" onPress={() => void handleCopy()} />
          <Button
            title="Edit Details"
            variant="ghost"
            onPress={() => nav.navigate('EditMember', { memberId: member.id })}
          />
        </AnimatedEntry>
      </ScrollView>
    </SafeAreaView>
    </AnimatedBackground>
    </ScreenTransition>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtitle: { ...textStyles.body, marginTop: 2 },
  healthId: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 1.5,
    color: colors.teal,
    marginTop: spacing.sm,
  },
  cardWrap: { width: '100%', marginVertical: spacing.sm },
  shotPad: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  flipHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  qrSection: { width: '100%', alignItems: 'center' },
  qrTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  qrHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  qrBox: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  qrToken: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.teal,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  activeBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  activeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.success,
  },
  inactiveText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.warning,
    marginTop: spacing.md,
  },
  meta: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    gap: spacing.md,
  },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
  },
  metaValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gray300,
    flex: 1,
    textAlign: 'right',
  },
  actions: { width: '100%', gap: spacing.sm },
  activatePhysicalBtn: {
    backgroundColor: colors.teal + '22',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  activatePhysicalText: {
    color: colors.teal,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptySub: { ...textStyles.body, textAlign: 'center' },
});
