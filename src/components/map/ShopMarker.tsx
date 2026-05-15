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
    <View style={[styles.marker, highlighted && styles.markerHighlighted]}>
      <CategoryIcon icon={shop.mapIcon} size={16} color={highlighted ? '#FFFFFF' : colors.primaryRed} />
    </View>
    {showDealBadge ? (
      <View style={styles.dealBadge}>
        <Text style={styles.dealBadgeText}>{dealBadgeText}</Text>
      </View>
    ) : null}
  </Marker>
);

const styles = StyleSheet.create({
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primaryRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerHighlighted: {
    backgroundColor: colors.primaryRed,
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
