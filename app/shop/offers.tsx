import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { offerService } from '@/src/services/offerService';
import { redemptionService } from '@/src/services/redemptionService';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { OfferPromotionType } from '@/src/types';
import { formatDateCH } from '@/src/utils/date';
import { getOfferConditionLabel, getOfferPromotionLabel, getOfferRewardLabel } from '@/src/utils/offers';

const isPastDate = (dateString: string) => new Date(dateString).getTime() < Date.now();

const promotionOptions: {
  type: OfferPromotionType;
  title: string;
  description: string;
  priceLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    type: 'none',
    title: 'Ohne Promotion',
    description: 'Die Aktion wird normal aktiviert.',
    priceLabel: 'Gratis',
    icon: 'checkmark-circle-outline',
  },
  {
    type: 'notification_blast',
    title: 'Push an alle Nutzer',
    description: 'Mock In-App Kauf fuer eine Benachrichtigung an alle Nutzer in der App.',
    priceLabel: 'CHF 19',
    icon: 'notifications-outline',
  },
  {
    type: 'featured_placement',
    title: 'Top Platzierung',
    description: 'Die Aktion erscheint weiter oben in der Deals-Liste.',
    priceLabel: 'CHF 29',
    icon: 'rocket-outline',
  },
  {
    type: 'premium_boost',
    title: 'Premium Boost',
    description: 'Kombiniert Push an alle Nutzer und bessere Platzierung.',
    priceLabel: 'CHF 39',
    icon: 'flash-outline',
  },
];

