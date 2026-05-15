import { authService } from '@/src/services/authService';
import { offerService } from '@/src/services/offerService';
import { pointsService } from '@/src/services/pointsService';
import { Offer, OfferRedemption } from '@/src/types';

const nowIso = () => new Date().toISOString();
type RedemptionLimitedOffer = Pick<Offer, 'id' | 'inventoryTotal' | 'maxRedemptions'>;

let redemptions: OfferRedemption[] = [];

const getConfirmedCount = (offerId: string) =>
  redemptions.filter((entry) => entry.offerId === offerId && entry.status === 'confirmed').length;

const getOfferPointsReward = (offer: Offer) => {
  if (offer.pointsReward && offer.pointsReward > 0) {
    return offer.pointsReward;
  }

  if (offer.discountPercent) {
    return Math.max(20, offer.discountPercent * 2);
  }

  return 40;
};

export const redemptionService = {
  listAll() {
    return redemptions;
  },

  listByOfferId(offerId: string) {
    return redemptions.filter((entry) => entry.offerId === offerId);
  },

  listByShopId(shopId: string) {
    return redemptions.filter((entry) => entry.shopId === shopId);
  },

  listByUserId(userId: string) {
    return redemptions.filter((entry) => entry.userId === userId);
  },

  getConfirmedCount,

  getRemainingForOffer(offer: RedemptionLimitedOffer) {
    const limit = offer.inventoryTotal ?? offer.maxRedemptions;
    if (!limit) {
      return null;
    }

    return Math.max(0, limit - getConfirmedCount(offer.id));
  },

  async confirmRedemption(input: {
    offerId: string;
    qrCodeValue: string;
    confirmedByShopUserId: string;
  }) {
    const offer = offerService.getAll().find((entry) => entry.id === input.offerId);
    if (!offer) {
      return { ok: false as const, message: 'Aktion wurde nicht gefunden.' };
    }

    if (offer.status !== 'active') {
      return { ok: false as const, message: 'Diese Aktion ist nicht aktiv.' };
    }

    const profile = authService.getByQrCode(input.qrCodeValue.trim());
    if (!profile) {
      return { ok: false as const, message: 'QR-Code ist unbekannt.' };
    }

    if (profile.role !== 'user') {
      return { ok: false as const, message: 'Nur Nutzerprofile koennen diese Aktion einloesen.' };
    }

    const remaining = this.getRemainingForOffer(offer);
    if (remaining !== null && remaining <= 0) {
      return { ok: false as const, message: 'Diese Aktion ist bereits ausgeschopft.' };
    }

    const alreadyRedeemed = redemptions.some(
      (entry) => entry.offerId === offer.id && entry.userId === profile.id && entry.status === 'confirmed',
    );
    if (alreadyRedeemed) {
      return { ok: false as const, message: 'Dieses Profil hat die Aktion bereits bestaetigt.' };
    }

    const pointsAwarded = getOfferPointsReward(offer);
    const redemption: OfferRedemption = {
      id: `redeem-${Date.now()}`,
      offerId: offer.id,
      shopId: offer.shopId,
      userId: profile.id,
      qrCodeValue: input.qrCodeValue.trim(),
      confirmedByShopUserId: input.confirmedByShopUserId,
      pointsAwarded,
      status: 'confirmed',
      createdAt: nowIso(),
    };

    redemptions = [redemption, ...redemptions];

    await pointsService.addPoints({
      userId: profile.id,
      shopId: offer.shopId,
      points: pointsAwarded,
      reason: `Aktion eingeloest: ${offer.title}`,
      source: 'deal',
    });

    return {
      ok: true as const,
      message: `${profile.name} wurde bestaetigt und hat ${pointsAwarded} Punkte erhalten.`,
      redemption,
    };
  },
};
