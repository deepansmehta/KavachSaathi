import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MemberTabBar } from '../../components/card/MemberTabBar';
import { HealthCard } from '../../components/card/HealthCard';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { PressScale } from '../../components/common/PressScale';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { useProfileStore } from '../../store/profileStore';
import { shareGeneric } from '../../services/whatsapp.service';
import { toast } from '../../components/common/Toast';
import { colors, fonts, spacing, radius } from '../../constants';
import { CardIcon } from '../../components/icons/KavachIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function CardScreen() {
  const navigation = useNavigation<any>();
  const members = useProfileStore((s) => s.members);
  const activeMemberId = useProfileStore((s) => s.activeMemberId);
  const setActiveMember = useProfileStore((s) => s.setActiveMember);
  const getActiveMember = useProfileStore((s) => s.getActiveMember);

  const [expanded, setExpanded] = useState(false);

  const member = getActiveMember();

  const emergencyUrl = useMemo(
    () => (member ? `https://kavachsaathi.in/e/${member.qrToken}` : ''),
    [member],
  );

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const handleShare = async () => {
    if (!member) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message = [
      '🆘 *KavachSaathi Emergency Link*',
      `Patient: ${member.name}`,
      `Blood Group: ${member.bloodGroup}`,
      '',
      `Emergency info: ${emergencyUrl}`,
      '',
      '— KavachSaathi',
    ].join('\n');
    await shareGeneric(message);
    toast('Emergency link share ho gaya', 'success');
  };

  const handleSave = () => {
    if (!member) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('CardDetail', { memberId: member.id });
  };

  if (!member) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          emoji="🛡️"
          title="Koi card nahi mila"
          subtitle="Pehle family member add karo apna health card banane ke liye"
          actionLabel="Add Member"
          onAction={() => navigation.navigate('AddMember')}
        />
      </SafeAreaView>
    );
  }

  return (
    <ScreenTransition>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntry>
          <View style={styles.titleRow}>
            <CardIcon size={26} color={colors.gold} />
            <Text style={styles.title}>Health Card</Text>
          </View>
          <Text style={styles.subtitle}>Tap / double-tap to flip · Drag to tilt</Text>
        </AnimatedEntry>

        <AnimatedEntry delay={60}>
          <MemberTabBar
            members={members}
            activeId={activeMemberId}
            onSelect={setActiveMember}
            onAdd={() => navigation.navigate('AddMember')}
          />
        </AnimatedEntry>

        <AnimatedEntry delay={120} style={styles.cardWrap}>
          <HealthCard member={member} />
        </AnimatedEntry>

        <AnimatedEntry delay={160}>
          <View style={styles.actions}>
            <Button
              title="Share Emergency Link"
              onPress={() => void handleShare()}
              variant="primary"
              style={styles.actionBtn}
            />
            <Button
              title="Full Card & QR"
              onPress={handleSave}
              variant="secondary"
              style={styles.actionBtn}
            />
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={200}>
          <GlassCard style={styles.detailsCard}>
            <PressScale onPress={toggleExpanded}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>Health details</Text>
                <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
              </View>
            </PressScale>

            {expanded ? (
              <View style={styles.detailsBody}>
                <DetailRow label="Blood Group" value={member.bloodGroup} />
                <DetailRow
                  label="Allergies"
                  value={
                    member.allergies.length > 0
                      ? member.allergies.join(', ')
                      : 'Koi allergy nahi'
                  }
                />
                <DetailRow
                  label="Conditions"
                  value={
                    member.chronicConditions.length > 0
                      ? member.chronicConditions.join(', ')
                      : 'Koi chronic condition nahi'
                  }
                />
                <DetailRow
                  label="Insurance"
                  value={member.insuranceId ?? 'Add karo'}
                />
                <DetailRow
                  label="ABHA"
                  value={member.abhaNumber ?? 'Link karo'}
                />
                {member.pmjayId ? (
                  <DetailRow label="PM-JAY" value={member.pmjayId} />
                ) : null}
              </View>
            ) : (
              <Text style={styles.detailsPreview}>
                {member.bloodGroup} · {member.allergies.length} allergies · Tap to expand
              </Text>
            )}
          </GlassCard>
        </AnimatedEntry>

        <AnimatedEntry delay={240}>
          <Button
            title="Edit Member"
            onPress={() => navigation.navigate('EditMember', { memberId: member.id })}
            variant="outline"
            style={styles.editBtn}
          />
        </AnimatedEntry>
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  cardWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    marginBottom: 0,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 18,
    color: colors.white,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
  },
  detailsPreview: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.sm,
  },
  detailsBody: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
    flex: 1,
  },
  detailValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.white,
    flex: 1.2,
    textAlign: 'right',
  },
  editBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
