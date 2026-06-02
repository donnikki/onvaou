import { StyleSheet, Text, View } from 'react-native';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { redemptionService } from '@/src/services/redemptionService';
import { shopService } from '@/src/services/shopService';
import { useOfferStore } from '@/src/store/offerStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH } from '@/src/utils/date';

type UserCompletedActionsCardProps = {
  userId: string;
  limit?: number;
};

export function UserCompletedActionsCard({ userId, limit = 8 }: UserCompletedActionsCardProps) {
  const offers = useOfferStore((state) => state.offers);
  const completed = redemptionService
    .listByUserId(userId)
    .filter((entry) => entry.status === 'confirmed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Vergangene Aktionen</Text>

      {completed.length === 0 ? (
        <Text style={styles.empty}>Noch keine erledigten Aktionen.</Text>
      ) : (
        completed.map((entry) => {
          const offer = offers.find((item) => item.id === entry.offerId);
          const shop = offer ? shopService.getById(offer.shopId) : null;

          return (
            <View key={entry.id} style={styles.item}>
              <View style={styles.row}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {offer?.title ?? 'Aktion'}
                </Text>
                <AppBadge text={`+${entry.pointsAwarded} Punkte`} tone="green" />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText} numberOfLines={1}>
                  {shop?.name ?? offer?.shopId ?? entry.shopId}
                </Text>
                <Text style={styles.metaText}>{formatDateCH(entry.createdAt)}</Text>
              </View>
            </View>
          );
        })
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  item: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  itemTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
});
