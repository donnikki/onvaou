import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { formatDateCH } from '@/src/utils/date';
import { getOfferConditionLabel, getOfferRewardLabel } from '@/src/utils/offers';

const isPastDate = (dateString: string) => new Date(dateString).getTime() < Date.now();

export default function ShopOffersScreen() {
  const activeShopId = useAuthStore((state) => state.activeShopId);
  const shops = useShopStore((state) => state.shops);
  const [, setRefreshKey] = useState(0);

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
              <View style={styles.actionRow}>
                <AppButton
                  label="Akzeptieren"
                  onPress={() => {
                    offerService.acceptByShop(offer.id);
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  listBlock: {
    gap: spacing.xs,
  },
});
