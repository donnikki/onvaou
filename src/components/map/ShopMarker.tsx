import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { CategoryIcon } from '@/src/components/ui/CategoryIcon';
import { colors, typography } from '@/src/theme';
import { ShopProfile } from '@/src/types';

type ShopMarkerProps = {
  shop: ShopProfile;
  highlighted?: boolean;
  onPress: () => void;
  showDealBadge?: boolean;
  dealBadgeText?: string;
};

export const ShopMarker = ({
  shop,
  highlighted = false,
  onPress,
  showDealBadge = false,
  dealBadgeText = '%',
}: ShopMarkerProps) => (
  <Marker
    coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
    onPress={onPress}
    identifier={shop.id}>
    <View style={styles.markerWrap}>
      <View style={[styles.iconShadow, highlighted && styles.iconShadowHighlighted]}>
        <CategoryIcon icon={shop.mapIcon} size={46} />
      </View>
      <View style={styles.labelWrap}>
        <Text numberOfLines={1} style={styles.label}>
          {shop.name}
        </Text>
      </View>
    </View>
    {showDealBadge ? (
      <View style={styles.dealBadge}>
        <Text style={styles.dealBadgeText}>{dealBadgeText}</Text>
      </View>
    ) : null}
  </Marker>
);

const styles = StyleSheet.create({
  markerWrap: {
    alignItems: 'center',
  },
  iconShadow: {
    borderRadius: 999,
    shadowColor: '#171717',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconShadowHighlighted: {
    shadowOpacity: 0.2,
  },
  labelWrap: {
    marginTop: 4,
    maxWidth: 96,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  dealBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.primaryRed,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBadgeText: {
    color: '#FFFFFF',
    fontFamily: typography.family.bold,
    fontSize: 10,
    lineHeight: 12,
  },
});
