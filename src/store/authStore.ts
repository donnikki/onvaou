import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/src/services/authService';
import { shopService } from '@/src/services/shopService';
import { SubscriptionStatus, UserProfile } from '@/src/types';

export const ADMIN_EMAILS = ['admin@biel.local'];
const createDraftShopId = () => `shop-${Date.now()}`;

type AuthStore = {
  currentUser: UserProfile | null;
  selectedRole: 'user' | 'shop' | 'admin' | null;
  onboardingCompleted: boolean;
  shopSubscriptionStatus: SubscriptionStatus;
  activeShopId: string | null;
  adminSessionUser: UserProfile | null;
  isImpersonating: boolean;
  startShopOnboarding: () => void;
  selectRole: (role: 'user' | 'shop' | 'admin') => void;
  createUserProfile: (input: Pick<UserProfile, 'name' | 'birthDate' | 'email' | 'phone'>) => UserProfile;
  loginAsAdmin: (email: string, password: string) => boolean;
  setShopSubscriptionStatus: (status: SubscriptionStatus) => void;
  activateShopRole: (shopId?: string) => void;
  setShopExpired: () => void;
  continueAsGuest: () => void;
  goToRoleSelection: () => void;
  impersonateUser: (userId: string) => boolean;
  impersonateShop: (shopId: string) => boolean;
  returnToAdmin: () => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      selectedRole: null,
      onboardingCompleted: false,
      shopSubscriptionStatus: 'inactive',
      activeShopId: null,
      adminSessionUser: null,
      isImpersonating: false,

      startShopOnboarding: () =>
        set((state) => {
          const draftShopId = createDraftShopId();

          return {
          selectedRole: 'shop',
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                role: 'shop_pending_subscription',
              }
            : {
                id: 'shop-owner-pending',
                role: 'shop_pending_subscription',
                name: 'Shop Owner',
                birthDate: '1990-01-01',
                email: 'shop@biel.local',
                phone: '+41 79 000 00 00',
                qrCodeValue: authService.buildQrCodeValue('shop-owner-pending'),
                pointsBalance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
          shopSubscriptionStatus: 'inactive',
          onboardingCompleted: false,
          activeShopId: draftShopId,
        };
        }),

      selectRole: (role) =>
        set({
          selectedRole: role,
        }),

      createUserProfile: (input) => {
        const user = authService.createUserProfile(input);
        set({
          currentUser: user,
          selectedRole: 'user',
          onboardingCompleted: true,
        });

        return user;
      },

      loginAsAdmin: (email, password) => {
        const isAllowed = ADMIN_EMAILS.includes(email.toLowerCase()) && password === 'admin123';

        if (!isAllowed) {
          return false;
        }

        const existingAdmin = authService.getByEmail(email);
        if (!existingAdmin) {
          return false;
        }

        set({
          currentUser: {
            ...existingAdmin,
            role: 'admin',
          },
          selectedRole: 'admin',
          onboardingCompleted: true,
          activeShopId: null,
          shopSubscriptionStatus: 'inactive',
          adminSessionUser: {
            ...existingAdmin,
            role: 'admin',
          },
          isImpersonating: false,
        });

        return true;
      },

      setShopSubscriptionStatus: (status) =>
        set({
          shopSubscriptionStatus: status,
        }),

      activateShopRole: (shopId) =>
        set((state) => {
          const resolvedShopId = shopId ?? state.activeShopId ?? createDraftShopId();

          return {
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                role: 'shop_active',
              }
            : {
                id: 'shop-owner-1',
                role: 'shop_active',
                name: 'Shop Owner',
                birthDate: '1990-01-01',
                email: 'shop@biel.local',
                phone: '+41 79 000 00 00',
                qrCodeValue: authService.buildQrCodeValue('shop-owner-1'),
                pointsBalance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
          onboardingCompleted: true,
          selectedRole: 'shop',
          activeShopId: resolvedShopId,
          shopSubscriptionStatus: 'active',
          isImpersonating: false,
          };
        }),

      setShopExpired: () =>
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                role: 'shop_expired',
              }
            : null,
          shopSubscriptionStatus: 'expired',
        })),

      continueAsGuest: () =>
        set({
          currentUser: null,
          selectedRole: null,
          onboardingCompleted: true,
          activeShopId: null,
        }),

      goToRoleSelection: () =>
        set({
          selectedRole: null,
          onboardingCompleted: false,
          adminSessionUser: null,
          isImpersonating: false,
        }),

      impersonateUser: (userId) => {
        const targetUser = authService.getById(userId);
        if (!targetUser) {
          return false;
        }

        const ownedShop = shopService.getAll().find((shop) => shop.ownerUserId === targetUser.id);
        const targetIsShop = targetUser.role.startsWith('shop_');
        const targetIsAdmin = targetUser.role === 'admin';

        set((state) => ({
          currentUser: targetUser,
          selectedRole: targetIsAdmin ? 'admin' : targetIsShop ? 'shop' : 'user',
          onboardingCompleted: true,
          activeShopId: targetIsShop ? (ownedShop?.id ?? state.activeShopId) : null,
          shopSubscriptionStatus: ownedShop?.subscriptionStatus ?? state.shopSubscriptionStatus,
          adminSessionUser:
            state.adminSessionUser ?? (state.currentUser?.role === 'admin' ? state.currentUser : state.adminSessionUser),
          isImpersonating: !targetIsAdmin,
        }));

        return true;
      },

      impersonateShop: (shopId) => {
        const shop = shopService.getById(shopId);
        if (!shop) {
          return false;
        }

        const owner = authService.getById(shop.ownerUserId);
        const shopRole = shop.subscriptionStatus === 'active' ? 'shop_active' : 'shop_expired';

        const fallbackOwner: UserProfile = {
          id: shop.ownerUserId,
          role: shopRole,
          name: `${shop.name} Owner`,
          birthDate: '1990-01-01',
          email: shop.email,
          phone: shop.phone,
          qrCodeValue: authService.buildQrCodeValue(shop.ownerUserId),
          pointsBalance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
        };

        const impersonatedUser: UserProfile = {
          ...(owner ?? fallbackOwner),
          role: shopRole,
        };

        set((state) => ({
          currentUser: impersonatedUser,
          selectedRole: 'shop',
          onboardingCompleted: true,
          activeShopId: shop.id,
          shopSubscriptionStatus: shop.subscriptionStatus,
          adminSessionUser:
            state.adminSessionUser ?? (state.currentUser?.role === 'admin' ? state.currentUser : state.adminSessionUser),
          isImpersonating: true,
        }));

        return true;
      },

      returnToAdmin: () => {
        let restored = false;

        set((state) => {
          if (!state.adminSessionUser) {
            return state;
          }

          restored = true;
          return {
            currentUser: state.adminSessionUser,
            selectedRole: 'admin',
            onboardingCompleted: true,
            activeShopId: null,
            shopSubscriptionStatus: 'inactive',
            isImpersonating: false,
          };
        });

        return restored;
      },

      logout: () =>
        set({
          currentUser: null,
          selectedRole: null,
          onboardingCompleted: false,
          shopSubscriptionStatus: 'inactive',
          activeShopId: null,
          adminSessionUser: null,
          isImpersonating: false,
        }),
    }),
    {
      name: 'biel-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedRole: state.selectedRole,
        onboardingCompleted: state.onboardingCompleted,
        shopSubscriptionStatus: state.shopSubscriptionStatus,
        activeShopId: state.activeShopId,
        adminSessionUser: state.adminSessionUser,
        isImpersonating: state.isImpersonating,
      }),
    },
  ),
);
