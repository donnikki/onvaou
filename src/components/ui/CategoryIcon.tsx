import { Image, ImageStyle, StyleProp } from 'react-native';

import { MapIcon } from '@/src/types';
import { getMapIconSource } from '@/src/utils/shopCategories';

type CategoryIconProps = {
  icon: MapIcon;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export const CategoryIcon = ({ icon, size = 18, style }: CategoryIconProps) => (
  <Image source={getMapIconSource(icon)} style={[{ width: size, height: size }, style]} resizeMode="contain" />
);
