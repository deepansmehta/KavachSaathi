import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { FamilyMember } from '../../types';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { GlassCard } from '../../components/common/GlassCard';
import { PressScale } from '../../components/common/PressScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { colors, fonts, spacing, radius } from '../../constants';
import { FamilyIcon } from '../../components/icons/KavachIcons';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';

function MemberRow({
  member,
  onPress,
}: {
  member: FamilyMember;
  onPress: () => void;
}) {
  const isPro = member.cardType === 'pro';

  return (
    <PressScale onPress={onPress}>
      <GlassCard style={styles.memberCard} glowColor={isPro ? colors.gold : colors.teal}>
        <View style={styles.memberRow}>
          <View style={[styles.avatar, isPro && styles.avatarPro]}>
            <Text style={styles.avatarText}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberMeta}>
              {member.relation} · {member.bloodGroup}
            </Text>
          </View>
          <View style={styles.memberBadges}>
            {isPro ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            ) : null}
            {member.cardActivated ? (
              <Text style={styles.activeDot}>●</Text>
            ) : (
              <Text style={styles.inactiveDot}>○</Text>
            )}
          </View>
        </View>
      </GlassCard>
    </PressScale>
  );
}

export function FamilyScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const members = useProfileStore((s) => s.members);

  const isPro = user?.plan === 'pro';
  const maxMembers = isPro ? 10 : 2;

  const handleMemberPress = (member: FamilyMember) => {
    navigation.navigate('FamilyMemberDetail', { memberId: member.id });
  };

  return (
    <ScreenTransition>
    <AnimatedBackground variant="navy">
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntry>
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <FamilyIcon size={24} color={colors.teal} />
                <Text style={styles.title}>Family</Text>
              </View>
              <Text style={styles.subtitle}>
                {members.length}/{maxMembers} members
              </Text>
            </View>
            <PressScale onPress={() => navigation.navigate('AddMember')}>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </View>
            </PressScale>
          </View>
        </AnimatedEntry>

        {!isPro ? (
          <AnimatedEntry delay={60}>
            <LinearGradient
              colors={[colors.gold + '44', colors.orange + '22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeBanner}
            >
              <Text style={styles.upgradeEmoji}>⭐</Text>
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Pro plan unlock karo</Text>
                <Text style={styles.upgradeSub}>
                  10 family members, NFC cards aur zyada features
                </Text>
              </View>
              <Button
                title="Upgrade"
                onPress={() => navigation.navigate('PlanUpgrade')}
                variant="primary"
                fullWidth={false}
                style={styles.upgradeBtn}
              />
            </LinearGradient>
          </AnimatedEntry>
        ) : null}

        {members.length === 0 ? (
          <EmptyState
            emoji="👨‍👩‍👧‍👦"
            title="Abhi koi member nahi"
            subtitle="Apne parivaar ke health cards ek jagah manage karo"
            actionLabel="Add Member"
            onAction={() => navigation.navigate('AddMember')}
          />
        ) : (
          members.map((member, index) => (
            <AnimatedEntry key={member.id} delay={100 + index * 60}>
              <MemberRow
                member={member}
                onPress={() => handleMemberPress(member)}
              />
            </AnimatedEntry>
          ))
        )}

        {!isPro && members.length >= maxMembers ? (
          <AnimatedEntry delay={200}>
            <GlassCard style={styles.limitCard}>
              <Text style={styles.limitTitle}>Member limit reach ho gayi</Text>
              <Text style={styles.limitSub}>
                Standard plan mein sirf {maxMembers} members add kar sakte ho.
                Pro upgrade karo aur poora parivaar add karo.
              </Text>
              <Button
                title="Pro Plan Dekho"
                onPress={() => navigation.navigate('PlanUpgrade')}
                variant="outline"
                style={styles.limitBtn}
              />
            </GlassCard>
          </AnimatedEntry>
        ) : null}
      </ScrollView>
    </SafeAreaView>
    </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    marginTop: spacing.xs,
  },
  content: {
    paddingBottom: 120,
  },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
  },
  addBtnText: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.white,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gold + '55',
    gap: spacing.sm,
  },
  upgradeEmoji: {
    fontSize: 24,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 15,
    color: colors.white,
  },
  upgradeSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray300,
    marginTop: 2,
  },
  upgradeBtn: {
    minWidth: 90,
  },
  memberCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  avatarPro: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '22',
  },
  avatarText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.white,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontFamily: fonts.headingMedium,
    fontSize: 17,
    color: colors.white,
  },
  memberMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: 2,
  },
  memberBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  proBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  proBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.navy,
    letterSpacing: 1,
  },
  activeDot: {
    fontSize: 12,
    color: colors.success,
  },
  inactiveDot: {
    fontSize: 12,
    color: colors.gray500,
  },
  limitCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  limitTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.orange,
  },
  limitSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  limitBtn: {
    marginTop: spacing.md,
  },
});
