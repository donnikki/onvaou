import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { subscriptionService } from '@/src/services/subscriptionService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { SubscriptionProduct } from '@/src/types';
import { env } from '@/src/utils/env';

export default function ShopSubscriptionScreen() {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [restoreState, setRestoreState] = useState('');
  const [error, setError] = useState('');

  const activateShopRole = useAuthStore((state) => state.activateShopRole);
  const setShopSubscriptionStatus = useAuthStore((state) => state.setShopSubscriptionStatus);

  useEffect(() => {
    subscriptionService.getShopSubscriptionProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const benefits = useMemo(
    () => [
      'Auf der Biel-Karte erscheinen',
      'Eigenes Shop-Profil erstellen',
      'Aktionen und Deals verwalten',
      'Von Nutzern gefunden werden',
      'Spaeter Statistiken und Einloesungen sehen',
    ],
    [],
  );

  const purchase = async (productId: string) => {
    setError('');
    setLoadingProductId(productId);
    try {
      await subscriptionService.purchaseShopSubscription(productId);
      setShopSubscriptionStatus('active');
      activateShopRole();
      router.push('/onboarding/shop-profile');
    } catch (purchaseError) {
      const message = purchaseError instanceof Error ? purchaseError.message : 'Abo konnte nicht gestartet werden.';
      setError(message);
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <Screen>
      <StepHeader
        title="Shop-Abo aktivieren"
        subtitle="Damit dein Geschaeft in Biel angezeigt wird und Aktionen veroeffentlichen kann, brauchst du ein aktives Shop-Abo."
        step="Schritt 2"
      />

      <AppCard style={styles.card}>
        {benefits.map((benefit) => (
          <Text style={styles.benefit} key={benefit}>
            - {benefit}
          </Text>
        ))}
      </AppCard>

      {products.map((product) => (
        <AppCard style={styles.card} key={product.productId}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{product.title}</Text>
            <AppBadge text={product.priceLabel} tone="muted" />
          </View>
          <Text style={styles.text}>{product.description}</Text>
          <AppButton
            label={product.productId.includes('yearly') ? 'Jahresabo starten' : 'Monatsabo starten'}
            loading={loadingProductId === product.productId}
            onPress={() => purchase(product.productId)}
          />
        </AppCard>
      ))}

      <View style={styles.actions}>
        <AppButton
          label="Kaeufe wiederherstellen"
          variant="secondary"
          onPress={async () => {
            const restored = await subscriptionService.restorePurchases();
            if (restored) {
              setRestoreState('Kauf wiederhergestellt.');
              setShopSubscriptionStatus('active');
              activateShopRole();
              router.push('/onboarding/shop-profile');
            } else {
              setRestoreState('Kein Kauf gefunden.');
            }
          }}
        />
        <AppButton
          label="Abo bei Apple verwalten"
          variant="ghost"
          onPress={() => {
            subscriptionService.openAppleManageSubscriptions().catch(() => {
              Linking.openURL('https://apps.apple.com/account/subscriptions').catch(() => undefined);
            });
          }}
        />
        {env.enableMockIap ? (
          <AppButton
            label="Abo simulieren (DEV)"
            onPress={() => {
              setShopSubscriptionStatus('active');
              activateShopRole();
              router.push('/onboarding/shop-profile');
            }}
          />
        ) : null}
      </View>

      {restoreState ? <Text style={styles.success}>{restoreState}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  benefit: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  actions: {
    gap: spacing.md,
  },
  success: {
    color: colors.success,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
});
