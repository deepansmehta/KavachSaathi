import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItem,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, spacing, radius, ANIM, textStyles } from '../../constants';
import { Button } from '../../components/common/Button';
import { OnboardingHero } from '../../components/auth/OnboardingHero';
import { AnimatedBackground } from '../../components/backgrounds/AnimatedBackground';
import { useAuthStore } from '../../store/authStore';

const { width: SLIDE_WIDTH } = Dimensions.get('window');

type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface SlideData {
  id: string;
  kind: 'card' | 'scan' | 'family';
  title: string;
  heading: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    kind: 'card',
    title: 'Ek Card. Sab Kuch.',
    heading: 'Aapki poori health, ek card mein',
    subtitle: 'Physical card + digital profile — dono saath',
  },
  {
    id: '2',
    kind: 'scan',
    title: 'Emergency mein ek second kaafi hai',
    heading: 'QR scan karo. Sab dikhe.',
    subtitle: 'Blood group, medicines, emergency contact — koi bhi dekh sake',
  },
  {
    id: '3',
    kind: 'family',
    title: 'Poori family. Ek jagah.',
    heading: '6 members. 6 cards. Ek account.',
    subtitle: 'Papa, Maa, Dadi — sab KavachSaathi Pro mein',
  },
];

function ProgressDot({ active }: { active: boolean }) {
  const dotWidth = useSharedValue(active ? 28 : 8);

  useEffect(() => {
    dotWidth.value = withSpring(active ? 28 : 8, ANIM.spring);
  }, [active, dotWidth]);

  const dotStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
    backgroundColor: active ? colors.orange : colors.glassBorder,
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

function SlideItem({ item }: { item: SlideData }) {
  return (
    <View style={styles.slide}>
      <OnboardingHero kind={item.kind} />
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.heading}>{item.heading}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );
}

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const listRef = useRef<FlatList<SlideData>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSkip = useCallback(() => {
    useAuthStore.getState().setOnboardingSeen(true);
    navigation.navigate('Welcome');
  }, [navigation]);

  const handleFinish = useCallback(() => {
    useAuthStore.getState().setOnboardingSeen(true);
    navigation.navigate('Welcome');
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  }, [activeIndex, handleFinish]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setActiveIndex(index);
  }, []);

  const renderItem: ListRenderItem<SlideData> = useCallback(
    ({ item }) => <SlideItem item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: SlideData) => item.id, []);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <AnimatedBackground variant="navy">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <ProgressDot key={slide.id} active={index === activeIndex} />
          ))}
        </View>

        {isLastSlide ? (
          <Button title="Shuru Karein →" onPress={handleFinish} variant="primary" />
        ) : (
          <Button title="Aage badhein" onPress={handleNext} variant="secondary" />
        )}
      </View>
    </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skip: {
    ...textStyles.caption,
    color: colors.gray500,
    fontSize: 14,
  },
  slide: {
    width: SLIDE_WIDTH,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  slideTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.orange,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  heading: {
    ...textStyles.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});
