import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { ShopMarker } from '@/src/components/map/ShopMarker';
import { BielBrand } from '@/src/components/ui/BielBrand';
import { colors, spacing, typography } from '@/src/theme';
import { useAppStore } from '@/src/store/appStore';
import { useShopStore } from '@/src/store/shopStore';
import { categoryList } from '@/src/utils/validators';
import { offerService } from '@/src/services/offerService';
import { getOfferBadgeLabel } from '@/src/utils/offers';

const initialRegion: Region = {
  latitude: 47.1368,
  longitude: 7.2468,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');

  const selectedCategory = useAppStore((state) => state.selectedCategory);
  const setSelectedCategory = useAppStore((state) => state.setSelectedCategory);
  const allShops = useShopStore((state) => state.shops);

  const shops = useMemo(() => {
    const source = allShops.filter((shop) => {
      if (selectedCategory && shop.category !== selectedCategory) {
        return false;
      }

      return shop.isVisibleOnMap && shop.adminApproved && shop.subscriptionStatus === 'active';
    });

    return source.filter((shop) => {
      if (!query.trim()) {
        return true;
      }

      const normalized = query.toLowerCase();
      return (
        shop.name.toLowerCase().includes(normalized) ||
        shop.category.toLowerCase().includes(normalized) ||
        shop.description.toLowerCase().includes(normalized)
      );
    });
  }, [allShops, query, selectedCategory]);

  const offers = offerService.getActive();

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <BielBrand titleSize={36} centered={false} />
        <Text style={styles.subtitle}>Dein Biel. Deine Vorteile.</Text>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Suche in Biel"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          <Pressable style={styles.filterButton}>
            <Ionicons name="filter-outline" size={18} color={colors.primaryRed} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categoryList.map((category) => {
            const active = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(active ? null : category)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

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
          const activeOffer = offers.find((offer) => offer.shopId === shop.id);
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  chipText: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
});
