import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { FamilyMember } from '../../types';
import { ANIM } from '../../constants';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { CardShineSweep } from '../effects/CardShineSweep';

interface Props {
  member: FamilyMember;
}

export function HealthCard({ member }: Props) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const isFlipped = useSharedValue(0);
  const floatY = useSharedValue(0);
  const isPro = member.cardType === 'pro';

  useEffect(() => {
    const id = setInterval(() => {
      floatY.value = withSpring(floatY.value === 0 ? -3 : 0, ANIM.spring);
    }, 2200);
    return () => clearInterval(id);
  }, [floatY]);

  const hapticFlip = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      rotateY.value = interpolate(e.translationX, [-100, 100], [-12, 12], Extrapolation.CLAMP);
      rotateX.value = interpolate(e.translationY, [-60, 60], [8, -8], Extrapolation.CLAMP);
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, ANIM.spring);
      rotateY.value = withSpring(0, ANIM.spring);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(hapticFlip)();
      isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, ANIM.spring);
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(hapticFlip)();
      isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, ANIM.spring);
    });

  const composed = Gesture.Simultaneous(pan, Gesture.Exclusive(doubleTap, singleTap));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { translateY: floatY.value },
      { rotateX: `${rotateX.value}deg` },
      {
        rotateY: `${rotateY.value + interpolate(isFlipped.value, [0, 1], [0, 180])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { translateY: floatY.value },
      { rotateX: `${rotateX.value}deg` },
      {
        rotateY: `${rotateY.value + interpolate(isFlipped.value, [0, 1], [180, 360])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(floatY.value, [-3, 0], [0.45, 0.25]),
  }));

  const holoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(rotateY.value), [0, 15], [0, 0.22], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.shadow, shadowStyle]}>
        <View>
          <Animated.View style={frontStyle}>
            <View style={styles.face}>
              <CardFront member={member} />
              <CardShineSweep />
              {isPro ? (
                <Animated.View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, styles.holoClip, holoStyle]}
                >
                  <LinearGradient
                    colors={[
                      '#FF000033',
                      '#FF7F0033',
                      '#FFFF0033',
                      '#00FF0033',
                      '#0000FF33',
                      '#8B00FF33',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              ) : null}
            </View>
          </Animated.View>
          <Animated.View style={backStyle}>
            <CardBack member={member} />
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 12,
  },
  face: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  holoClip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});
