import { redemptionService } from '@/src/services/redemptionService';
import { ActionTemplate, Offer } from '@/src/types';

type OfferLike = Pick<
  Offer,
  | 'id'
  | 'type'
  | 'discountPercent'
  | 'freeItem'
  | 'fixedPriceLabel'
  | 'inventoryTotal'
  | 'maxRedemptions'
  | 'friendsRequired'
  | 'pointsReward'
  | 'rewardLabel'
> &
  Partial<Pick<Offer, 'purchaseRequirement' | 'bundleDetails'>>;

export const getOfferBadgeLabel = (offer: OfferLike | ActionTemplate) => {
  const remaining = redemptionService.getRemainingForOffer(offer);
  if (remaining !== null && (offer.type === 'limited_reward' || offer.type === 'first_x_visitors')) {
    return `${remaining}`;
  }

  if (offer.discountPercent) {
    return `-${offer.discountPercent}%`;
  }

  if (offer.pointsReward) {
    return `+${offer.pointsReward}`;
  }

  return 'Deal';
};

export const getOfferConditionLabel = (offer: OfferLike | ActionTemplate) => {
  const remaining = redemptionService.getRemainingForOffer(offer);
  if (remaining !== null) {
    return `Noch ${remaining} verfuegbar`;
  }

  if (offer.friendsRequired) {
    return `Gueltig mit ${offer.friendsRequired} ${offer.friendsRequired === 1 ? 'Freund' : 'Freunden'}`;
  }

  if (offer.pointsReward) {
    return `${offer.pointsReward} Punkte bei Bestaetigung`;
  }

  return null;
};

export const getOfferRewardLabel = (offer: OfferLike | ActionTemplate) => {
  if (offer.rewardLabel) {
    return offer.rewardLabel;
  }

  if (offer.freeItem) {
    return `Gratis: ${offer.freeItem}`;
  }

  if (offer.fixedPriceLabel) {
    return `Aktionspreis: ${offer.fixedPriceLabel}`;
  }

  return null;
};

export const getOfferPromotionLabel = (offer: Pick<Offer, 'promotion'>) => {
  const promotion = offer.promotion;

  if (!promotion) {
    return null;
  }

  if (promotion.notificationBlast && promotion.featuredPlacement) {
    return `Promotion: Push an alle Nutzer + Top Platzierung`;
  }

  if (promotion.notificationBlast) {
    return `Promotion: Push an alle Nutzer`;
  }

  if (promotion.featuredPlacement) {
    return `Promotion: Top Platzierung in Deals`;
  }

  return null;
};

export const getOfferPromotionPriority = (offer: Pick<Offer, 'promotion'>) => {
  if (offer.promotion?.featuredPlacement && offer.promotion?.notificationBlast) {
    return 3;
  }

  if (offer.promotion?.featuredPlacement) {
    return 2;
  }

  if (offer.promotion?.notificationBlast) {
    return 1;
  }

  return 0;
};
