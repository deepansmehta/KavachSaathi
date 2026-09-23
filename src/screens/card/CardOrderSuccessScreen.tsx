import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { colors, fonts, spacing, radius } from '../../constants';
import { PressableScale } from '../../components/common/PressableScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { GlassCard } from '../../components/common/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { ScreenHeader } from '../../components/common/ScreenHeader';

type Params = {
  CardOrderSuccess: {
    cardId: string;
    qrToken: string;
    orderId: string;
    plan: string;
  };
};

export function CardOrderSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'CardOrderSuccess'>>();
  const { cardId, qrToken, orderId, plan } = route.params;

  const checkScale = useSharedValue(0);
  const cardScale = useSharedValue(0.8);

  useEffect(() => {
    checkScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 120 }));
    cardScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 100 }));
  }, [checkScale, cardScale]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <ScreenTransition type="fadeScale">
      <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Order Done"
          onBack={() => navigation.replace('Main')}
        />
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.checkCircle, checkStyle]}>
            <Text style={styles.checkEmoji}>✓</Text>
          </Animated.View>

          <Text style={styles.title}>Card Ordered!</Text>
          <Text style={styles.subtitle}>
            Digital card abhi active hai. Physical card 2–3 din mein ship hoga.
          </Text>

          <Animated.View style={[styles.qrCardWrap, cardStyle]}>
            <GlassCard style={styles.qrCard}>
              <Text style={styles.qrLabel}>YOUR DIGITAL KAVACHSAATHI CARD</Text>
              <Text style={styles.cardIdText}>{cardId}</Text>
              <View style={styles.qrBox}>
                <QRCode
                  value={`https://kavachsaathi.in/e/${qrToken}`}
                  size={150}
                  color={colors.navy}
                  backgroundColor={colors.white}
                />
              </View>
              <Text style={styles.qrHint}>
                Emergency mein koi bhi scan kar sakta hai — login nahi chahiye
              </Text>
              <View style={[styles.planBadge, { backgroundColor: colors.teal + '33' }]}>
                <Text style={[styles.planBadgeText, { color: colors.teal }]}>
                  {plan.toUpperCase()} · ACTIVE
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>{orderId}</Text>
          </View>

          <View style={styles.nextSteps}>
            <Text style={styles.nextTitle}>Aage kya hoga?</Text>
            <Text style={styles.nextItem}>📦  Physical card 2–3 din mein ship</Text>
            <Text style={styles.nextItem}>📬  Tracking notification milega</Text>
            <Text style={styles.nextItem}>🔑  Package ke slip ID se activate karo</Text>
          </View>

          <NeonButton
            label="Fill My Health Profile →"
            onPress={() => navigation.replace('Main')}
            color="#FF5722"
            size="lg"
          />

          <PressableScale
            onPress={() => navigation.navigate('CardActivation')}
            style={{ marginTop: spacing.md }}
          >
            <Text style={styles.activateLink}>Already have the physical card? Activate →</Text>
          </PressableScale>
        </ScrollView>
      </SafeAreaView>
      </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  checkEmoji: {
    fontSize: 40,
    color: colors.success,
    fontFamily: fonts.heading,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 32,
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  qrCardWrap: { width: '100%' },
  qrCard: {
    alignItems: 'center',
    width: '100%',
  },
  qrLabel: {
    color: colors.gray500,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardIdText: {
    color: colors.teal,
    fontFamily: fonts.mono,
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  qrBox: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  qrHint: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  planBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  planBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    marginTop: spacing.md,
  },
  orderLabel: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  orderValue: {
    color: colors.white,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  nextSteps: {
    backgroundColor: colors.navyLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  nextTitle: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  nextItem: {
    color: colors.gray300,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  activateLink: {
    color: colors.teal,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
  },
});
