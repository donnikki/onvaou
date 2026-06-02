import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/src/services/authService';
import { shopService } from '@/src/services/shopService';
import { SubscriptionStatus, UserProfile } from '@/src/types';

export const ADMIN_EMAILS = ['admin@biel.local'];
const createDraftShopId = () => `shop-${Date.now()}`;
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const syncLocalUsers = (users: UserProfile[]) => {
  authService.setLocalUsers(users);
};

type AuthStore = {
  currentUser: UserProfile | null;
  savedUsers: UserProfile[];
  selectedRole: 'user' | 'shop' | 'admin' | null;
  onboardingCompleted: boolean;
  shopSubscriptionStatus: SubscriptionStatus;
  activeShopId: string | null;
  adminSessionUser: UserProfile | null;
  isImpersonating: boolean;
  startShopOnboarding: () => void;
  selectRole: (role: 'user' | 'shop' | 'admin') => void;
  loginWithEmail: (email: string) => boolean;
  findSavedUserByEmail: (email: string) => UserProfile | null;
  createUserProfile: (input: Pick<UserProfile, 'name' | 'birthDate' | 'email' | 'phone'>) => UserProfile;
  loginAsAdmin: (email: string, password: string) => boolean;
  setShopSubscriptionStatus: (status: SubscriptionStatus) => void;
  activateShopRole: (shopId?: string) => void;
  setShopExpired: () => void;
  continueAsGuest: () => void;
  goToRoleSelection: () => void;
  loginAsExistingUser: (userId: string) => boolean;
  loginAsExistingShop: (shopId: string) => boolean;
  loginAsExistingAdmin: () => boolean;
  impersonateUser: (userId: string) => boolean;
  impersonateShop: (shopId: string) => boolean;
  returnToAdmin: () => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set): AuthStore => ({
      currentUser: null,
      savedUsers: [],
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

      loginWithEmail: (email: string) => {
        const normalizedEmail = normalizeEmail(email);
        const user = useAuthStore.getState().savedUsers.find((entry) => normalizeEmail(entry.email) === normalizedEmail) ?? null;

        if (!user) {
          return false;
        }

        set({
          currentUser: user,
          selectedRole: 'user',
          onboardingCompleted: true,
          activeShopId: null,
          shopSubscriptionStatus: 'inactive',
          adminSessionUser: null,
          isImpersonating: false,
        });

        return true;
      },

      findSavedUserByEmail: (email: string) => {
        const normalizedEmail = normalizeEmail(email);
        return useAuthStore.getState().savedUsers.find((entry) => normalizeEmail(entry.email) === normalizedEmail) ?? null;
      },

      createUserProfile: (input: Pick<UserProfile, 'name' | 'birthDate' | 'email' | 'phone'>) => {
        const normalizedInput = {
          ...input,
          email: normalizeEmail(input.email),
          phone: input.phone.trim(),
          name: input.name.trim(),
        };
        const user = authService.createUserProfile(normalizedInput);
        set({
          currentUser: user,
          savedUsers: [user, ...useAuthStore.getState().savedUsers.filter((entry) => entry.id !== user.id)],
          selectedRole: 'user',
          onboardingCompleted: true,
        });
        syncLocalUsers([user, ...useAuthStore.getState().savedUsers.filter((entry) => entry.id !== user.id)]);

        return user;
      },

      loginAsAdmin: (email: string, password: string) => {
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

      setShopSubscriptionStatus: (status: SubscriptionStatus) =>
        set({
          shopSubscriptionStatus: status,
        }),

      activateShopRole: (shopId?: string) =>
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
          currentUser: null,
          selectedRole: null,
          onboardingCompleted: false,
          activeShopId: null,
          shopSubscriptionStatus: 'inactive',
          adminSessionUser: null,
          isImpersonating: false,
        }),

      loginAsExistingUser: (userId: string) => {
        const user = authService.getById(userId);
        if (!user || user.role !== 'user') {
          return false;
        }

        set({
          currentUser: user,
          selectedRole: 'user',
          onboardingCompleted: true,
          activeShopId: null,
          shopSubscriptionStatus: 'inactive',
          adminSessionUser: null,
          isImpersonating: false,
        });

        return true;
      },

      loginAsExistingShop: (shopId: string) => {
        const shop = shopService.getById(shopId);
        if (!shop) {
          return false;
        }

        const owner = authService.getById(shop.ownerUserId);
        const shopRole = shop.subscriptionStatus === 'active' ? 'shop_active' : 'shop_expired';

        const shopUser: UserProfile = owner
          ? {
              ...owner,
              role: shopRole,
            }
          : {
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

        set({
          currentUser: shopUser,
          selectedRole: 'shop',
          onboardingCompleted: true,
          activeShopId: shop.id,
          shopSubscriptionStatus: shop.subscriptionStatus,
          adminSessionUser: null,
          isImpersonating: false,
        });

        return true;
      },

      loginAsExistingAdmin: () => {
        const admin =
          authService.getAllUsers().find((entry) => entry.role === 'admin') ??
          authService.getByEmail(ADMIN_EMAILS[0]);

        if (!admin) {
          return false;
        }

        set({
          currentUser: {
            ...admin,
            role: 'admin',
          },
          selectedRole: 'admin',
          onboardingCompleted: true,
          activeShopId: null,
          shopSubscriptionStatus: 'inactive',
          adminSessionUser: {
            ...admin,
            role: 'admin',
          },
          isImpersonating: false,
        });

        return true;
      },

      impersonateUser: (userId: string) => {
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

      impersonateShop: (shopId: string) => {
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
      onRehydrateStorage: () => (state) => {
        syncLocalUsers(state?.savedUsers ?? []);
      },
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<AuthStore>;
        const savedUsers = state.savedUsers ?? [];
        syncLocalUsers(savedUsers);

        return {
          ...state,
          savedUsers,
        };
      },
      partialize: (state) => ({
        currentUser: state.currentUser,
        savedUsers: state.savedUsers,
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
