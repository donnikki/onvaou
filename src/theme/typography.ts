import { Platform } from 'react-native';

const ios = {
  regular: 'AvenirNext-Regular',
  medium: 'AvenirNext-Medium',
  semibold: 'AvenirNext-DemiBold',
  bold: 'AvenirNext-Bold',
};

const android = {
  regular: 'sans-serif',
  medium: 'sans-serif-medium',
  semibold: 'sans-serif-medium',
  bold: 'sans-serif-bold',
};

const family = Platform.select({ ios, default: android }) ?? android;

export const typography = {
  family,
  size: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
  },
  lineHeight: {
    tight: 18,
    normal: 22,
    relaxed: 26,
  },
};
