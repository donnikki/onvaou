import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockOffers } from '@/src/data/mockOffers';
import { Offer } from '@/src/types';

type OfferStore = {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
};

export const useOfferStore = create<OfferStore>()(
  persist(
    (set) => ({
      offers: mockOffers,
      setOffers: (offers) => set({ offers }),
    }),
    {
      name: 'biel-offer-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<OfferStore>;

        return {
          ...state,
          offers: state.offers ?? mockOffers,
        };
      },
      partialize: (state) => ({
        offers: state.offers,
      }),
    },
  ),
);
