import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ActionTemplate, ShopProfile } from '@/src/types';
import { defaultSelectedCategories, normalizeSelectedCategories } from '@/src/utils/shopCategories';

export type HintId =
  | 'discover-map-marker'
  | 'shop-profile-symbol-step'
  | 'deals-approval'
  | 'admin-review';

export type PendingTestLogin =
  | { type: 'user'; userId: string }
  | { type: 'shop'; shopId: string }
  | { type: 'admin' }
  | { type: 'simulated-market' };

export type TempScenario = {
  kind: 'simulated-market';
  restoreShops: ShopProfile[];
};

type AppStore = {
  favoriteShopIds: string[];
  favoriteOfferIds: string[];
  offerTemplates: ActionTemplate[];
  selectedCategories: ShopProfile['category'][];
  hasSeenAppIntro: boolean;
  dismissedHints: Record<HintId, boolean>;
  pendingTestLogin: PendingTestLogin | null;
  tempScenario: TempScenario | null;
  featureFlags: {
    receiptScanningEnabled: boolean;
    lotteryEnabled: boolean;
    mockMode: boolean;
  };
  toggleFavoriteShop: (shopId: string) => void;
  toggleFavoriteOffer: (offerId: string) => void;
  upsertOfferTemplate: (template: ActionTemplate) => void;
  deleteOfferTemplate: (templateId: string) => void;
  setSelectedCategories: (categories: ShopProfile['category'][]) => void;
  markAppIntroSeen: () => void;
  setAppIntroSeen: (seen: boolean) => void;
  dismissHint: (hintId: HintId) => void;
  setPendingTestLogin: (login: PendingTestLogin | null) => void;
  setTempScenario: (scenario: TempScenario | null) => void;
  setFeatureFlag: (key: keyof AppStore['featureFlags'], value: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      favoriteShopIds: [],
      favoriteOfferIds: [],
      offerTemplates: [],
      selectedCategories: defaultSelectedCategories,
      hasSeenAppIntro: false,
      dismissedHints: {
        'discover-map-marker': false,
        'shop-profile-symbol-step': false,
        'deals-approval': false,
        'admin-review': false,
      },
      pendingTestLogin: null,
      tempScenario: null,
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

      setSelectedCategories: (categories) =>
        set({
          selectedCategories: normalizeSelectedCategories(categories),
        }),

      markAppIntroSeen: () =>
        set({
          hasSeenAppIntro: true,
        }),

      setAppIntroSeen: (seen) =>
        set({
          hasSeenAppIntro: seen,
        }),

      dismissHint: (hintId) =>
        set((state) => ({
          dismissedHints: {
            ...state.dismissedHints,
            [hintId]: true,
          },
        })),

      setPendingTestLogin: (login) =>
        set({
          pendingTestLogin: login,
        }),

      setTempScenario: (scenario) =>
        set({
          tempScenario: scenario,
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
      version: 5,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<AppStore> & {
          selectedCategory?: ShopProfile['category'] | null;
        };

        return {
          ...state,
          selectedCategories: normalizeSelectedCategories(
            state.selectedCategories ?? (state.selectedCategory ? [state.selectedCategory] : defaultSelectedCategories),
          ),
          hasSeenAppIntro: state.hasSeenAppIntro ?? false,
          dismissedHints: {
            'discover-map-marker': state.dismissedHints?.['discover-map-marker'] ?? false,
            'shop-profile-symbol-step': state.dismissedHints?.['shop-profile-symbol-step'] ?? false,
            'deals-approval': state.dismissedHints?.['deals-approval'] ?? false,
            'admin-review': state.dismissedHints?.['admin-review'] ?? false,
          },
          pendingTestLogin: state.pendingTestLogin ?? null,
          tempScenario: state.tempScenario ?? null,
        };
      },
      partialize: (state) => ({
        favoriteShopIds: state.favoriteShopIds,
        favoriteOfferIds: state.favoriteOfferIds,
        offerTemplates: state.offerTemplates,
        selectedCategories: state.selectedCategories,
        hasSeenAppIntro: state.hasSeenAppIntro,
        dismissedHints: state.dismissedHints,
        pendingTestLogin: state.pendingTestLogin,
        tempScenario: state.tempScenario,
        featureFlags: state.featureFlags,
      }),
    },
  ),
);
