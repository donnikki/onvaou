import { useShopStore } from '@/src/store/shopStore';
import { ShopCategory, ShopProfile } from '@/src/types';

const nowIso = () => new Date().toISOString();

const getShops = () => useShopStore.getState().shops;
const setShops = (shops: ShopProfile[]) => useShopStore.getState().setShops(shops);

export const shopService = {
  getAll(category?: ShopCategory) {
    const shops = getShops();

    if (!category) {
      return shops;
    }

    return shops.filter((shop) => shop.category === category);
  },

  getById(id: string) {
    const shops = getShops();
    return shops.find((shop) => shop.id === id) ?? null;
  },

  getMapVisibleShops(category?: ShopCategory) {
    const shops = getShops();
    const filtered = category ? shops.filter((shop) => shop.category === category) : shops;

    return filtered.filter(
      (shop) =>
        shop.isVisibleOnMap &&
        shop.adminApproved &&
        shop.subscriptionStatus === 'active',
    );
  },

  upsert(shop: ShopProfile) {
    const shops = getShops();
    const existing = shops.some((item) => item.id === shop.id);

    if (existing) {
      const nextShops = shops.map((item) =>
        item.id === shop.id
          ? {
              ...shop,
              updatedAt: nowIso(),
            }
          : item,
      );
      setShops(nextShops);
      return nextShops.find((item) => item.id === shop.id) ?? shop;
    }

    const next = {
      ...shop,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setShops([next, ...shops]);

    return next;
  },

  updateApproval(id: string, adminApproved: boolean) {
    const nextShops = getShops().map((shop) =>
      shop.id === id
        ? {
            ...shop,
            adminApproved,
            updatedAt: nowIso(),
          }
        : shop,
    );

    setShops(nextShops);
    return nextShops.find((shop) => shop.id === id) ?? null;
  },

  updateVisibility(id: string, isVisibleOnMap: boolean) {
    const nextShops = getShops().map((shop) =>
      shop.id === id
        ? {
            ...shop,
            isVisibleOnMap,
            updatedAt: nowIso(),
          }
        : shop,
    );

    setShops(nextShops);
    return nextShops.find((shop) => shop.id === id) ?? null;
  },

  updateSubscriptionStatus(id: string, status: ShopProfile['subscriptionStatus']) {
    const nextShops = getShops().map((shop) =>
      shop.id === id
        ? {
            ...shop,
            subscriptionStatus: status,
            isVisibleOnMap: status === 'active' ? shop.isVisibleOnMap : false,
            updatedAt: nowIso(),
          }
        : shop,
    );

    setShops(nextShops);
    return nextShops.find((shop) => shop.id === id) ?? null;
  },

  updateShopBasics(
    id: string,
    updates: Partial<
      Pick<
        ShopProfile,
        | 'name'
        | 'category'
        | 'description'
        | 'slogan'
        | 'street'
        | 'houseNumber'
        | 'zip'
        | 'city'
        | 'country'
        | 'phone'
        | 'email'
        | 'website'
        | 'logoUrl'
        | 'heroImageUrl'
      >
    >,
  ) {
    const nextShops = getShops().map((shop) =>
      shop.id === id
        ? {
            ...shop,
            ...updates,
            updatedAt: nowIso(),
          }
        : shop,
    );

    setShops(nextShops);
    return nextShops.find((shop) => shop.id === id) ?? null;
  },

  deleteShop(id: string) {
    const shops = getShops();
    const exists = shops.some((shop) => shop.id === id);
    setShops(shops.filter((shop) => shop.id !== id));
    return exists;
  },
};
