import * as Linking from 'expo-linking';

import { Subscription, SubscriptionProduct, SubscriptionStatus } from '@/src/types';
import { env } from '@/src/utils/env';

export const SHOP_SUBSCRIPTION_MONTHLY = 'biel_shop_monthly';
export const SHOP_SUBSCRIPTION_YEARLY = 'biel_shop_yearly';

let currentSubscription: Subscription | null = null;

const products: SubscriptionProduct[] = [
  {
    productId: SHOP_SUBSCRIPTION_MONTHLY,
    title: 'Monatsabo',
    description: 'Monatliche Sichtbarkeit und Deal-Verwaltung für deinen Shop.',
    priceLabel: 'CHF 29 / Monat',
  },
  {
    productId: SHOP_SUBSCRIPTION_YEARLY,
    title: 'Jahresabo',
    description: 'Jahrespaket mit reduziertem Preis.',
    priceLabel: 'CHF 290 / Jahr',
  },
];

const nextPeriodEnd = (productId: string) => {
  const date = new Date();
  if (productId === SHOP_SUBSCRIPTION_YEARLY) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString();
};

const buildSubscription = (productId: string): Subscription => ({
  id: `sub-${Date.now()}`,
  userId: 'shop-owner-1',
  shopId: 'shop-choppers',
  productId,
  platform: env.enableMockIap ? 'mock' : 'ios',
  status: 'active',
  currentPeriodEnd: nextPeriodEnd(productId),
  originalTransactionId: `orig-${Date.now()}`,
  latestTransactionId: `latest-${Date.now()}`,
});

export const subscriptionService = {
  async getShopSubscriptionProducts() {
    return products;
  },

  async purchaseShopSubscription(productId: string) {
    if (!env.enableMockIap) {
      throw new Error('Apple IAP ist noch nicht konfiguriert. Bitte TestFlight/StoreKit nutzen.');
    }

    currentSubscription = buildSubscription(productId);
    return currentSubscription;
  },

  async restorePurchases() {
    return currentSubscription;
  },

  async getCurrentSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!currentSubscription) {
      return 'inactive';
    }

    if (!currentSubscription.currentPeriodEnd) {
      return currentSubscription.status;
    }

    const periodEnd = new Date(currentSubscription.currentPeriodEnd).getTime();
    if (periodEnd < Date.now()) {
      currentSubscription = {
        ...currentSubscription,
        status: 'expired',
      };
      return 'expired';
    }

    return currentSubscription.status;
  },

  async openAppleManageSubscriptions() {
    const url = 'https://apps.apple.com/account/subscriptions';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  },

  async validateSubscriptionWithBackend(receiptOrTransaction: string) {
    if (env.enableMockIap) {
      return {
        valid: Boolean(receiptOrTransaction),
        status: await this.getCurrentSubscriptionStatus(),
      };
    }

    return {
      valid: false,
      status: 'inactive' as SubscriptionStatus,
    };
  },
};
