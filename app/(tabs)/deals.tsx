import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { useOfferStore } from '@/src/store/offerStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH } from '@/src/utils/date';
import { getOfferBadgeLabel, getOfferConditionLabel, getOfferPromotionLabel, getOfferPromotionPriority, getOfferRewardLabel } from '@/src/utils/offers';

const filters = ['Alle', 'Kategorie', 'In der Naehe', 'Laeuft bald ab', 'Neue Deals', 'Beliebt'] as const;

export default function DealsScreen() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('Alle');
  const shops = useShopStore((state) => state.shops);
  const offers = useOfferStore((state) => state.offers);

  const deals = useMemo(() => {
    const active = offers.filter((offer) => offer.status === 'active');
    const sortedByPromotion = [...active].sort((left, right) => {
      const promotionDelta = getOfferPromotionPriority(right) - getOfferPromotionPriority(left);
      if (promotionDelta !== 0) {
        return promotionDelta;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    if (filter === 'Laeuft bald ab') {
      return sortedByPromotion.sort((left, right) => {
        const promotionDelta = getOfferPromotionPriority(right) - getOfferPromotionPriority(left);
        if (promotionDelta !== 0) {
          return promotionDelta;
        }

        return new Date(left.validUntil).getTime() - new Date(right.validUntil).getTime();
      });
    }

    return sortedByPromotion;
  }, [filter, offers]);

  return (
    <Screen>
      <Text style={styles.heading}>Aktive Deals in Biel</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filters.map((item) => {
          const active = item === filter;
          return (
            <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {deals.length === 0 ? (
        <EmptyState title="Keine Deals gefunden" description="Aktuell gibt es in dieser Ansicht keine aktiven Angebote." />
      ) : (
        deals.map((deal) => {
          const shop = shops.find((entry) => entry.id === deal.shopId) ?? null;
          if (!shop) {
            return null;
          }

          return (
            <AppCard key={deal.id} style={styles.dealCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <AppBadge text={getOfferBadgeLabel(deal)} tone={deal.discountPercent ? 'red' : 'muted'} />
              </View>
              <Text style={styles.title}>{deal.title}</Text>
              <Text style={styles.description}>{deal.description}</Text>
              {getOfferRewardLabel(deal) ? <Text style={styles.meta}>{getOfferRewardLabel(deal)}</Text> : null}
              {getOfferConditionLabel(deal) ? <Text style={styles.meta}>{getOfferConditionLabel(deal)}</Text> : null}
              {getOfferPromotionLabel(deal) ? <Text style={styles.promoMeta}>{getOfferPromotionLabel(deal)}</Text> : null}
              <Text style={styles.validUntil}>Gueltig bis {formatDateCH(deal.validUntil)}</Text>
              <AppButton label="Ansehen" variant="secondary" onPress={() => router.push(`/shop-detail/${shop.id}`)} />
            </AppCard>
          );
        })
      )}
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
  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  filterText: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  dealCard: {
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  shopName: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  description: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  validUntil: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  promoMeta: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
});
