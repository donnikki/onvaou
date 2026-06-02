import { mockOffers } from '@/src/data/mockOffers';
import { Offer, OfferPromotion, OfferPromotionType, OfferStatus } from '@/src/types';
import { useOfferStore } from '@/src/store/offerStore';

const nowIso = () => new Date().toISOString();

const getOffers = () => useOfferStore.getState().offers;
const setOffers = (offers: Offer[]) => useOfferStore.getState().setOffers(offers);

const buildPromotion = (type: OfferPromotionType): OfferPromotion | undefined => {
  const purchasedAt = nowIso();

  if (type === 'none') {
    return undefined;
  }

  if (type === 'notification_blast') {
    return {
      type,
      priceLabel: 'CHF 19',
      purchasedAt,
      notificationBlast: true,
      featuredPlacement: false,
    };
  }

  if (type === 'featured_placement') {
    return {
      type,
      priceLabel: 'CHF 29',
      purchasedAt,
      notificationBlast: false,
      featuredPlacement: true,
    };
  }

  return {
    type,
    priceLabel: 'CHF 39',
    purchasedAt,
    notificationBlast: true,
    featuredPlacement: true,
  };
};

export const offerService = {
  getAll() {
    return getOffers();
  },

  getByShopId(shopId: string) {
    return getOffers().filter((offer) => offer.shopId === shopId);
  },

  getActive() {
    return getOffers().filter((offer) => offer.status === 'active');
  },

  getPendingForShop(shopId: string) {
    return getOffers().filter((offer) => offer.shopId === shopId && offer.status === 'pending_shop');
  },

  getDeclinedForShop(shopId: string) {
    return getOffers().filter((offer) => offer.shopId === shopId && offer.status === 'declined');
  },

  replaceAll(nextOffers: Offer[]) {
    setOffers([...nextOffers]);
    return getOffers();
  },

  reset() {
    setOffers([...mockOffers]);
    return getOffers();
  },

  create(input: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) {
    const offer: Offer = {
      ...input,
      id: `offer-${Date.now()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setOffers([offer, ...getOffers()]);

    return offer;
  },

  createAdminProposal(input: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    return this.create({
      ...input,
      status: 'pending_shop',
    });
  },

  updateStatus(id: string, status: OfferStatus) {
    const nextOffers: Offer[] = getOffers().map((offer) =>
      offer.id === id
        ? {
            ...offer,
            status,
            updatedAt: nowIso(),
          }
        : offer,
    );
    setOffers(nextOffers);

    return nextOffers.find((offer) => offer.id === id) ?? null;
  },

  acceptByShop(id: string, promotionType: OfferPromotionType = 'none') {
    const promotion = buildPromotion(promotionType);

    const nextOffers: Offer[] = getOffers().map((offer) =>
      offer.id === id
        ? {
            ...offer,
            status: 'active',
            promotion,
            updatedAt: nowIso(),
          }
        : offer,
    );
    setOffers(nextOffers);

    return nextOffers.find((offer) => offer.id === id) ?? null;
  },

  declineByShop(id: string) {
    return this.updateStatus(id, 'declined');
  },
};
