export type OfferRedemptionStatus = 'confirmed' | 'cancelled';

export type OfferRedemption = {
  id: string;
  offerId: string;
  shopId: string;
  userId: string;
  qrCodeValue: string;
  confirmedByShopUserId: string;
  pointsAwarded: number;
  status: OfferRedemptionStatus;
  createdAt: string;
};
