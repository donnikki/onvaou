import { router } from 'expo-router';

import { useAuthStore } from '@/src/store/authStore';

export const finishUserOnboarding = () => {
  router.push('/(tabs)/discover');
};

export const finishShopSetup = () => {
  router.push('/portal-access?role=shop');
};

export const finishAdminLogin = () => {
  router.push('/portal-access?role=admin');
};

export const goToAdminLogin = () => {
  router.push('/portal-access?role=admin');
};

export const goToRoleSelection = () => {
  router.push('/onboarding/role-select');
};

export const resetToRoleSelection = () => {
  useAuthStore.getState().goToRoleSelection();
  router.replace('/onboarding/role-select');
};

export const goToWelcome = () => {
  router.push('/onboarding/role-select');
};

export const startImpersonatedUserSession = () => {
  router.push('/(tabs)/discover');
};

export const startImpersonatedShopSession = () => {
  router.push('/portal-access?role=shop');
};

export const returnToAdminDashboard = () => {
  router.push('/portal-access?role=admin');
};
