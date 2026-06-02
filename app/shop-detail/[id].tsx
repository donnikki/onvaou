import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { ShopPublicProfile } from '@/src/components/shop/ShopPublicProfile';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { shopService } from '@/src/services/shopService';
import { useAppStore } from '@/src/store/appStore';
import { useOfferStore } from '@/src/store/offerStore';
import { useShopStore } from '@/src/store/shopStore';

export default function ShopDetailScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const shops = useShopStore((state) => state.shops);
  const offers = useOfferStore((state) => state.offers);
  const shop = shops.find((entry) => entry.id === String(id)) ?? shopService.getById(String(id));

  const toggleFavoriteShop = useAppStore((state) => state.toggleFavoriteShop);
  const favoriteShopIds = useAppStore((state) => state.favoriteShopIds);
  const isFavorite = favoriteShopIds.includes(String(id));

  if (!shop) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <EmptyState title="Shop nicht gefunden" description="Dieses Profil ist aktuell nicht verfuegbar." />
      </ScrollView>
    );
  }

  const activeOffers = offers.filter((offer) => offer.shopId === shop.id && offer.status === 'active');

  return (
    <ShopPublicProfile
      shop={shop}
      offers={activeOffers}
      isFavorite={isFavorite}
      previewMode={preview === '1'}
      onToggleFavorite={preview === '1' ? undefined : () => toggleFavoriteShop(shop.id)}
    />
  );
}
