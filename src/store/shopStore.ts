import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockShops } from '@/src/data/mockShops';
import { ShopProfile } from '@/src/types';
import { normalizeShopProfiles } from '@/src/utils/shopCategories';

type ShopStore = {
  shops: ShopProfile[];
  setShops: (shops: ShopProfile[]) => void;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      shops: normalizeShopProfiles(mockShops),
      setShops: (shops) => set({ shops: normalizeShopProfiles(shops) }),
    }),
    {
      name: 'biel-shop-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<ShopStore>;

        return {
          ...state,
          shops: normalizeShopProfiles(state.shops ?? mockShops),
        };
      },
      partialize: (state) => ({
        shops: state.shops,
      }),
    },
  ),
);
