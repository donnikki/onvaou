import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { useAppStore } from '@/src/store/appStore';
import { useOfferStore } from '@/src/store/offerStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';

export default function FavoritesScreen() {
  const favoriteShopIds = useAppStore((state) => state.favoriteShopIds);
  const favoriteOfferIds = useAppStore((state) => state.favoriteOfferIds);
  const shops = useShopStore((state) => state.shops);
  const offers = useOfferStore((state) => state.offers);

  const favoriteShops = favoriteShopIds.map((id) => shops.find((shop) => shop.id === id) ?? null).filter(Boolean);
  const favoriteOffers = offers.filter((offer) => favoriteOfferIds.includes(offer.id));

  return (
    <Screen>
      <Text style={styles.heading}>Favoriten</Text>

      {favoriteShops.length === 0 && favoriteOffers.length === 0 ? (
        <EmptyState
          title="Noch keine Favoriten"
          description="Entdecke lokale Angebote in Biel und speichere deine Lieblings-Shops."
        />
      ) : null}

      {favoriteShops.map((shop) => {
        if (!shop) {
          return null;
        }

        return (
          <AppCard key={shop.id} style={styles.card}>
            <Text style={styles.title}>{shop.name}</Text>
            <Text style={styles.sub}>{shop.category}</Text>
            <AppButton label="Profil oeffnen" variant="secondary" onPress={() => router.push(`/shop-detail/${shop.id}`)} />
          </AppCard>
        );
      })}

      {favoriteOffers.map((offer) => (
        <AppCard key={offer.id} style={styles.card}>
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.sub}>{offer.description}</Text>
        </AppCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  sub: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
});
