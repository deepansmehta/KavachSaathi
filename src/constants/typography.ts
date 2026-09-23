import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fonts = {
  heading: 'Rajdhani_700Bold',
  headingSemi: 'Rajdhani_600SemiBold',
  headingMedium: 'Rajdhani_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  mono: 'DMMono_400Regular',
} as const;

export const textStyles = {
  h1: {
    fontFamily: fonts.heading,
    fontSize: 36,
    letterSpacing: -0.5,
    color: colors.white,
  } satisfies TextStyle,
  h2: {
    fontFamily: fonts.heading,
    fontSize: 28,
    letterSpacing: -0.3,
    color: colors.white,
  } satisfies TextStyle,
  h3: {
    fontFamily: fonts.headingSemi,
    fontSize: 22,
    color: colors.white,
  } satisfies TextStyle,
  h4: {
    fontFamily: fonts.headingMedium,
    fontSize: 18,
    color: colors.white,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.gray300,
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.white,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gray500,
  } satisfies TextStyle,
  code: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 1.5,
    color: colors.teal,
  } satisfies TextStyle,
} as const;
