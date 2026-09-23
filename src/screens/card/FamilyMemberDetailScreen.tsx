import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../../constants';
import { useProfileStore } from '../../store/profileStore';
import { Button } from '../../components/common/Button';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { HealthCard } from '../../components/card/HealthCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';

type Params = { FamilyMemberDetail: { memberId: string } };

export function FamilyMemberDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Params, 'FamilyMemberDetail'>>();
  const members = useProfileStore((s) => s.members);
  const member = members.find((m) => m.id === route.params.memberId) ?? members[0];

  if (!member) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Member" />
        <Text style={styles.empty}>Member nahi mila</Text>
        <Button title="Wapas" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={member.name} subtitle={member.relation} />
      <ScrollView contentContainerStyle={styles.content}>
        <AnimatedEntry style={styles.card}>
          <HealthCard member={member} />
        </AnimatedEntry>
        <AnimatedEntry delay={160} style={styles.details}>
          <Detail label="Blood Group" value={member.bloodGroup} />
          <Detail label="Allergies" value={member.allergies.join(', ') || 'Koi nahi'} />
          <Detail
            label="Conditions"
            value={member.chronicConditions.join(', ') || 'Koi nahi'}
          />
        </AnimatedEntry>
        <Button
          title="Edit karein"
          onPress={() => {
            (navigation as { navigate: (a: string, b?: object) => void }).navigate(
              'EditMember',
              { memberId: member.id },
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.gray500, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  details: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  row: { marginBottom: spacing.md },
  label: { fontFamily: fonts.headingMedium, fontSize: 13, color: colors.gold },
  value: { fontFamily: fonts.body, fontSize: 15, color: colors.white, marginTop: 4 },
  empty: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    margin: spacing.xl,
  },
});
