import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { subscriptionService } from '@/src/services/subscriptionService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';

export default function ShopSubscriptionStatusScreen() {
  const [status, setStatus] = useState('inactive');
  const setShopExpired = useAuthStore((state) => state.setShopExpired);

  useEffect(() => {
    subscriptionService.getCurrentSubscriptionStatus().then(setStatus);
  }, []);

  return (
    <Screen>
      <Text style={styles.heading}>Abo</Text>
      <AppCard style={styles.card}>
        <Text style={styles.label}>Aktueller Status</Text>
        <Text style={styles.value}>{status}</Text>
        <AppButton
          label="Kaeufe wiederherstellen"
          variant="secondary"
          onPress={async () => {
            const restored = await subscriptionService.restorePurchases();
            setStatus(restored?.status ?? 'inactive');
          }}
        />
        <AppButton
          label="Abo als abgelaufen simulieren"
          variant="ghost"
          onPress={() => {
            setShopExpired();
            setStatus('expired');
          }}
        />
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
  label: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  value: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
});
