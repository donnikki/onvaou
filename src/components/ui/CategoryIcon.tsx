import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { MapIcon } from '@/src/types';

const iconMap: Record<MapIcon, ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  scissors: 'content-cut',
  'shopping-cart': 'cart',
  beer: 'glass-mug-variant',
  coffee: 'coffee',
  utensils: 'silverware-fork-knife',
  music: 'music-note',
  ticket: 'ticket-confirmation',
  wrench: 'wrench',
  'map-pin': 'map-marker',
};

type CategoryIconProps = {
  icon: MapIcon;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export const CategoryIcon = ({ icon, size = 18, color = '#171717', style }: CategoryIconProps) => {
  return <MaterialCommunityIcons name={iconMap[icon]} size={size} color={color} style={style} />;
};
