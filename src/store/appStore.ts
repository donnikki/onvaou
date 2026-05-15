import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ActionTemplate, ShopProfile } from '@/src/types';

type AppStore = {
  favoriteShopIds: string[];
  favoriteOfferIds: string[];
  offerTemplates: ActionTemplate[];
  selectedCategory: ShopProfile['category'] | null;
  featureFlags: {
    receiptScanningEnabled: boolean;
    lotteryEnabled: boolean;
    mockMode: boolean;
  };
  toggleFavoriteShop: (shopId: string) => void;
  toggleFavoriteOffer: (offerId: string) => void;
  upsertOfferTemplate: (template: ActionTemplate) => void;
  deleteOfferTemplate: (templateId: string) => void;
  setSelectedCategory: (category: ShopProfile['category'] | null) => void;
  setFeatureFlag: (key: keyof AppStore['featureFlags'], value: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      favoriteShopIds: [],
      favoriteOfferIds: [],
      offerTemplates: [],
      selectedCategory: 'Café',
      featureFlags: {
        receiptScanningEnabled: false,
        lotteryEnabled: false,
        mockMode: true,
      },

      toggleFavoriteShop: (shopId) =>
        set((state) => ({
          favoriteShopIds: state.favoriteShopIds.includes(shopId)
            ? state.favoriteShopIds.filter((id) => id !== shopId)
            : [shopId, ...state.favoriteShopIds],
        })),

      toggleFavoriteOffer: (offerId) =>
        set((state) => ({
          favoriteOfferIds: state.favoriteOfferIds.includes(offerId)
            ? state.favoriteOfferIds.filter((id) => id !== offerId)
            : [offerId, ...state.favoriteOfferIds],
        })),

      upsertOfferTemplate: (template) =>
        set((state) => ({
          offerTemplates: state.offerTemplates.some((item) => item.id === template.id)
            ? state.offerTemplates.map((item) => (item.id === template.id ? template : item))
            : [template, ...state.offerTemplates],
        })),

      deleteOfferTemplate: (templateId) =>
        set((state) => ({
          offerTemplates: state.offerTemplates.filter((template) => template.id !== templateId),
        })),

      setSelectedCategory: (category) =>
        set({
          selectedCategory: category,
        }),

      setFeatureFlag: (key, value) =>
        set((state) => ({
          featureFlags: {
            ...state.featureFlags,
            [key]: value,
          },
        })),
    }),
    {
      name: 'biel-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favoriteShopIds: state.favoriteShopIds,
        favoriteOfferIds: state.favoriteOfferIds,
        offerTemplates: state.offerTemplates,
        selectedCategory: state.selectedCategory,
        featureFlags: state.featureFlags,
      }),
    },
  ),
);
