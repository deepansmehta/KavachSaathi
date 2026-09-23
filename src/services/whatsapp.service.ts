import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import type { FamilyMember, Medicine } from '../types';

export function buildChemistMessage(
  member: FamilyMember,
  medicines: Medicine[],
  verifyUrl: string,
): string {
  const lines = medicines
    .map((m, i) => `${i + 1}. ${m.name} ${m.dosage}${m.stockCount ? ` × ${m.stockCount}` : ''}`)
    .join('\n');

  return [
    '🏥 *KavachSaathi Prescription*',
    `Patient: ${member.name}`,
    `ID: ${member.qrToken ? `KVS · ${member.bloodGroup}` : member.bloodGroup}`,
    '',
    '💊 Medicines:',
    lines,
    '',
    `📅 ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    '',
    `Verify: ${verifyUrl}`,
  ].join('\n');
}

export function buildSosMessage(
  name: string,
  bloodGroup: string,
  lat: number,
  lng: number,
): string {
  return [
    `🆘 ${name} ko madad chahiye!`,
    `Location: https://maps.google.com/?q=${lat},${lng}`,
    `Blood Group: ${bloodGroup}`,
    new Date().toLocaleString('en-IN'),
    '— KavachSaathi SOS',
  ].join('\n');
}

export async function shareViaWhatsApp(message: string, phone?: string): Promise<void> {
  const encoded = encodeURIComponent(message);
  const url = phone
    ? `whatsapp://send?phone=${phone.replace(/\D/g, '')}&text=${encoded}`
    : `whatsapp://send?text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  await Share.share({ message, title: 'KavachSaathi' });
}

export async function shareGeneric(message: string): Promise<void> {
  await Share.share({ message, title: 'KavachSaathi' });
}

export async function openSms(message: string, phone?: string): Promise<void> {
  const body = encodeURIComponent(message);
  const url = phone ? `sms:${phone}?body=${body}` : `sms:?body=${body}`;
  await Linking.openURL(url);
}

export async function openThalSaathi(bloodGroup: string, name: string): Promise<void> {
  const deepLink = `thalsaathi://donor/register?bg=${encodeURIComponent(bloodGroup)}&name=${encodeURIComponent(name)}`;
  const canOpen = await Linking.canOpenURL(deepLink);
  if (canOpen) {
    await Linking.openURL(deepLink);
    return;
  }
  await Linking.openURL('https://play.google.com/store/search?q=thalsaathi');
}

export async function callNumber(phone: string): Promise<void> {
  await Linking.openURL(`tel:${phone}`);
}
