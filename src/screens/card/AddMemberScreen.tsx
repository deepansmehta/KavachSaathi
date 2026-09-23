import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useProfileStore } from '../../store/profileStore';
import { generateHealthId, generateQrToken } from '../../utils/helpers';
import type { FamilyMember } from '../../types';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Other'];

export function AddMemberScreen() {
  const navigation = useNavigation();
  const addMember = useProfileStore((s) => s.addMember);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Self');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [ec1Name, setEc1Name] = useState('');
  const [ec1Phone, setEc1Phone] = useState('');
  const [ec1Relation, setEc1Relation] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [abhaNumber, setAbhaNumber] = useState('');
  const [organDonor, setOrganDonor] = useState(false);
  const [isBloodDonor, setIsBloodDonor] = useState(false);
  const [cardType, setCardType] = useState<'standard' | 'pro'>('standard');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Naam zaroori hai', 'Member ka naam likho.');
      return;
    }

    setSaving(true);
    const member: FamilyMember = {
      id: `member-${Date.now()}`,
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
      qrToken: generateQrToken(),
      nfcId: cardType === 'pro' ? `NFC-${generateHealthId()}` : undefined,
      cardActivated: false,
    };

    addMember(member);
    setSaving(false);

    Alert.alert('Member Added!', `${member.name} ka card ban gaya.`, [
      { text: 'Theek hai', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Naya Member" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Parivaar ka naya health card banao</Text>

        <Input label="Naam" placeholder="Poora naam" value={name} onChangeText={setName} />

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

        <Input label="DOB (optional)" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />

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

        <Input
          label="Allergies (comma separated)"
          placeholder="Penicillin, Dust"
          value={allergies}
          onChangeText={setAllergies}
        />
        <Input
          label="Chronic Conditions"
          placeholder="Hypertension, Diabetes"
          value={conditions}
          onChangeText={setConditions}
        />

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

        <Button title="Member Save Karo" loading={saving} onPress={handleSave} />
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
});
