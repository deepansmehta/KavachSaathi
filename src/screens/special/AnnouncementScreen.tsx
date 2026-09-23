import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '../../constants';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Button } from '../../components/common/Button';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';
import { darken } from '../../utils/helpers';

export function AnnouncementScreen() {
  const navigation = useNavigation();
  const { homeBanner, newFeature, offer, tipOfDay } = useRemoteConfig();

  const title = homeBanner.visible
    ? homeBanner.title
    : newFeature.visible
      ? newFeature.title
      : offer.visible
        ? offer.title
        : 'KavachSaathi Update';

  const body = homeBanner.visible
    ? homeBanner.subtitle
    : newFeature.visible
      ? newFeature.description
      : offer.visible
        ? `${offer.discount}% off · Code ${offer.code}`
        : tipOfDay;

  const accent = homeBanner.visible ? homeBanner.color : colors.orange;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Announcement" />
      <AnimatedEntry style={styles.wrap}>
        <LinearGradient
          colors={[accent, darken(accent, 25)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.emoji}>📣</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </LinearGradient>

        {offer.visible ? (
          <View style={styles.offerBox}>
            <Text style={styles.offerLabel}>Offer code</Text>
            <Text style={styles.offerCode}>{offer.code}</Text>
            {offer.expiry ? (
              <Text style={styles.offerExpiry}>Valid till {offer.expiry}</Text>
            ) : null}
          </View>
        ) : null}

        <Button
          title="Samajh gaya"
          onPress={() => navigation.goBack()}
          style={styles.btn}
        />
        <Button title="Wapas" variant="ghost" onPress={() => navigation.goBack()} />
      </AnimatedEntry>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 40, marginBottom: spacing.md },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  offerBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.goldGlow,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  offerLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.gray500 },
  offerCode: {
    fontFamily: fonts.mono,
    fontSize: 22,
    color: colors.gold,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  offerExpiry: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.sm,
  },
  btn: { marginBottom: spacing.sm },
});
