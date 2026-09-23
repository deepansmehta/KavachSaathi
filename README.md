# KavachSaathi

**Ek Card. Poori Suraksha.** — Smart physical health card system by GDM Technoworld Pvt. Ltd.

## Quick start

```bash
npm install
npx expo start
```

Tap **Continue with Google** (DEV mode) or use the guest/dev sign-in path — without Firebase env vars the app runs on sample data (`Deepansh Mehta` Pro profile).

## Configure Firebase

1. Copy `.env.example` → `.env` and fill `EXPO_PUBLIC_FIREBASE_*` values.
2. Enable Google + Apple providers in Firebase Auth.
3. Publish Remote Config keys (see `src/services/remoteConfig.service.ts`).
4. Deploy `emergency-web/` to Firebase Hosting at `/e/**`.
5. Deploy Cloud Functions from `functions/`.

## Native features (dev build required)

These need `npx expo run:ios|android` or EAS development build (not Expo Go alone):

- Google / Apple native Sign-In modules
- `@react-native-ml-kit/text-recognition` (prescription OCR)
- `react-native-nfc-manager` (Pro NFC)
- Full FCM via `@react-native-firebase/messaging`

OCR, NFC, and social login have service stubs so UI flows work in DEV.

## Icons & animations upgrade

- Custom SVG icon system (`KavachIcons.tsx`) — no emoji tab icons
- Animated blur tab bar with elevated RX center button
- `ScreenTransition` on main tabs + Card Detail + SOS
- Health card tilt (pan) + flip (tap)
- SOS pulse rings, swipe-to-delete medicines, FAB ripple
- `PressableScale` micro-interactions

## Day 3 additions

- Google Sign-In via `expo-auth-session` + Firebase credential exchange (DEV fallback)
- Apple Sign-In via `expo-apple-authentication` (iOS)
- Animated onboarding heroes + brand Lottie pulse
- Card image export/share (`react-native-view-shot`)
- OCR hardening: ML Kit when native module present, else demo parser + source badge

## Day 2 additions

- CardDetail: emergency URL QR, share/copy, health meta, toasts
- Offline cache for emergency profile + today's medicines (AsyncStorage)
- `profile.service` + `medicines.service` Firestore layer (DEV-safe)
- Toast host + Badge component
- Real Notifications + Announcement screens (Remote Config aware)
- `useMedicineReminders` hook

## Structure

```
src/
  screens/     Auth, main tabs, card, medicines, SOS, profile
  components/  HealthCard (3D flip), RemoteBanner, design primitives
  navigation/  Root stack + custom tab bar
  services/    Firebase, auth, OCR, SOS, WhatsApp, Remote Config
  store/       Zustand (auth, profile, medicines, remote config)
functions/     Cloud Function stubs
emergency-web/ Public emergency HTML page
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npx expo start` | Dev server |
| `npx tsc --noEmit` | Typecheck |
| `npx expo-doctor` | Dependency health |

Built for Bharat · GDM Technoworld · Fatehabad, Haryana
