import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { ShopMarker } from '@/src/components/map/ShopMarker';
import { ShopCategoryTreePicker } from '@/src/components/ui/ShopCategoryTreePicker';
import { colors, spacing, typography } from '@/src/theme';
import { useAppStore } from '@/src/store/appStore';
import { useOfferStore } from '@/src/store/offerStore';
import { useShopStore } from '@/src/store/shopStore';
import { getOfferBadgeLabel } from '@/src/utils/offers';
import { areAllCategoriesSelected, shopTopCategories } from '@/src/utils/shopCategories';

const initialRegion: Region = {
  latitude: 47.1368,
  longitude: 7.2468,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export default function DiscoverScreen() {
  const [filterOpen, setFilterOpen] = useState(true);

  const selectedCategories = useAppStore((state) => state.selectedCategories);
  const setSelectedCategories = useAppStore((state) => state.setSelectedCategories);
  const allShops = useShopStore((state) => state.shops);
  const offers = useOfferStore((state) => state.offers);
  const hasCustomSelection = !areAllCategoriesSelected(selectedCategories);

  const shops = useMemo(() => {
    const activeCategorySet = new Set(selectedCategories);
    const source = allShops.filter((shop) => {
      if (!activeCategorySet.has(shop.category)) {
        return false;
      }

      return shop.isVisibleOnMap && shop.adminApproved && shop.subscriptionStatus === 'active';
    });

    return source;
  }, [allShops, selectedCategories]);

  const activeOffers = useMemo(() => offers.filter((offer) => offer.status === 'active'), [offers]);

  return (
    <View style={styles.container}>
      <View style={styles.filterPanel}>
        <Pressable
          style={[styles.filterHeader, filterOpen && styles.filterHeaderOpen]}
          onPress={() => setFilterOpen((value) => !value)}>
          <View style={styles.filterHeaderTextWrap}>
            <Text style={styles.filterTitle}>Kategorien</Text>
            <Text style={styles.filterSubtitle}>
              {hasCustomSelection ? `${selectedCategories.length} ausgewaehlt` : 'Alle Kategorien'}
            </Text>
          </View>
          <View style={[styles.filterToggle, filterOpen && styles.filterToggleOpen]}>
            <Ionicons name={filterOpen ? 'chevron-up' : 'chevron-down'} size={20} color={filterOpen ? '#FFFFFF' : colors.primaryRed} />
            {hasCustomSelection && !filterOpen ? <View style={styles.filterDot} /> : null}
          </View>
        </Pressable>

        {filterOpen ? (
          <View style={styles.filterDropdown}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
              <ShopCategoryTreePicker
                mode="multi"
                value={selectedCategories}
                onChange={setSelectedCategories}
                initialExpandedIds={shopTopCategories.map((entry) => entry.id)}
              />
            </ScrollView>
          </View>
        ) : null}
      </View>

      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsCompass
          showsBuildings={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          showsTraffic={false}
          toolbarEnabled={false}>
          {shops.map((shop) => {
            const activeOffer = activeOffers.find((offer) => offer.shopId === shop.id);
            const hasDeal = Boolean(activeOffer);
            return (
              <ShopMarker
                key={shop.id}
                shop={shop}
                showDealBadge={hasDeal}
                dealBadgeText={activeOffer ? getOfferBadgeLabel(activeOffer) : '%'}
                onPress={() => router.push(`/shop-detail/${shop.id}`)}
              />
            );
          })}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterHeaderOpen: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  filterHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  filterTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  filterSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  filterToggle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
  },
  filterToggleOpen: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  filterDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryRed,
  },
  filterDropdown: {
    maxHeight: 300,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: spacing.md,
    shadowColor: '#171717',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  filterScrollContent: {
    paddingBottom: spacing.xs,
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});
