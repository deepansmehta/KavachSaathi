import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, spacing } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { useAuthStore } from '../../store/authStore';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!user) {
      Alert.alert('Login chahiye', 'Profile edit karne ke liye login karo.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Naam zaroori hai', 'Apna naam likho.');
      return;
    }

    setSaving(true);
    setUser({
      ...user,
      name: name.trim(),
      phone: phone.trim() || undefined,
      lastSeen: Date.now(),
    });
    setSaving(false);

    Alert.alert('Saved!', 'Profile update ho gayi.', [
      { text: 'Theek hai', onPress: () => navigation.goBack() },
    ]);
  };

  const initial = (name.trim() || user?.name || 'U').charAt(0).toUpperCase();

  return (
    <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit Profile" />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.hint}>Apni details update karo</Text>
          </View>

          <GlassCard intensity={18} style={styles.formCard}>
            <Input
              label="Naam"
              placeholder="Apna poora naam"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {user?.healthId ? (
              <Input
                label="Health ID"
                value={user.healthId}
                editable={false}
                style={styles.readonly}
              />
            ) : null}
          </GlassCard>

          <Button title="Save Karo" loading={saving} onPress={handleSave} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  avatarBlock: { alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.gray500,
  },
  formCard: { marginBottom: spacing.sm },
  readonly: { opacity: 0.6 },
});
