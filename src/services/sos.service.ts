import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import type { EmergencyContact, FamilyMember } from '../types';
import { buildSosMessage, shareViaWhatsApp, callNumber } from './whatsapp.service';

export async function triggerSos(
  member: FamilyMember,
  contacts: EmergencyContact[],
): Promise<{ sent: boolean; location?: { lat: number; lng: number } }> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  const { status } = await Location.requestForegroundPermissionsAsync();
  let lat = 29.515; // Fatehabad fallback
  let lng = 75.455;

  if (status === Location.PermissionStatus.GRANTED) {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
  }

  const message = buildSosMessage(member.name, member.bloodGroup, lat, lng);

  for (const contact of contacts) {
    try {
      await shareViaWhatsApp(message, contact.phone);
    } catch {
      // Continue to next contact
    }
  }

  return { sent: true, location: { lat, lng } };
}

export async function callAmbulance108(): Promise<void> {
  await callNumber('108');
}
