import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { DEV_MODE, getFirebaseAuth, isFirebaseConfigured } from './firebase';
import { DEV_USER } from '../data/devData';
import type { UserProfile } from '../types';
import { generateHealthId } from '../utils/helpers';
import { upsertUserProfile, fetchUserProfile } from './profile.service';

WebBrowser.maybeCompleteAuthSession();

/** Placeholder so the Google auth hook never crashes without real keys (Rules of Hooks). */
const GOOGLE_PLACEHOLDER = '000000000000-devplaceholder.apps.googleusercontent.com';

function mapFirebaseUser(user: User, extras?: Partial<UserProfile>): UserProfile {
  return {
    uid: user.uid,
    name: user.displayName ?? extras?.name ?? 'KavachSaathi User',
    email: user.email ?? extras?.email ?? '',
    photoURL: user.photoURL ?? undefined,
    plan: extras?.plan ?? 'standard',
    healthId: extras?.healthId ?? generateHealthId(),
    createdAt: extras?.createdAt ?? Date.now(),
    lastSeen: Date.now(),
    onboardingComplete: extras?.onboardingComplete ?? false,
    biometricEnabled: extras?.biometricEnabled ?? false,
    isBloodDonor: extras?.isBloodDonor ?? false,
  };
}

async function resolveProfile(user: User): Promise<UserProfile> {
  const existing = await fetchUserProfile(user.uid);
  if (existing) {
    const merged = {
      ...existing,
      lastSeen: Date.now(),
      photoURL: user.photoURL ?? existing.photoURL,
    };
    await upsertUserProfile(merged);
    return merged;
  }
  const created = mapFirebaseUser(user);
  await upsertUserProfile(created);
  return created;
}

function envId(key: string): string | undefined {
  const value = process.env[key]?.trim();
  if (!value || value.includes('XXXX') || value.includes('YOUR_') || value.includes('placeholder')) {
    return undefined;
  }
  return value;
}

export function isGoogleAuthConfigured(): boolean {
  const web = envId('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  const ios = envId('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  const android = envId('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');

  if (Platform.OS === 'ios') return Boolean(ios || web);
  if (Platform.OS === 'android') return Boolean(android || web);
  return Boolean(web);
}

/** Hook-friendly Google config — never returns empty platform client IDs */
export function getGoogleAuthConfig() {
  return {
    webClientId: envId('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID') ?? GOOGLE_PLACEHOLDER,
    iosClientId: envId('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID') ?? GOOGLE_PLACEHOLDER,
    androidClientId: envId('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID') ?? GOOGLE_PLACEHOLDER,
    scopes: ['profile', 'email'] as string[],
  };
}

/**
 * Always safe to call — uses placeholder client IDs when env is empty so
 * Expo AuthSession does not throw on WelcomeScreen mount.
 * Callers must check `isGoogleAuthConfigured()` before prompting.
 */
export function useGoogleAuthRequest() {
  return Google.useIdTokenAuthRequest(getGoogleAuthConfig());
}

export async function completeGoogleSignIn(idToken: string): Promise<UserProfile> {
  if (!isFirebaseConfigured || DEV_MODE || idToken === 'dev-token') {
    await delay(600);
    return { ...DEV_USER, lastSeen: Date.now() };
  }

  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth ready nahi hai.');

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return resolveProfile(result.user);
}

export async function signInWithGoogle(): Promise<UserProfile> {
  if (DEV_MODE || !isGoogleAuthConfigured()) {
    await delay(800);
    return { ...DEV_USER, lastSeen: Date.now() };
  }

  throw new Error(
    'Google Sign-In UI se complete karein (WelcomeScreen promptAsync). Ya DEV mode use karein.',
  );
}

export async function signInWithApple(): Promise<UserProfile> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In sirf iOS pe available hai.');
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available || DEV_MODE || !isFirebaseConfigured) {
    await delay(800);
    return {
      ...DEV_USER,
      name: 'Apple User',
      email: 'apple@privaterelay.appleid.com',
      lastSeen: Date.now(),
    };
  }

  const bytes = await Crypto.getRandomBytesAsync(16);
  const rawNonce = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const apple = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!apple.identityToken) {
    throw new Error('Apple identity token nahi mila.');
  }

  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth ready nahi hai.');

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: apple.identityToken,
    rawNonce,
  });
  const result = await signInWithCredential(auth, credential);

  const fullName = [apple.fullName?.givenName, apple.fullName?.familyName]
    .filter(Boolean)
    .join(' ');

  const profile = await resolveProfile(result.user);
  if (fullName && !profile.onboardingComplete) {
    return { ...profile, name: fullName };
  }
  return profile;
}

export async function signInAsDev(): Promise<UserProfile> {
  await delay(400);
  return { ...DEV_USER, lastSeen: Date.now() };
}

export async function signInAsGuest(): Promise<UserProfile> {
  await delay(300);
  return {
    uid: 'guest',
    name: 'Guest',
    email: '',
    plan: 'guest',
    healthId: 'KVS-GUEST',
    createdAt: Date.now(),
    lastSeen: Date.now(),
    onboardingComplete: true,
  };
}

export async function completeProfileSetup(
  base: UserProfile,
  name: string,
  plan: 'standard' | 'pro',
): Promise<UserProfile> {
  const updated: UserProfile = {
    ...base,
    name,
    plan,
    healthId: base.healthId || generateHealthId(),
    onboardingComplete: true,
    lastSeen: Date.now(),
  };
  await upsertUserProfile(updated);
  return updated;
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function exchangeGoogleIdToken(idToken: string): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase configured nahi hai.');
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function exchangeAppleToken(
  identityToken: string,
  nonce: string,
): Promise<User> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase configured nahi hai.');
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
