import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useProfileStore } from '../../store/profileStore';
import { generateQrToken } from '../../utils/helpers';

type Params = {
  EditMember: { memberId: string };
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Other'];

export function EditMemberScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Params, 'EditMember'>>();
  const members = useProfileStore((s) => s.members);
  const updateMember = useProfileStore((s) => s.updateMember);

  const member = useMemo(
    () => members.find((m) => m.id === route.params?.memberId),
    [members, route.params?.memberId],
  );

  const [name, setName] = useState(member?.name ?? '');
  const [relation, setRelation] = useState(member?.relation ?? 'Self');
  const [dob, setDob] = useState(member?.dob ?? '');
  const [bloodGroup, setBloodGroup] = useState(member?.bloodGroup ?? 'O+');
  const [allergies, setAllergies] = useState(member?.allergies.join(', ') ?? '');
  const [conditions, setConditions] = useState(member?.chronicConditions.join(', ') ?? '');
  const [ec1Name, setEc1Name] = useState(member?.emergencyContact1?.name ?? '');
  const [ec1Phone, setEc1Phone] = useState(member?.emergencyContact1?.phone ?? '');
  const [ec1Relation, setEc1Relation] = useState(member?.emergencyContact1?.relation ?? '');
  const [insuranceId, setInsuranceId] = useState(member?.insuranceId ?? '');
  const [abhaNumber, setAbhaNumber] = useState(member?.abhaNumber ?? '');
  const [organDonor, setOrganDonor] = useState(member?.organDonor ?? false);
  const [isBloodDonor, setIsBloodDonor] = useState(member?.isBloodDonor ?? false);
  const [cardType, setCardType] = useState<'standard' | 'pro'>(member?.cardType ?? 'standard');
  const [saving, setSaving] = useState(false);

  if (!member) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Member Edit" />
        <View style={styles.empty}>
          <Text style={textStyles.h4}>Member nahi mila</Text>
          <Button title="Wapas Jao" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Naam zaroori hai', 'Member ka naam likho.');
      return;
    }

    setSaving(true);
    updateMember(member.id, {
      name: name.trim(),
      relation,
      dob: dob.trim() || undefined,
      bloodGroup,
      allergies: allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      chronicConditions: conditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      emergencyContact1:
        ec1Name.trim() && ec1Phone.trim()
          ? { name: ec1Name.trim(), phone: ec1Phone.trim(), relation: ec1Relation.trim() || relation }
          : undefined,
      insuranceId: insuranceId.trim() || undefined,
      abhaNumber: abhaNumber.trim() || undefined,
      organDonor,
      isBloodDonor,
      cardType,
    });
    setSaving(false);

    Alert.alert('Updated!', 'Member details save ho gayi.', [
      { text: 'Theek hai', onPress: () => navigation.goBack() },
    ]);
  };

  const handleRegenerateQr = () => {
    Alert.alert('QR Regenerate?', 'Purana QR invalid ho jayega.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate',
        onPress: () => {
          updateMember(member.id, { qrToken: generateQrToken() });
          Alert.alert('Done', 'Naya QR token generate ho gaya.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Member Edit" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>{member.name} ki details update karo</Text>

        <Input label="Naam" value={name} onChangeText={setName} />

        <Text style={styles.sectionLabel}>Rishta</Text>
        <View style={styles.chips}>
          {RELATIONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.chip, relation === r && styles.chipActive]}
              onPress={() => setRelation(r)}
            >
              <Text style={[styles.chipText, relation === r && styles.chipTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Input label="DOB" value={dob} onChangeText={setDob} />

        <Text style={styles.sectionLabel}>Blood Group</Text>
        <View style={styles.chips}>
          {BLOOD_GROUPS.map((bg) => (
            <Pressable
              key={bg}
              style={[styles.chip, bloodGroup === bg && styles.chipActive]}
              onPress={() => setBloodGroup(bg)}
            >
              <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
            </Pressable>
          ))}
        </View>

        <Input label="Allergies" value={allergies} onChangeText={setAllergies} />
        <Input label="Chronic Conditions" value={conditions} onChangeText={setConditions} />

        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <Input label="Naam" value={ec1Name} onChangeText={setEc1Name} />
        <Input label="Phone" value={ec1Phone} onChangeText={setEc1Phone} keyboardType="phone-pad" />
        <Input label="Rishta" value={ec1Relation} onChangeText={setEc1Relation} />

        <Input label="Insurance ID" value={insuranceId} onChangeText={setInsuranceId} />
        <Input label="ABHA Number" value={abhaNumber} onChangeText={setAbhaNumber} />

        <Text style={styles.sectionLabel}>Card Type</Text>
        <View style={styles.chips}>
          {(['standard', 'pro'] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, cardType === t && styles.chipActive]}
              onPress={() => setCardType(t)}
            >
              <Text style={[styles.chipText, cardType === t && styles.chipTextActive]}>
                {t === 'pro' ? 'Pro' : 'Standard'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleRow}>
          <Pressable style={styles.toggle} onPress={() => setOrganDonor(!organDonor)}>
            <Text style={styles.toggleText}>Organ Donor {organDonor ? '✓' : ''}</Text>
          </Pressable>
          <Pressable style={styles.toggle} onPress={() => setIsBloodDonor(!isBloodDonor)}>
            <Text style={styles.toggleText}>Blood Donor {isBloodDonor ? '✓' : ''}</Text>
          </Pressable>
        </View>

        <View style={styles.qrInfo}>
          <Text style={styles.qrLabel}>QR Token</Text>
          <Text style={styles.qrValue}>{member.qrToken}</Text>
          <Button title="QR Regenerate Karo" variant="outline" onPress={handleRegenerateQr} />
        </View>

        <Button title="Save Karo" loading={saving} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...textStyles.body, marginBottom: spacing.lg },
  sectionLabel: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.gray300,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: { borderColor: colors.teal, backgroundColor: colors.tealGlow },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gray300 },
  chipTextActive: { color: colors.teal },
  toggleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  toggle: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  toggleText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.white },
  qrInfo: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  qrLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.gray500 },
  qrValue: { fontFamily: fonts.mono, fontSize: 13, color: colors.teal },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
