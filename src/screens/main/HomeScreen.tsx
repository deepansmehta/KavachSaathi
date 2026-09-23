import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { RemoteBanner } from '../../components/home/RemoteBanner';
import { QuickActionGrid } from '../../components/home/QuickActionGrid';
import { TodayMedicines } from '../../components/home/TodayMedicines';
import { MiniCard } from '../../components/card/MiniCard';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { GlassCard } from '../../components/common/GlassCard';
import { PressableScale } from '../../components/common/PressableScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import {
  ScanIcon,
  MedicineIcon,
  SOSIcon,
  BloodIcon,
  ReminderIcon,
} from '../../components/icons/KavachIcons';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useMedicinesStore } from '../../store/medicinesStore';
import { useCardsStore } from '../../store/cardsStore';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';
import { getUserCards } from '../../services/cardOrder.service';
import { formatRelativeTime } from '../../utils/helpers';
import { colors, fonts, spacing, radius } from '../../constants';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const members = useProfileStore((s) => s.members);
  const activeMemberId = useProfileStore((s) => s.activeMemberId);
  const setActiveMember = useProfileStore((s) => s.setActiveMember);
  const activity = useProfileStore((s) => s.activity);
  const medicines = useMedicinesStore((s) => s.medicines);
  const markTaken = useMedicinesStore((s) => s.markTaken);
  const dailyProgress = useMedicinesStore((s) => s.dailyProgress);
  const digitalCardsLen = useCardsStore((s) => s.digitalCards.length);
  const [hasCard, setHasCard] = useState(true);

  const { homeBanner, bannerDismissed, dismissBanner, tipOfDay } = useRemoteConfig();

  useEffect(() => {
    void getUserCards().then((cards) => setHasCard(cards.length > 0));
  }, [digitalCardsLen]);

  const firstName = useMemo(() => {
    const name = user?.name ?? 'Guest';
    return name.split(' ')[0];
  }, [user?.name]);

  const progress = dailyProgress();
  const activeMeds = useMemo(() => medicines.filter((m) => m.active), [medicines]);

  const quickActions = useMemo(
    () => [
      {
        id: 'scan',
        label: 'Scan Prescription',
        accent: colors.teal,
        Icon: ScanIcon,
        onPress: () => navigation.navigate('ScanPrescription'),
      },
      {
        id: 'medicines',
        label: 'Medicines',
        accent: colors.orange,
        Icon: MedicineIcon,
        onPress: () => navigation.navigate('Medicines'),
      },
      {
        id: 'emergency',
        label: 'Emergency Info',
        accent: colors.danger,
        Icon: SOSIcon,
        onPress: () => navigation.navigate('Card'),
      },
      {
        id: 'donor',
        label: 'Blood Donor',
        accent: colors.gold,
        Icon: BloodIcon,
        onPress: () => navigation.navigate('BloodDonor'),
      },
    ],
    [navigation],
  );

  const handleBannerPress = useCallback(() => {
    if (homeBanner.actionUrl.startsWith('http')) {
      void Linking.openURL(homeBanner.actionUrl);
      return;
    }
    navigation.navigate(homeBanner.actionUrl);
  }, [homeBanner.actionUrl, navigation]);

  const activityIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return '📱';
      case 'prescription':
        return '📋';
      case 'medicine':
        return '💊';
      case 'sos':
        return '🆘';
      default:
        return '📌';
    }
  };

  return (
    <ScreenTransition type="slideUp">
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
                <Text style={styles.greeting}>Namaste,</Text>
                <Text style={styles.name}>{firstName}</Text>
              </View>
              <PressableScale onPress={() => navigation.navigate('Notifications')}>
                <View style={styles.bell}>
                  <ReminderIcon size={20} color={colors.white} />
                </View>
              </PressableScale>
            </View>
          </AnimatedEntry>

          {!hasCard ? (
            <AnimatedEntry delay={40}>
              <PressableScale
                onPress={() => navigation.navigate('CardOrder')}
                style={styles.getCardWrap}
              >
                <LinearGradient
                  colors={[colors.orange, '#E64A19']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.getCardBanner}
                >
                  <Text style={styles.bannerTitle}>Get Your KavachSaathi Card</Text>
                  <Text style={styles.bannerSub}>₹249/year · Instant digital card →</Text>
                </LinearGradient>
              </PressableScale>
            </AnimatedEntry>
          ) : null}

          {homeBanner.visible && !bannerDismissed ? (
            <RemoteBanner
              banner={homeBanner}
              onPress={handleBannerPress}
              onDismiss={dismissBanner}
            />
          ) : null}

          {members.length > 0 ? (
            <AnimatedEntry delay={80}>
              <Text style={styles.sectionTitle}>Family cards</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.membersRow}
              >
                {members.map((member) => (
                  <MiniCard
                    key={member.id}
                    member={member}
                    active={member.id === activeMemberId}
                    onPress={() => {
                      setActiveMember(member.id);
                      navigation.navigate('CardDetail', { memberId: member.id });
                    }}
                  />
                ))}
              </ScrollView>
            </AnimatedEntry>
          ) : null}

          <AnimatedEntry delay={120}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <QuickActionGrid actions={quickActions} />
          </AnimatedEntry>

          <AnimatedEntry delay={160}>
            {activeMeds.length > 0 ? (
              <TodayMedicines
                medicines={activeMeds}
                progress={progress}
                onMarkTaken={markTaken}
              />
            ) : (
              <GlassCard style={styles.emptyMeds}>
                <Text style={styles.emptyMedsTitle}>Aaj koi medicine nahi</Text>
                <Text style={styles.emptyMedsSub}>
                  Prescription scan karo ya manually add karo
                </Text>
                <PressableScale onPress={() => navigation.navigate('ScanPrescription')}>
                  <Text style={styles.emptyMedsLink}>Scan Prescription →</Text>
                </PressableScale>
              </GlassCard>
            )}
          </AnimatedEntry>

          {activity.length > 0 ? (
            <AnimatedEntry delay={200}>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <View style={styles.activityList}>
                {activity.slice(0, 5).map((item, index) => (
                  <AnimatedEntry key={item.id} delay={index * 50}>
                    <View style={styles.activityRow}>
                      <Text style={styles.activityIcon}>{activityIcon(item.type)}</Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{item.title}</Text>
                        <Text style={styles.activitySub}>
                          {item.subtitle} · {formatRelativeTime(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </AnimatedEntry>
                ))}
              </View>
            </AnimatedEntry>
          ) : null}

          {tipOfDay ? (
            <AnimatedEntry delay={240}>
              <GlassCard style={styles.tipCard}>
                <Text style={styles.tipLabel}>Aaj ka tip</Text>
                <Text style={styles.tipText}>{tipOfDay}</Text>
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
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getCardWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  getCardBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  bannerTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.white,
  },
  bannerSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 18,
    color: colors.white,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  membersRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyMeds: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  emptyMedsTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.white,
  },
  emptyMedsSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  emptyMedsLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.orange,
    marginTop: spacing.md,
  },
  activityList: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
  },
  activityIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.white,
  },
  activitySub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  tipCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tipLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.gray300,
    lineHeight: 22,
  },
});
