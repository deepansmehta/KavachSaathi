import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fonts, spacing, radius } from '../../constants';
import { PressableScale } from '../../components/common/PressableScale';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { NeonButton } from '../../components/NeonButton';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { activateCard } from '../../services/cardOrder.service';
import { useProfileStore } from '../../store/profileStore';

export function CardActivationScreen() {
  const navigation = useNavigation<any>();
  const activeMemberId = useProfileStore((s) => s.activeMemberId);
  const [activationId, setActivationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(0);

  const shake = () => {
    shakeX.value = withSequence(
      withSpring(-10, { damping: 4 }),
      withSpring(10, { damping: 4 }),
      withSpring(-8, { damping: 4 }),
      withSpring(8, { damping: 4 }),
      withSpring(0, { damping: 6 }),
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));
  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const handleActivate = async () => {
    const id = activationId.trim().toUpperCase();
    if (!id.startsWith('KVS-') || id.length < 12) {
      shake();
      Alert.alert(
        'Invalid ID',
        'Slip pe jo Card ID hai woh exactly daalo (e.g. KVS-2026-A7X3K)',
      );
      return;
    }
    setLoading(true);
    try {
      await activateCard(id, activeMemberId ?? undefined);
      setActivated(true);
      successScale.value = withSpring(1, { damping: 8 });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => navigation.replace('Main'), 2000);
    } catch (err: unknown) {
      shake();
      const message =
        err instanceof Error ? err.message : 'Activate nahi ho paya. Dubara try karo.';
      Alert.alert('Activation Failed', message);
    } finally {
      setLoading(false);
    }
  };

  if (activated) {
    return (
      <AnimatedBackground variant="navy">
      <View style={styles.successContainer}>
        <Animated.Text style={[styles.successEmoji, successStyle]}>🎉</Animated.Text>
        <Text style={styles.successTitle}>Card Activated!</Text>
        <Text style={styles.successSub}>
          Aapka physical KavachSaathi card ab live hai.
        </Text>
      </View>
      </AnimatedBackground>
    );
  }

  return (
    <ScreenTransition type="slideUp">
      <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Activate Card" />
        <View style={styles.container}>
          <View style={styles.cardIllustration}>
            <Text style={styles.cardIllustrationText}>💳</Text>
            <Text style={styles.cardIllustrationLabel}>PHYSICAL</Text>
          </View>

          <Text style={styles.title}>Activate Your Card</Text>
          <Text style={styles.subtitle}>
            Package ke andar slip pe Activation ID hai — woh neeche daalo.
          </Text>

          <Animated.View style={[styles.inputWrapper, shakeStyle]}>
            <TextInput
              style={styles.idInput}
              placeholder="KVS-2026-XXXXX"
              placeholderTextColor={colors.gray500}
              value={activationId}
              onChangeText={(v) => setActivationId(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={15}
            />
          </Animated.View>

          <Text style={styles.hint}>Format: KVS-2026-A7X3K</Text>

          <View style={{ width: '100%', marginTop: spacing.lg }}>
            <NeonButton
              label={loading ? 'Activating...' : 'Activate Card'}
              onPress={() => void handleActivate()}
              color="#22D3EE"
              size="lg"
              disabled={loading}
              loading={loading}
            />
          </View>

          <PressableScale onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
            <Text style={styles.skipText}>Abhi card nahi mila</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
      </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIllustration: {
    width: 100,
    height: 65,
    backgroundColor: colors.navyLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold + '66',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardIllustrationText: { fontSize: 28 },
  cardIllustrationLabel: {
    color: colors.gold,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputWrapper: { width: '100%' },
  idInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.teal,
    color: colors.white,
    fontFamily: fonts.mono,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 4,
  },
  hint: {
    color: colors.gray500,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  skipText: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmoji: { fontSize: 80 },
  successTitle: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 32,
    marginTop: spacing.md,
  },
  successSub: {
    color: colors.gray500,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: spacing.xs,
  },
});
