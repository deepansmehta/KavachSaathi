import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { GlassCard } from '../../components/common/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { ScreenTransition } from '../../components/animations/ScreenTransition';
import { SOSPulseRings } from '../../components/animations/SOSPulseRings';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { ParticleBurst } from '../../components/effects/ParticleBurst';
import { CountdownRing } from '../../components/effects/ProgressRings';
import { useProfileStore } from '../../store/profileStore';
import { triggerSos, callAmbulance108 } from '../../services/sos.service';
import type { EmergencyContact } from '../../types';

const COUNTDOWN_START = 5;

export function SOSScreen() {
  const navigation = useNavigation();
  const getActiveMember = useProfileStore((s) => s.getActiveMember);
  const member = getActiveMember();

  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [sosSent, setSosSent] = useState(false);
  const [sending, setSending] = useState(false);
  const cancelledRef = useRef(false);
  const pulse = useSharedValue(0);

  const contacts = useMemo(
    (): EmergencyContact[] =>
      [member?.emergencyContact1, member?.emergencyContact2].filter(
        (c): c is EmergencyContact => !!c,
      ),
    [member?.emergencyContact1, member?.emergencyContact2],
  );

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.75, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.03]) }],
  }));

  useFocusEffect(
    useCallback(() => {
      cancelledRef.current = false;
      setCountdown(COUNTDOWN_START);
      setSosSent(false);
      setSending(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (cancelledRef.current) return prev;
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        cancelledRef.current = true;
        clearInterval(timer);
      };
    }, []),
  );

  useEffect(() => {
    if (countdown !== 0 || sosSent || sending || cancelledRef.current || !member) return;

    const send = async () => {
      setSending(true);
      try {
        await triggerSos(member, contacts);
        setSosSent(true);
      } catch {
        Alert.alert('Error', 'SOS bhejne mein problem aayi. Dobara try karo.');
      } finally {
        setSending(false);
      }
    };

    void send();
  }, [countdown, sosSent, sending, member, contacts]);

  const handleCancel = () => {
    cancelledRef.current = true;
    setCountdown(COUNTDOWN_START);
    setSosSent(false);
    navigation.goBack();
  };

  return (
    <ScreenTransition type="fadeScale">
      <AnimatedBackground variant="sos">
        <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]} pointerEvents="none" />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.activated}>SOS ACTIVATED</Text>
            <View style={styles.pulseCenter}>
              <SOSPulseRings active={!sosSent} size={110} />
              <View style={styles.burstWrap}>
                <ParticleBurst active={sosSent} />
              </View>
            </View>
            <Text style={styles.subtitle}>
              {sosSent
                ? 'Emergency contacts ko alert bhej diya gaya'
                : 'Contacts ko alert bhejne se pehle countdown'}
            </Text>

            <CountdownRing
              seconds={countdown}
              total={COUNTDOWN_START}
              size={140}
              color="#FF1744"
              done={sosSent}
            />

            {member ? (
              <GlassCard style={styles.contactsCard} glowColor="#FF1744">
                <Text style={styles.contactsTitle}>Emergency Contacts</Text>
                {contacts.length === 0 ? (
                  <Text style={styles.noContacts}>Koi contact set nahi hai</Text>
                ) : (
                  contacts.map((c) => (
                    <View key={c.phone} style={styles.contactRow}>
                      <View>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <Text style={styles.contactMeta}>
                          {c.relation} · {c.phone}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </GlassCard>
            ) : null}

            <View style={styles.actions}>
              {!sosSent ? (
                <Button title="Cancel SOS" variant="outline" onPress={handleCancel} />
              ) : (
                <>
                  <NeonButton
                    label="108 CALL KARO"
                    color="#FF1744"
                    size="lg"
                    loading={sending}
                    onPress={() => void callAmbulance108()}
                  />
                  <Button title="Wapas Jao" variant="ghost" onPress={() => navigation.goBack()} />
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </AnimatedBackground>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  activated: {
    ...textStyles.h1,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 2,
  },
  pulseCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  burstWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  contactsCard: { width: '100%' },
  contactsTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.md,
  },
  noContacts: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray300,
  },
  contactRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  contactName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.white,
  },
  contactMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray300,
    marginTop: 2,
  },
  actions: { width: '100%', gap: spacing.md },
});
