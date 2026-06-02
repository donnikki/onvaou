import { ReactNode, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { colors, spacing, typography } from '@/src/theme';
import { Offer, ShopProfile } from '@/src/types';
import { formatDateCH } from '@/src/utils/date';
import { getOfferConditionLabel, getOfferPromotionLabel, getOfferRewardLabel } from '@/src/utils/offers';
import { getShopContentConfig, getTodayOpeningSummary, openingDayLabels, openingDayOrder } from '@/src/utils/shopProfile';

type ShopPublicProfileProps = {
  shop: ShopProfile;
  offers: Offer[];
  isFavorite?: boolean;
  previewMode?: boolean;
  onToggleFavorite?: () => void;
};

type SectionId = 'hours' | 'primary' | 'secondary' | 'gallery' | 'about';

const initialOpenState: Record<SectionId, boolean> = {
  hours: false,
  primary: true,
  secondary: true,
  gallery: true,
  about: false,
};

export const ShopPublicProfile = ({
  shop,
  offers,
  isFavorite = false,
  previewMode = false,
  onToggleFavorite,
}: ShopPublicProfileProps) => {
  const [openSections, setOpenSections] = useState(initialOpenState);
  const contentConfig = getShopContentConfig(shop.category);
  const todayLabel = getTodayOpeningSummary(shop.openingHours);

  const primaryItems = useMemo(
    () => (contentConfig.primaryKind === 'products' ? shop.products : shop.services),
    [contentConfig.primaryKind, shop.products, shop.services],
  );
  const secondaryItems = useMemo(
    () => (contentConfig.secondaryKind === 'products' ? shop.products : shop.services),
    [contentConfig.secondaryKind, shop.products, shop.services],
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: shop.heroImageUrl }} style={styles.hero} />

      <View style={styles.headWrap}>
        <View style={styles.headCard}>
          <Image source={{ uri: shop.logoUrl }} style={styles.logo} />
          <View style={styles.headText}>
            <View style={styles.badgeRow}>
              <AppBadge text={shop.category} tone="muted" />
              <AppBadge text={todayLabel.includes('geschlossen') ? 'Geschlossen' : 'Geoeffnet'} tone={todayLabel.includes('geschlossen') ? 'muted' : 'green'} />
            </View>
            <Text style={styles.name}>{shop.name}</Text>
            {shop.slogan ? <Text style={styles.slogan}>{shop.slogan}</Text> : null}
            <Text style={styles.meta}>{shop.street} {shop.houseNumber}, {shop.zip} {shop.city}</Text>
          </View>
        </View>
      </View>

      <AppCard style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktuelle Deals</Text>
          <AppBadge text={`${offers.length}`} tone={offers.length > 0 ? 'red' : 'muted'} />
        </View>
        {offers.length === 0 ? (
          <Text style={styles.emptyDealsText}>Aktuell keine aktiven Aktionen.</Text>
        ) : (
          <View style={styles.dealList}>
            {offers.slice(0, 3).map((offer, index) => (
              <View key={offer.id} style={[styles.dealCard, index === 0 && styles.dealCardPrimary]}>
                <Text style={[styles.dealTitle, index === 0 && styles.dealTitlePrimary]}>{offer.title}</Text>
                <Text style={[styles.dealText, index === 0 && styles.dealTextPrimary]}>{offer.description}</Text>
                {getOfferRewardLabel(offer) ? <Text style={[styles.dealMeta, index === 0 && styles.dealTextPrimary]}>{getOfferRewardLabel(offer)}</Text> : null}
                {getOfferConditionLabel(offer) ? <Text style={[styles.dealMeta, index === 0 && styles.dealTextPrimary]}>{getOfferConditionLabel(offer)}</Text> : null}
                {getOfferPromotionLabel(offer) ? <Text style={[styles.dealMetaStrong, index === 0 && styles.dealMetaStrongPrimary]}>{getOfferPromotionLabel(offer)}</Text> : null}
                <Text style={[styles.dealMeta, index === 0 && styles.dealTextPrimary]}>Gueltig bis {formatDateCH(offer.validUntil)}</Text>
              </View>
            ))}
          </View>
        )}
      </AppCard>

      {previewMode ? (
        <AppCard style={styles.previewNote}>
          <View style={styles.previewNoteRow}>
            <Ionicons name="eye-outline" size={18} color={colors.primaryRed} />
            <Text style={styles.previewNoteText}>Vorschau: So wirkt dein Profil fuer Nutzer in der App.</Text>
          </View>
        </AppCard>
      ) : null}

      {primaryItems.length > 0 ? (
        <CollapsibleSection
          title={contentConfig.primarySectionTitle}
          open={openSections.primary}
          onToggle={() => setOpenSections((value) => ({ ...value, primary: !value.primary }))}>
          <View style={styles.itemGrid}>
            {primaryItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                {'price' in item && item.price ? <Text style={styles.itemPrice}>{item.price}</Text> : null}
                {'priceFrom' in item && item.priceFrom ? <Text style={styles.itemPrice}>{item.priceFrom}</Text> : null}
              </View>
            ))}
          </View>
        </CollapsibleSection>
      ) : null}

      {secondaryItems.length > 0 ? (
        <CollapsibleSection
          title={contentConfig.secondarySectionTitle}
          open={openSections.secondary}
          onToggle={() => setOpenSections((value) => ({ ...value, secondary: !value.secondary }))}>
          <View style={styles.secondaryList}>
            {secondaryItems.map((item) => (
              <View key={item.id} style={styles.secondaryRow}>
                <Ionicons name="ellipse" size={8} color={colors.primaryRed} />
                <Text style={styles.secondaryText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title="Oeffnungszeiten"
        open={openSections.hours}
        onToggle={() => setOpenSections((value) => ({ ...value, hours: !value.hours }))}>
        <View style={styles.hoursList}>
          {openingDayOrder.map((dayKey) => {
            const day = shop.openingHours[dayKey];
            return (
              <View key={dayKey} style={styles.hourRow}>
                <Text style={styles.hourDay}>{openingDayLabels[dayKey]}</Text>
                <Text style={styles.hourValue}>{day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Geschlossen'}</Text>
              </View>
            );
          })}
        </View>
      </CollapsibleSection>

      {shop.galleryImageUrls.length > 0 ? (
        <CollapsibleSection
          title="Galerie"
          open={openSections.gallery}
          onToggle={() => setOpenSections((value) => ({ ...value, gallery: !value.gallery }))}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
            {shop.galleryImageUrls.map((imageUrl) => (
              <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.galleryImage} />
            ))}
          </ScrollView>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        title="Mehr zum Shop"
        open={openSections.about}
        onToggle={() => setOpenSections((value) => ({ ...value, about: !value.about }))}>
        <View style={styles.aboutWrap}>
          <Text style={styles.aboutText}>{shop.description}</Text>
          {shop.website ? <Text style={styles.infoText}>{shop.website}</Text> : null}
          <Text style={styles.infoText}>{shop.phone}</Text>
          <Text style={styles.infoText}>{shop.email}</Text>
        </View>
      </CollapsibleSection>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.outlineAction]}>
          <Ionicons name="call-outline" size={16} color={colors.primaryRed} />
          <Text style={styles.outlineActionText}>Anrufen</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.fillAction]}>
          <Text style={styles.fillActionText}>{contentConfig.callToActionLabel}</Text>
        </Pressable>
      </View>

      {!previewMode && onToggleFavorite ? (
        <AppButton label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten'} variant="secondary" onPress={onToggleFavorite} />
      ) : null}
    </ScrollView>
  );
};

type CollapsibleSectionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const CollapsibleSection = ({ title, open, onToggle, children }: CollapsibleSectionProps) => (
  <AppCard style={styles.card}>
    <Pressable style={styles.sectionHeader} onPress={onToggle}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
    </Pressable>
    {open ? children : null}
  </AppCard>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFDFC',
  },
  container: {
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  hero: {
    width: '100%',
    height: 260,
    backgroundColor: '#F3F4F6',
  },
  headWrap: {
    marginTop: -46,
    paddingHorizontal: spacing.lg,
  },
  headCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1E6E6',
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: spacing.lg,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  headText: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  slogan: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  previewNote: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#FFF7F7',
    borderColor: '#FBCACA',
  },
  previewNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewNoteText: {
    flex: 1,
    color: colors.primaryRedDark,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  dealList: {
    gap: spacing.sm,
  },
  emptyDealsText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  dealCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF9F9',
    padding: spacing.md,
    gap: spacing.xs,
  },
  dealCardPrimary: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  dealTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  dealTitlePrimary: {
    color: '#FFFFFF',
  },
  dealText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  dealTextPrimary: {
    color: '#FFFFFF',
  },
  dealMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  dealMetaStrong: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  dealMetaStrongPrimary: {
    color: '#FFFFFF',
  },
  itemGrid: {
    gap: spacing.sm,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1E6E6',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.xs,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  itemPrice: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  secondaryList: {
    gap: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  hoursList: {
    gap: spacing.sm,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourDay: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  hourValue: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  galleryRow: {
    gap: spacing.sm,
  },
  galleryImage: {
    width: 168,
    height: 126,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  aboutWrap: {
    gap: spacing.sm,
  },
  aboutText: {
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  infoText: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  actionRow: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  outlineAction: {
    borderWidth: 1,
    borderColor: colors.primaryRed,
    backgroundColor: '#FFFFFF',
  },
  outlineActionText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  fillAction: {
    backgroundColor: colors.primaryRed,
  },
  fillActionText: {
    color: '#FFFFFF',
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
});
