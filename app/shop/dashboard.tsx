import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { offerService } from '@/src/services/offerService';
import { redemptionService } from '@/src/services/redemptionService';
import { shopService } from '@/src/services/shopService';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { goToRoleSelection as navigateToRoleSelection, goToWelcome } from '@/src/utils/navigation';
import { getOfferConditionLabel, getOfferRewardLabel } from '@/src/utils/offers';

const checklist = ['Basisdaten', 'Adresse', 'Oeffnungszeiten', 'Logo', 'Kategorie/Symbol', 'Admin-Freigabe'];

export default function ShopDashboardScreen() {
  const { currentUser, activeShopId, goToRoleSelection } = useAuthStore();
  const shops = useShopStore((state) => state.shops);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [, setRefreshKey] = useState(0);

  const hasAccess = Boolean(
    currentUser &&
      (currentUser.role === 'shop_active' || currentUser.role === 'admin' || currentUser.role === 'shop_expired'),
  );

  const shop = shops.find((entry) => entry.id === activeShopId) ?? shops[0] ?? shopService.getById('shop-choppers');

  useEffect(() => {
    if (!hasAccess) {
      goToWelcome();
    }
  }, [hasAccess]);

  if (!hasAccess || !shop) {
    return null;
  }

  const pendingOffers = offerService.getPendingForShop(shop.id).filter((offer) => !hiddenRequestIds.includes(offer.id));
  const activeOffers = offerService.getByShopId(shop.id).filter((offer) => offer.status === 'active');
  const profileComplete = Boolean(shop.name && shop.street && shop.logoUrl);
  return (
    <Screen>
      <Text style={styles.heading}>Mein Shop</Text>

      {pendingOffers.length > 0 ? (
        <AppCard style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.requestTitleWrap}>
              <Text style={styles.label}>Admin-Anfrage</Text>
              <Text style={styles.requestTitle}>{pendingOffers[0].title}</Text>
            </View>
            <AppBadge text={`${pendingOffers.length}`} tone="red" />
          </View>
          <Text style={styles.value}>{pendingOffers[0].description}</Text>
          {getOfferRewardLabel(pendingOffers[0]) ? <Text style={styles.meta}>{getOfferRewardLabel(pendingOffers[0])}</Text> : null}
          {getOfferConditionLabel(pendingOffers[0]) ? <Text style={styles.meta}>{getOfferConditionLabel(pendingOffers[0])}</Text> : null}
          <View style={styles.actionRow}>
            <AppButton
              label="Akzeptieren"
              onPress={() => {
                offerService.acceptByShop(pendingOffers[0].id);
                setRefreshKey((value) => value + 1);
              }}
            />
            <AppButton
              label="Ablehnen"
              variant="secondary"
              onPress={() => {
                offerService.declineByShop(pendingOffers[0].id);
                setRefreshKey((value) => value + 1);
              }}
            />
            <AppButton
              label="Spaeter"
              variant="ghost"
              onPress={() => setHiddenRequestIds((value) => [...value, pendingOffers[0].id])}
            />
          </View>
          <AppButton label="Zu Aktionen" variant="ghost" onPress={() => router.push('/shop/offers')} />
        </AppCard>
      ) : null}

      <Pressable style={styles.actionsHeader} onPress={() => router.push('/shop/offers')}>
        <View>
          <Text style={styles.sectionTitle}>Aktionen</Text>
          <Text style={styles.subtitle}>Angefragt, aktiv und vergangen an einem Ort.</Text>
        </View>
        <View style={styles.actionsHeaderRight}>
          <AppBadge text={`${pendingOffers.length + activeOffers.length}`} tone="muted" />
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </Pressable>

      {!profileComplete ? (
        <AppCard style={styles.card}>
          <Text style={styles.label}>Profil-Checkliste</Text>
          {checklist.map((item) => (
            <Text key={item} style={styles.value}>
              - {item}
            </Text>
          ))}
        </AppCard>
      ) : null}

      <Text style={styles.sectionTitle}>So sehen Nutzer dein Profil</Text>

      <Pressable style={styles.previewCard} onPress={() => router.push('/shop/edit-profile')}>
        <Image source={{ uri: shop.heroImageUrl }} style={styles.hero} />
        <View style={styles.previewTopRow}>
          <Image source={{ uri: shop.logoUrl }} style={styles.logo} />
          <View style={styles.previewTextWrap}>
            <Text style={styles.previewName}>{shop.name}</Text>
            <Text style={styles.previewSlogan}>{shop.slogan}</Text>
            <Text style={styles.previewMeta}>{shop.category}</Text>
          </View>
          <AppBadge text="Tippen zum Bearbeiten" tone="muted" />
        </View>
      </Pressable>

      <View style={styles.previewGrid}>
        <Pressable style={styles.previewBlock} onPress={() => router.push('/shop/edit-profile')}>
          <Text style={styles.previewBlockLabel}>Adresse</Text>
          <Text style={styles.previewBlockValue}>
            {shop.street} {shop.houseNumber}
          </Text>
          <Text style={styles.previewBlockMeta}>
            {shop.zip} {shop.city}
          </Text>
        </Pressable>

        <Pressable style={styles.previewBlock} onPress={() => router.push('/shop/edit-profile')}>
          <Text style={styles.previewBlockLabel}>Beschreibung</Text>
          <Text style={styles.previewBlockValue}>{shop.description}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.previewBlock} onPress={() => router.push('/shop/edit-profile')}>
        <Text style={styles.previewBlockLabel}>Bilder</Text>
        <View style={styles.galleryRow}>
          {shop.galleryImageUrls.slice(0, 3).map((imageUrl) => (
            <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.galleryImage} />
          ))}
        </View>
      </Pressable>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Aktive Aktionen</Text>
          <AppBadge text={`${activeOffers.length}`} tone="green" />
        </View>
        {activeOffers.length === 0 ? (
          <Text style={styles.value}>Aktuell sind fuer deinen Shop keine aktiven Aktionen freigeschaltet.</Text>
        ) : (
          activeOffers.map((offer) => (
            <View key={offer.id} style={styles.offerMini}>
              <View style={styles.rowBetween}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <AppBadge text="Aktiv" tone="green" />
              </View>
              <Text style={styles.value}>{offer.description}</Text>
              <Text style={styles.meta}>Bestaetigt: {redemptionService.getConfirmedCount(offer.id)}</Text>
            </View>
          ))
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <AppButton
          label="Zur Profil-Wahl"
          variant="ghost"
          onPress={() => {
            goToRoleSelection();
            navigateToRoleSelection();
          }}
        />
        <AppButton label="Profil bearbeiten" onPress={() => router.push('/shop/edit-profile')} />
        <AppButton label="Abo" variant="secondary" onPress={() => router.push('/shop/subscription')} />
        <AppButton label="Einloesungen" variant="secondary" onPress={() => router.push('/shop/redemptions')} />
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
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  value: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  meta: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  warning: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  requestTitleWrap: {
    flex: 1,
    gap: 2,
  },
  requestTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xl,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  actionsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  hero: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  previewTextWrap: {
    flex: 1,
    gap: 3,
  },
  previewName: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xl,
  },
  previewSlogan: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  previewMeta: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  previewGrid: {
    gap: spacing.sm,
  },
  previewBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  previewBlockLabel: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  previewBlockValue: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  previewBlockMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  galleryImage: {
    width: 100,
    height: 78,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  offerMini: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  offerTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
});
