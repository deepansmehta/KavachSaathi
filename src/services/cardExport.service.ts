import { RefObject } from 'react';
import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { FamilyMember } from '../types';

export async function captureCardImage(viewRef: RefObject<unknown>): Promise<string> {
  return captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}

export async function shareCardImage(
  viewRef: RefObject<unknown>,
  member: FamilyMember,
): Promise<void> {
  const uri = await captureCardImage(viewRef);
  const url = uri.startsWith('file://') ? uri : `file://${uri}`;
  const message = `${member.name} · ${member.bloodGroup} · KavachSaathi`;

  if (Platform.OS === 'ios') {
    await Share.share({ url, message });
    return;
  }

  await Share.share({ message: `${message}\n${url}`, title: 'KavachSaathi Card' });
}
