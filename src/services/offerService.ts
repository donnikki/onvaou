import { mockOffers } from '@/src/data/mockOffers';
import { Offer, OfferStatus } from '@/src/types';

const nowIso = () => new Date().toISOString();
let offers = [...mockOffers];

export const offerService = {
  getAll() {
    return offers;
  },

  getByShopId(shopId: string) {
    return offers.filter((offer) => offer.shopId === shopId);
  },

  getActive() {
    return offers.filter((offer) => offer.status === 'active');
  },

  getPendingForShop(shopId: string) {
    return offers.filter((offer) => offer.shopId === shopId && offer.status === 'pending_shop');
  },

  getDeclinedForShop(shopId: string) {
    return offers.filter((offer) => offer.shopId === shopId && offer.status === 'declined');
  },

  create(input: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) {
    const offer: Offer = {
      ...input,
      id: `offer-${Date.now()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    offers = [offer, ...offers];

    return offer;
  },

  createAdminProposal(input: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    return this.create({
      ...input,
      status: 'pending_shop',
    });
  },

  updateStatus(id: string, status: OfferStatus) {
    offers = offers.map((offer) =>
      offer.id === id
        ? {
            ...offer,
            status,
            updatedAt: nowIso(),
          }
        : offer,
    );

    return offers.find((offer) => offer.id === id) ?? null;
  },

  acceptByShop(id: string) {
    return this.updateStatus(id, 'active');
  },

  declineByShop(id: string) {
    return this.updateStatus(id, 'declined');
  },
};
