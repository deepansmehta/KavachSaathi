import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { CardDetailScreen } from '../screens/card/CardDetailScreen';
import { AddMemberScreen } from '../screens/card/AddMemberScreen';
import { EditMemberScreen } from '../screens/card/EditMemberScreen';
import { ScanPrescriptionScreen } from '../screens/medicines/ScanPrescriptionScreen';
import { AddMedicineScreen } from '../screens/medicines/AddMedicineScreen';
import { PrescriptionDetailScreen } from '../screens/medicines/PrescriptionDetailScreen';
import { ChemistShareScreen } from '../screens/medicines/ChemistShareScreen';
import { ReminderSettingsScreen } from '../screens/medicines/ReminderSettingsScreen';
import { SOSScreen } from '../screens/emergency/SOSScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PlanUpgradeScreen } from '../screens/profile/PlanUpgradeScreen';
import { BloodDonorScreen } from '../screens/profile/BloodDonorScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { MaintenanceScreen } from '../screens/special/MaintenanceScreen';
import { ForceUpdateScreen } from '../screens/special/ForceUpdateScreen';
import { InfoScreen } from '../screens/special/InfoScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { FamilyMemberDetailScreen } from '../screens/card/FamilyMemberDetailScreen';
import { NotificationsScreen } from '../screens/special/NotificationsScreen';
import { AnnouncementScreen } from '../screens/special/AnnouncementScreen';
import { CardOrderScreen } from '../screens/card/CardOrderScreen';
import { CardOrderSuccessScreen } from '../screens/card/CardOrderSuccessScreen';
import { CardActivationScreen } from '../screens/card/CardActivationScreen';
import { useAuthStore } from '../store/authStore';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { colors } from '../constants';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  CardDetail: { memberId?: string } | undefined;
  AddMember: undefined;
  EditMember: { memberId?: string } | undefined;
  FamilyMemberDetail: { memberId: string };
  ScanPrescription: undefined;
  AddMedicine: undefined;
  PrescriptionDetail: { prescriptionId?: string } | undefined;
  ChemistShare: undefined;
  ReminderSettings: undefined;
  SOS: undefined;
  EditProfile: undefined;
  PlanUpgrade: undefined;
  BloodDonor: undefined;
  Security: undefined;
  Notifications: undefined;
  Announcement: undefined;
  Help: undefined;
  About: undefined;
  Maintenance: undefined;
  ForceUpdate: undefined;
  CardOrder: undefined;
  CardOrderSuccess: {
    cardId: string;
    qrToken: string;
    orderId: string;
    plan: string;
  };
  CardActivation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, hasSeenOnboarding, isLoading } = useAuthStore();
  const { maintenance, forceUpdate } = useRemoteConfig();

  if (forceUpdate) {
    return <ForceUpdateScreen />;
  }

  if (maintenance.active) {
    return <MaintenanceScreen />;
  }

  const initialRoute: keyof RootStackParamList = isLoading
    ? 'Splash'
    : isAuthenticated
      ? 'Main'
      : hasSeenOnboarding
        ? 'Welcome'
        : 'Splash';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash">
        {({ navigation }) => (
          <SplashScreen
            onFinish={(route) => {
              if (route === 'Home') {
                navigation.replace('Main');
              } else if (route === 'Onboarding') {
                navigation.replace('Onboarding');
              } else {
                navigation.replace('Welcome');
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Main" component={MainNavigator} />

      <Stack.Screen name="CardDetail" component={CardDetailScreen} />
      <Stack.Screen name="AddMember" component={AddMemberScreen} />
      <Stack.Screen name="EditMember" component={EditMemberScreen} />
      <Stack.Screen name="FamilyMemberDetail" component={FamilyMemberDetailScreen} />
      <Stack.Screen name="CardOrder" component={CardOrderScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CardOrderSuccess"
        component={CardOrderSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="CardActivation"
        component={CardActivationScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="ScanPrescription" component={ScanPrescriptionScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="ChemistShare" component={ChemistShareScreen} />
      <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />

      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />

      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PlanUpgrade" component={PlanUpgradeScreen} />
      <Stack.Screen name="BloodDonor" component={BloodDonorScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Announcement" component={AnnouncementScreen} />
      <Stack.Screen name="Help">
        {() => (
          <InfoScreen
            title="Madad"
            body={
              'Koi sawal ya problem?\n\nEmail: support@gdmtechnoworld.com\nLocation: Fatehabad, Haryana\n\nHum jald jawab denge.'
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
