export type OfferType =
  | 'percent'
  | 'free_item'
  | 'free_with_purchase'
  | 'two_for_one'
  | 'fixed_price'
  | 'bundle'
  | 'first_x_visitors'
  | 'limited_reward'
  | 'group_visit'
  | 'happy_hour'
  | 'points_boost'
  | 'special';

export type OfferStatus = 'pending_shop' | 'active' | 'declined' | 'paused' | 'expired';

export type Offer = {
  id: string;
  shopId: string;
  title: string;
  description: string;
  type: OfferType;
  discountPercent?: number;
  freeItem?: string;
  purchaseRequirement?: string;
  fixedPriceLabel?: string;
  bundleDetails?: string;
  maxRedemptions?: number;
  inventoryTotal?: number;
  rewardLabel?: string;
  friendsRequired?: number;
  pointsReward?: number;
  validUntil: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
};

export type ActionTemplate = {
  id: string;
  name: string;
  type: OfferType;
  title: string;
  description: string;
  discountPercent?: number;
  freeItem?: string;
  purchaseRequirement?: string;
  fixedPriceLabel?: string;
  bundleDetails?: string;
  maxRedemptions?: number;
  inventoryTotal?: number;
  rewardLabel?: string;
  friendsRequired?: number;
  pointsReward?: number;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
};