export default function ShopOffersScreen() {
  const activeShopId = useAuthStore((state) => state.activeShopId);
  const shops = useShopStore((state) => state.shops);
  const [, setRefreshKey] = useState(0);
  const [selectedPromotions, setSelectedPromotions] = useState<Record<string, OfferPromotionType>>({});

  const shop = shops.find((entry) => entry.id === activeShopId) ?? shops[0] ?? null;

  if (!shop) {
    return (
      <Screen>
        <EmptyState title="Kein Shop aktiv" description="Waehle zuerst ein Shop-Profil aus, damit du Aktionen verwalten kannst." />
      </Screen>
    );
  }

  const allOffers = offerService.getByShopId(shop.id);
  const pendingOffers = allOffers.filter((offer) => offer.status === 'pending_shop');
  const activeOffers = allOffers.filter((offer) => offer.status === 'active' && !isPastDate(offer.validUntil));
  const pastOffers = allOffers.filter(
    (offer) => offer.status === 'declined' || offer.status === 'paused' || offer.status === 'expired' || isPastDate(offer.validUntil),
  );

  return (
    <Screen>
      <Text style={styles.heading}>Aktionen</Text>
      <Text style={styles.subheading}>Angefragt, aktiv und vergangen an einem Ort.</Text>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Admin-Anfragen</Text>
          <AppBadge text={`${pendingOffers.length}`} tone={pendingOffers.length > 0 ? 'red' : 'muted'} />
        </View>
        {pendingOffers.length === 0 ? (
          <EmptyState
            title="Noch keine Anfragen"
            description="Neue Aktionen vom Admin erscheinen hier direkt, sobald sie an deinen Shop gesendet werden."
          />
        ) : (
          pendingOffers.map((offer) => (
            <AppCard key={offer.id} style={styles.innerCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{offer.title}</Text>
                <AppBadge text="Angefragt" tone="muted" />
              </View>
              <Text style={styles.text}>{offer.description}</Text>
              {getOfferRewardLabel(offer) ? <Text style={styles.meta}>{getOfferRewardLabel(offer)}</Text> : null}
              {getOfferConditionLabel(offer) ? <Text style={styles.meta}>{getOfferConditionLabel(offer)}</Text> : null}
              <Text style={styles.meta}>Gueltig bis {formatDateCH(offer.validUntil)}</Text>
              <View style={styles.promotionWrap}>
                <View style={styles.promotionHeader}>
                  <Text style={styles.promotionTitle}>Promotion vor dem Bestaetigen</Text>
                  <Text style={styles.promotionText}>Optionaler Mock In-App Kauf fuer mehr Reichweite.</Text>
                </View>
                <View style={styles.promotionList}>
                  {promotionOptions.map((option) => {
                    const active = (selectedPromotions[offer.id] ?? 'none') === option.type;

                    return (
                      <Pressable
                        key={`${offer.id}-${option.type}`}
                        style={[styles.promotionOption, active && styles.promotionOptionActive]}
                        onPress={() =>
                          setSelectedPromotions((value) => ({
                            ...value,
                            [offer.id]: option.type,
                          }))
                        }>
                        <View style={styles.promotionOptionIcon}>
                          <Ionicons name={option.icon} size={16} color={active ? '#FFFFFF' : colors.primaryRed} />
                        </View>
                        <View style={styles.promotionOptionTextWrap}>
                          <View style={styles.rowBetween}>
                            <Text style={[styles.promotionOptionTitle, active && styles.promotionOptionTitleActive]}>{option.title}</Text>
                            <Text style={[styles.promotionPrice, active && styles.promotionPriceActive]}>{option.priceLabel}</Text>
                          </View>
                          <Text style={[styles.promotionOptionText, active && styles.promotionOptionTextActive]}>{option.description}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.actionRow}>
                <AppButton
                  label={(selectedPromotions[offer.id] ?? 'none') === 'none' ? 'Ohne Promotion aktivieren' : 'Kaufen + Aktivieren'}
                  onPress={() => {
                    offerService.acceptByShop(offer.id, selectedPromotions[offer.id] ?? 'none');
                    setRefreshKey((value) => value + 1);
                  }}
                />
                <AppButton
                  label="Ablehnen"
                  variant="secondary"
                  onPress={() => {
                    offerService.declineByShop(offer.id);
                    setRefreshKey((value) => value + 1);
                  }}
                />
              </View>
            </AppCard>
          ))
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Aktiv</Text>
          <AppBadge text={`${activeOffers.length}`} tone="green" />
        </View>
        {activeOffers.length === 0 ? (
          <Text style={styles.text}>Aktuell sind fuer deinen Shop keine aktiven Aktionen freigeschaltet.</Text>
        ) : (
          activeOffers.map((offer) => (
            <View key={offer.id} style={styles.listBlock}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{offer.title}</Text>
                <AppBadge text="Aktiv" tone="green" />
              </View>
              <Text style={styles.text}>{offer.description}</Text>
              {getOfferRewardLabel(offer) ? <Text style={styles.meta}>{getOfferRewardLabel(offer)}</Text> : null}
              {getOfferConditionLabel(offer) ? <Text style={styles.meta}>{getOfferConditionLabel(offer)}</Text> : null}
              {getOfferPromotionLabel(offer) ? <Text style={styles.promoMeta}>{getOfferPromotionLabel(offer)}</Text> : null}
              {offer.inventoryTotal || offer.maxRedemptions ? (
                <Text style={styles.meta}>Noch {redemptionService.getRemainingForOffer(offer) ?? 0} verfuegbar</Text>
              ) : null}
              <Text style={styles.meta}>Bestaetigt: {redemptionService.getConfirmedCount(offer.id)}</Text>
            </View>
          ))
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Vergangen</Text>
          <AppBadge text={`${pastOffers.length}`} tone="muted" />
        </View>
        {pastOffers.length === 0 ? (
          <Text style={styles.text}>Noch keine vergangenen Aktionen.</Text>
        ) : (
          pastOffers.map((offer) => (
            <View key={offer.id} style={styles.listBlock}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>{offer.title}</Text>
                <AppBadge text={offer.status === 'declined' ? 'Abgelehnt' : 'Vergangen'} tone="muted" />
              </View>
              <Text style={styles.text}>{offer.description}</Text>
              {getOfferRewardLabel(offer) ? <Text style={styles.meta}>{getOfferRewardLabel(offer)}</Text> : null}
              {getOfferPromotionLabel(offer) ? <Text style={styles.promoMeta}>{getOfferPromotionLabel(offer)}</Text> : null}
              <Text style={styles.meta}>Gueltig bis {formatDateCH(offer.validUntil)}</Text>
            </View>
          ))
        )}
      </AppCard>
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
  subheading: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  card: {
    gap: spacing.sm,
  },
  innerCard: {
    gap: spacing.sm,
    padding: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  promotionWrap: {
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCACA',
    backgroundColor: '#FFF7F7',
    padding: spacing.md,
  },
  promotionHeader: {
    gap: 2,
  },
  promotionTitle: {
    color: colors.primaryRedDark,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  promotionText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  promotionList: {
    gap: spacing.sm,
  },
  promotionOption: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4D4D4',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
  },
  promotionOptionActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  promotionOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  promotionOptionTextWrap: {
    flex: 1,
    gap: 2,
  },
  promotionOptionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  promotionOptionTitleActive: {
    color: '#FFFFFF',
  },
  promotionPrice: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  promotionPriceActive: {
    color: '#FFFFFF',
  },
  promotionOptionText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  promotionOptionTextActive: {
    color: '#FFE8E8',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  listBlock: {
    gap: spacing.xs,
  },
});
