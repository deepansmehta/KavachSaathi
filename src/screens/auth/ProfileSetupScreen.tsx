import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, spacing, radius, ANIM, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { completeProfileSetup } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useMedicinesStore } from '../../store/medicinesStore';
type AuthStackParamList = {
  Main: undefined;
  ProfileSetup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ProfileSetup'>;

type SelectablePlan = 'standard' | 'pro';

interface PlanOption {
  id: SelectablePlan;
  name: string;
  price: string;
  features: string[];
  accent: string;
}

const PLANS: PlanOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: '₹499 / saal',
    features: ['1 physical card', 'Digital health profile', 'QR emergency scan'],
    accent: colors.white,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999 / saal',
    features: ['6 family cards', 'NFC tap support', 'Priority SOS alerts', 'Gold card design'],
    accent: colors.gold,
  },
];

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanOption;
  selected: boolean;
  onSelect: (id: SelectablePlan) => void;
}) {
  const borderWidth = useSharedValue(selected ? 2 : 1);

  React.useEffect(() => {
    borderWidth.value = withSpring(selected ? 2 : 1, ANIM.spring);
  }, [borderWidth, selected]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  return (
    <Pressable onPress={() => onSelect(plan.id)}>
      <Animated.View
        style={[
          styles.planCard,
          cardAnimStyle,
          selected && styles.planCardSelected,
          plan.id === 'pro' && styles.planCardPro,
        ]}
      >
        {plan.id === 'pro' ? (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        ) : null}

        <Text style={[styles.planName, plan.id === 'pro' && styles.planNamePro]}>
          {plan.name}
        </Text>
        <Text style={[styles.planPrice, { color: plan.accent }]}>{plan.price}</Text>

        {plan.features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.featureBullet}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Animated.View>
    </Pressable>
  );
}

export function ProfileSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [plan, setPlan] = useState<SelectablePlan>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Apna naam zaroor daalein.');
      return;
    }

    if (!user) {
      setError('User session nahi mila. Dobara login karein.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updated = await completeProfileSetup(user, trimmedName, plan);
      setUser(updated);

      const profileState = useProfileStore.getState();
      if (profileState.members.length === 0) {
        profileState.loadDevData();
        useMedicinesStore.getState().loadDevData();
      }

      navigation.navigate('Main');
    } catch {
      setError('Profile save nahi ho paya. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  }, [name, navigation, plan, setUser, user]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.navy, colors.surfaceDark]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Apna profile setup karein</Text>
            <Text style={styles.subtitle}>
              Naam aur plan select karein — card order ke liye ready ho jayenge.
            </Text>

            <Input
              label="Aapka naam"
              placeholder="Jaise — Deepansh Mehta"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              error={error && !name.trim() ? error : undefined}
            />

            <Text style={styles.sectionLabel}>Plan choose karein</Text>

            <View style={styles.plans}>
              {PLANS.map((planOption) => (
                <PlanCard
                  key={planOption.id}
                  plan={planOption}
                  selected={plan === planOption.id}
                  onSelect={setPlan}
                />
              ))}
            </View>

            {error && name.trim() ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              title="Continue karein"
              onPress={() => void handleContinue()}
              loading={loading}
              disabled={loading}
              style={styles.continueBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.gray300,
    marginBottom: spacing.md,
  },
  plans: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.navyLight,
  },
  planCardPro: {
    borderColor: colors.gold,
  },
  proBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  proBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.navy,
    letterSpacing: 1,
  },
  planName: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  planNamePro: {
    color: colors.goldLight,
  },
  planPrice: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureBullet: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.teal,
  },
  featureText: {
    ...textStyles.body,
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  continueBtn: {
    marginTop: spacing.sm,
  },
});
