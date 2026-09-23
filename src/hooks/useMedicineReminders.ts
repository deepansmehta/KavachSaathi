import { useCallback, useEffect, useState } from 'react';
import {
  cancelAllReminders,
  requestNotificationPermissions,
  scheduleMedicineReminder,
} from '../services/notifications.service';
import { useMedicinesStore } from '../store/medicinesStore';

const SLOT_HOURS: Record<string, { hour: number; minute: number; label: string }> = {
  morning: { hour: 8, minute: 0, label: 'Subah ki medicine lo' },
  afternoon: { hour: 13, minute: 0, label: 'Dopahar ki medicine lo' },
  evening: { hour: 18, minute: 0, label: 'Shaam ki medicine lo' },
  night: { hour: 21, minute: 0, label: 'Raat ki medicine lo' },
};

export function useMedicineReminders() {
  const medicines = useMedicinesStore((s) => s.medicines);
  const [enabled, setEnabled] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  const reschedule = useCallback(async () => {
    setScheduling(true);
    try {
      const ok = await requestNotificationPermissions();
      if (!ok) {
        setEnabled(false);
        return false;
      }

      await cancelAllReminders();

      const activeSlots = new Set<string>();
      for (const med of medicines.filter((m) => m.active)) {
        for (const t of med.timing) activeSlots.add(t);
      }

      for (const slot of activeSlots) {
        const cfg = SLOT_HOURS[slot];
        if (!cfg) continue;
        await scheduleMedicineReminder('KavachSaathi Reminder', cfg.label, cfg.hour, cfg.minute);
      }

      setEnabled(true);
      return true;
    } finally {
      setScheduling(false);
    }
  }, [medicines]);

  const disable = useCallback(async () => {
    await cancelAllReminders();
    setEnabled(false);
  }, []);

  useEffect(() => {
    if (enabled && medicines.length > 0) {
      void reschedule();
    }
  }, [enabled, medicines.length, reschedule]);

  return { enabled, setEnabled, scheduling, reschedule, disable };
}
