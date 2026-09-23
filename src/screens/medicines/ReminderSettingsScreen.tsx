import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing, textStyles } from '../../constants';
import { GlassCard } from '../../components/common/GlassCard';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { toast } from '../../components/common/Toast';
import {
  scheduleMedicineReminder,
  cancelAllReminders,
  requestNotificationPermissions,
} from '../../services/notifications.service';

interface ReminderSlot {
  id: 'morning' | 'night';
  label: string;
  emoji: string;
  hour: number;
  minute: number;
  body: string;
}

const SLOTS: ReminderSlot[] = [
  {
    id: 'morning',
    label: 'Subah ki reminder',
    emoji: '🌅',
    hour: 8,
    minute: 0,
    body: 'Subah ki dawaiyan lena mat bhoolna!',
  },
  {
    id: 'night',
    label: 'Raat ki reminder',
    emoji: '🌙',
    hour: 21,
    minute: 0,
    body: 'Raat ki dawaiyan lena mat bhoolna!',
  },
];

export function ReminderSettingsScreen() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    morning: false,
    night: false,
  });
  const [loading, setLoading] = useState<string | null>(null);

  const toggleSlot = async (slot: ReminderSlot, value: boolean) => {
    setLoading(slot.id);
    try {
      if (value) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert('Permission chahiye', 'Notifications allow karo reminders ke liye.');
          return;
        }
        await scheduleMedicineReminder(
          'KavachSaathi Reminder',
          slot.body,
          slot.hour,
          slot.minute,
        );
        setEnabled((prev) => ({ ...prev, [slot.id]: true }));
        toast(`${slot.label} on ho gayi`, 'success');
      } else {
        await cancelAllReminders();
        setEnabled({ morning: false, night: false });
        toast('Saari reminders cancel ho gayi', 'info');
      }
    } catch {
      toast('Reminder set nahi ho payi', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Reminders" />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Subah aur raat ki reminders set karo taaki dawaiyan miss na hon
        </Text>

        {SLOTS.map((slot) => (
          <GlassCard key={slot.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.left}>
                <Text style={styles.emoji}>{slot.emoji}</Text>
                <View>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotTime}>
                    {String(slot.hour).padStart(2, '0')}:{String(slot.minute).padStart(2, '0')}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled[slot.id]}
                onValueChange={(v) => void toggleSlot(slot, v)}
                disabled={loading === slot.id}
                trackColor={{ false: colors.gray700, true: colors.tealGlow }}
                thumbColor={enabled[slot.id] ? colors.teal : colors.gray300}
              />
            </View>
          </GlassCard>
        ))}

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 Tip: Reminders band karne par saari scheduled notifications cancel ho jati hain.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  subtitle: { ...textStyles.body },
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 28 },
  slotLabel: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.white,
  },
  slotTime: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.teal,
    marginTop: 2,
  },
  tip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gray300,
    lineHeight: 20,
  },
});
