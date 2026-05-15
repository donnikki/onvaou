import { useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { offerService } from '@/src/services/offerService';
import { shopService } from '@/src/services/shopService';
import { useAppStore } from '@/src/store/appStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH } from '@/src/utils/date';
import { getOfferConditionLabel, getOfferRewardLabel } from '@/src/utils/offers';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shops = useShopStore((state) => state.shops);
  const shop = shops.find((entry) => entry.id === String(id)) ?? shopService.getById(String(id));

  const toggleFavoriteShop = useAppStore((state) => state.toggleFavoriteShop);
  const favoriteShopIds = useAppStore((state) => state.favoriteShopIds);
  const isFavorite = favoriteShopIds.includes(String(id));

  if (!shop) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <EmptyState title="Shop nicht gefunden" description="Dieses Profil ist aktuell nicht verfuegbar." />
      </ScrollView>
    );
  }

  const offers = offerService.getByShopId(shop.id).filter((offer) => offer.status === 'active');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <Image source={{ uri: shop.heroImageUrl }} style={styles.hero} />

      <View style={styles.headBlock}>
        <Image source={{ uri: shop.logoUrl }} style={styles.logo} />
        <View style={styles.headText}>
          <Text style={styles.name}>{shop.name}</Text>
          <Text style={styles.slogan}>{shop.slogan}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.primaryRed} />
            <Text style={styles.rating}>4.9 (128)</Text>
            <AppBadge text="Geoeffnet" tone="green" />
          </View>
        </View>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.label}>Adresse</Text>
        <Text style={styles.value}>{shop.street} {shop.houseNumber}, {shop.zip} {shop.city}</Text>
        <Text style={styles.meta}>Heute geoeffnet 09:00 - 19:00 | Distanz: 2 Min.</Text>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Aktive Deals</Text>
        {offers.length === 0 ? <Text style={styles.meta}>Aktuell keine aktiven Deals.</Text> : null}
        {offers.map((offer, index) => (
          <View key={offer.id} style={[styles.dealCard, index === 0 ? styles.dealCardPrimary : styles.dealCardSecondary]}>
            <Text style={[styles.dealTitle, index === 0 && styles.dealTitlePrimary]}>{offer.title}</Text>
            <Text style={[styles.dealDescription, index === 0 && styles.dealDescriptionPrimary]}>{offer.description}</Text>
            {getOfferRewardLabel(offer) ? (
              <Text style={[styles.meta, index === 0 && styles.dealDescriptionPrimary]}>{getOfferRewardLabel(offer)}</Text>
            ) : null}
            {getOfferConditionLabel(offer) ? (
              <Text style={[styles.meta, index === 0 && styles.dealDescriptionPrimary]}>{getOfferConditionLabel(offer)}</Text>
            ) : null}
            <Text style={[styles.meta, index === 0 && styles.dealDescriptionPrimary]}>Gueltig bis {formatDateCH(offer.validUntil)}</Text>
          </View>
        ))}
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Deine Treuepunkte</Text>
        <Text style={styles.points}>390 Punkte</Text>
        <Text style={styles.meta}>Naechste Belohnung bei 500 Punkten</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </AppCard>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.outlineButton, styles.inlineButton]}>
          <Ionicons name="call-outline" size={16} color={colors.primaryRed} />
          <Text style={styles.outlineText}>Anrufen</Text>
        </Pressable>
        <Pressable style={[styles.fillButton, styles.inlineButton]}>
          <Text style={styles.fillText}>Jetzt buchen</Text>
        </Pressable>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.outlineButton, styles.inlineButton]}>
          <Ionicons name="navigate-outline" size={16} color={colors.primaryRed} />
          <Text style={styles.outlineText}>Route</Text>
        </Pressable>
        <AppButton label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten'} onPress={() => toggleFavoriteShop(shop.id)} variant="secondary" />
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Impressionen</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {shop.galleryImageUrls.map((imageUrl) => (
            <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Produkte und Dienstleistungen</Text>
        {shop.products.map((product) => (
          <Text key={product.id} style={styles.meta}>- {product.name}</Text>
        ))}
        {shop.services.map((service) => (
          <Text key={service.id} style={styles.meta}>- {service.name}</Text>
        ))}
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Beschreibung</Text>
        <Text style={styles.meta}>{shop.description}</Text>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  hero: {
    width: '100%',
    height: 260,
    backgroundColor: '#F3F4F6',
  },
  headBlock: {
    marginTop: -36,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  headText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xl,
  },
  slogan: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rating: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  value: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  dealCard: {
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
  },
  dealCardPrimary: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  dealCardSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.border,
  },
  dealTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  dealTitlePrimary: {
    color: '#FFFFFF',
  },
  dealDescription: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  dealDescriptionPrimary: {
    color: '#FFFFFF',
  },
  points: {
    color: colors.primaryRed,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  progressFill: {
    width: '78%',
    height: 10,
    backgroundColor: colors.primaryRed,
  },
  buttonRow: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  inlineButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primaryRed,
  },
  outlineText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  fillButton: {
    backgroundColor: colors.primaryRed,
  },
  fillText: {
    color: '#FFFFFF',
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  galleryRow: {
    gap: spacing.sm,
  },
  galleryImage: {
    width: 140,
    height: 110,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
});
