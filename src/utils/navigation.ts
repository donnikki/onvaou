import { router } from 'expo-router';

export const finishUserOnboarding = () => {
  router.push('/(tabs)/discover');
};

export const finishShopSetup = () => {
  router.push('/shop/dashboard');
};

export const finishAdminLogin = () => {
  router.push('/admin/dashboard');
};

export const goToAdminLogin = () => {
  router.push('/onboarding/admin-login');
};

export const goToRoleSelection = () => {
  router.push('/onboarding/role-select');
};

export const goToWelcome = () => {
  router.push('/onboarding/welcome');
};

export const startImpersonatedUserSession = () => {
  router.push('/(tabs)/discover');
};

export const startImpersonatedShopSession = () => {
  router.push('/shop/dashboard');
};

export const returnToAdminDashboard = () => {
  router.push('/admin/dashboard');
};
