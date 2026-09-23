import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { PressScale } from '../../components/common/PressScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, spacing, radius } from '../../constants';
import * as Haptics from 'expo-haptics';
import {
  ProfileIcon,
  ReminderIcon,
  BloodIcon,
  SettingsIcon,
  DoctorIcon,
  CardIcon,
  type IconProps,
} from '../../components/icons/KavachIcons';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { BottomSheetHandle } from '../../components/common/GlassCard';

interface MenuItem {
  id: string;
  label: string;
  screen: string;
  Icon: React.ComponentType<IconProps>;
  tone?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'edit', label: 'Edit Profile', screen: 'EditProfile', Icon: ProfileIcon },
  { id: 'plan', label: 'Plan Upgrade', screen: 'PlanUpgrade', Icon: CardIcon, tone: colors.gold },
  { id: 'donor', label: 'Blood Donor', screen: 'BloodDonor', Icon: BloodIcon, tone: colors.danger },
  { id: 'notif', label: 'Notifications', screen: 'Notifications', Icon: ReminderIcon, tone: colors.warning },
  { id: 'security', label: 'Security', screen: 'Security', Icon: SettingsIcon },
  { id: 'help', label: 'Help', screen: 'Help', Icon: DoctorIcon, tone: colors.teal },
  { id: 'about', label: 'About', screen: 'About', Icon: SettingsIcon },
];

function planLabel(plan: string | undefined): string {
  switch (plan) {
    case 'pro':
      return 'Pro Plan';
    case 'standard':
      return 'Standard Plan';
    case 'guest':
      return 'Guest Mode';
    default:
      return 'Free Plan';
  }
}

function planColor(plan: string | undefined): string {
  switch (plan) {
    case 'pro':
      return colors.gold;
    case 'guest':
      return colors.gray500;
    default:
      return colors.teal;
  }
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const signOut = useAuthStore((s) => s.signOut);

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'G';

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Kya aap logout karna chahte ho?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            signOut();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              }),
            );
          },
        },
      ],
    );
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
          <View style={styles.profileHeader}>
            <BottomSheetHandle />
            <View style={[styles.avatar, user?.plan === 'pro' && styles.avatarPro]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <View style={[styles.planBadge, { borderColor: planColor(user?.plan) }]}>
              <Text style={[styles.planText, { color: planColor(user?.plan) }]}>
                {planLabel(user?.plan)}
              </Text>
            </View>
            <Text style={styles.healthId}>{user?.healthId ?? 'KVS-GUEST'}</Text>
          </View>
        </AnimatedEntry>

        {isGuest ? (
          <AnimatedEntry delay={60}>
            <GlassCard style={styles.guestBanner}>
              <Text style={styles.guestTitle}>Guest mode</Text>
              <Text style={styles.guestSub}>
                Sign in karo taaki aapka data save ho, family cards sync hon,
                aur emergency info share kar sako.
              </Text>
              <Button
                title="Sign In / Sign Up"
                onPress={() => navigation.navigate('Welcome')}
                variant="primary"
                style={styles.guestBtn}
              />
            </GlassCard>
          </AnimatedEntry>
        ) : null}

        <AnimatedEntry delay={100}>
          <View style={styles.menu}>
            {MENU_ITEMS.map((item, index) => (
              <AnimatedEntry key={item.id} delay={120 + index * 40}>
                <PressScale onPress={() => navigation.navigate(item.screen)}>
                  <View style={styles.menuRow}>
                    <item.Icon size={22} color={item.tone ?? colors.white} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </PressScale>
              </AnimatedEntry>
            ))}
          </View>
        </AnimatedEntry>

        {!isGuest ? (
          <AnimatedEntry delay={400}>
            <View style={styles.signOutWrap}>
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="danger"
              />
            </View>
          </AnimatedEntry>
        ) : null}

        <AnimatedEntry delay={440}>
          <Text style={styles.version}>KavachSaathi v1.0.0</Text>
          <Text style={styles.dedication}>
            In memory of Late Shri Ganga Dhar Mehta · 1949–2012
          </Text>
        </AnimatedEntry>
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  avatarPro: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '22',
  },
  avatarText: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.white,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
    textAlign: 'center',
  },
  planBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  planText: {
    fontFamily: fonts.headingMedium,
    fontSize: 13,
  },
  healthId: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.teal,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  guestBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  guestTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 16,
    color: colors.white,
  },
  guestSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  guestBtn: {
    marginTop: spacing.md,
  },
  menu: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    gap: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.white,
  },
  menuChevron: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.gray500,
  },
  signOutWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  dedication: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    opacity: 0.85,
  },
});
