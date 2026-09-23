import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Pressable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../constants';
import {
  HomeIcon,
  CardIcon,
  MedicineIcon,
  FamilyIcon,
  ProfileIcon,
  type IconProps,
} from '../components/icons/KavachIcons';

type TabDef = {
  key: string;
  label: string;
  color: string;
  Icon: React.ComponentType<IconProps>;
  center?: boolean;
};

const TAB_META: Record<string, TabDef> = {
  Home: { key: 'Home', label: 'Home', color: colors.white, Icon: HomeIcon },
  Card: { key: 'Card', label: 'Card', color: colors.gold, Icon: CardIcon },
  Medicines: {
    key: 'Medicines',
    label: 'RX',
    color: colors.orange,
    Icon: MedicineIcon,
    center: true,
  },
  Family: { key: 'Family', label: 'Family', color: colors.teal, Icon: FamilyIcon },
  Profile: { key: 'Profile', label: 'Profile', color: colors.white, Icon: ProfileIcon },
};

function TabItem({
  tab,
  isFocused,
  onPress,
}: {
  tab: TabDef;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(isFocused ? 1 : 0.45);
  const glowScale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, { damping: 12, stiffness: 200 });
    translateY.value = withSpring(isFocused ? -3 : 0, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(isFocused ? 1 : 0.45, { duration: 200 });
    glowScale.value = withSpring(isFocused ? 1 : 0, { damping: 10 });
  }, [glowScale, isFocused, opacity, scale, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: interpolate(glowScale.value, [0, 1], [0, 0.35], Extrapolation.CLAMP),
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 8 }),
      withSpring(isFocused ? 1.12 : 1, { damping: 10 }),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (tab.center) {
    return (
      <Pressable onPress={handlePress} style={styles.centralWrapper}>
        <Animated.View style={[styles.centralBtn, animStyle]}>
          <LinearGradient
            colors={['#FF7043', '#FF5722', '#E64A19']}
            style={styles.centralGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <tab.Icon size={26} color={colors.white} />
          </LinearGradient>
          <Animated.View style={[styles.centralGlow, glowStyle]} />
        </Animated.View>
        <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.tabItem}>
      <Animated.View style={[styles.iconWrap, animStyle]}>
        <Animated.View
          style={[styles.activeGlow, { backgroundColor: `${tab.color}33` }, glowStyle]}
        />
        <tab.Icon size={24} color={isFocused ? tab.color : colors.gray500} />
      </Animated.View>
      <Text style={[styles.label, isFocused && { color: tab.color }]}>{tab.label}</Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(9,20,42,0.95)', 'rgba(6,14,28,0.98)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topBorder} />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TAB_META[route.name] ?? TAB_META.Home;
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          return (
            <TabItem
              key={route.key}
              tab={{ ...tab, label: options.title ?? tab.label }}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  topBorder: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 52,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  activeGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    top: -8,
    left: -8,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.gray500,
    marginTop: 4,
  },
  labelActive: {
    color: colors.orange,
    fontFamily: fonts.bodyMedium,
  },
  centralWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centralBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  centralGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.navy,
  },
  centralGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -10,
    left: -10,
    backgroundColor: '#FF572240',
  },
});
