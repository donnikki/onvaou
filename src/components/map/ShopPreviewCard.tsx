import { Image, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { colors, spacing, typography } from '@/src/theme';
import { Offer, ShopProfile } from '@/src/types';
import { getOfferConditionLabel } from '@/src/utils/offers';

type ShopPreviewCardProps = {
  shop: ShopProfile;
  offer?: Offer;
  onOpenProfile: () => void;
};

export const ShopPreviewCard = ({ shop, offer, onOpenProfile }: ShopPreviewCardProps) => {
  const condition = offer ? getOfferConditionLabel(offer) : null;

  return (
    <AppCard style={styles.card}>
      <View style={styles.top}>
        <Image source={{ uri: shop.logoUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{shop.name}</Text>
          <Text style={styles.category}>{shop.category}</Text>
          {offer ? <Text style={styles.deal}>{offer.title}</Text> : <Text style={styles.muted}>Aktuell kein Deal</Text>}
          {condition ? <Text style={styles.muted}>{condition}</Text> : null}
        </View>
        {offer?.discountPercent ? <AppBadge text={`-${offer.discountPercent}%`} /> : null}
      </View>
      <AppButton label="Profil oeffnen" onPress={onOpenProfile} />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  category: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  deal: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
});
