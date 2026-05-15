export type SubscriptionStatus = 'inactive' | 'active' | 'expired' | 'canceled';

export type SubscriptionPlatform = 'ios' | 'android' | 'web' | 'mock';

export type Subscription = {
  id: string;
  userId: string;
  shopId?: string;
  productId: string;
  platform: SubscriptionPlatform;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  originalTransactionId?: string;
  latestTransactionId?: string;
};

export type SubscriptionProduct = {
  productId: string;
  title: string;
  description: string;
  priceLabel: string;
};
