import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/main/HomeScreen';
import { CardScreen } from '../screens/main/CardScreen';
import { MedicinesScreen } from '../screens/main/MedicinesScreen';
import { FamilyScreen } from '../screens/main/FamilyScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { CustomTabBar } from './CustomTabBar';

export type MainTabParamList = {
  Home: undefined;
  Card: undefined;
  Medicines: undefined;
  Family: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Card" component={CardScreen} />
      <Tab.Screen name="Medicines" component={MedicinesScreen} options={{ title: 'Dawai' }} />
      <Tab.Screen name="Family" component={FamilyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
