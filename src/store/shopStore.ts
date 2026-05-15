import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockShops } from '@/src/data/mockShops';
import { ShopProfile } from '@/src/types';

type ShopStore = {
  shops: ShopProfile[];
  setShops: (shops: ShopProfile[]) => void;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      shops: mockShops,
      setShops: (shops) => set({ shops }),
    }),
    {
      name: 'biel-shop-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        shops: state.shops,
      }),
    },
  ),
);
