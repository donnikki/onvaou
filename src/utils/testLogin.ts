import { PendingTestLogin } from '@/src/store/appStore';
import { useAuthStore } from '@/src/store/authStore';
import { applySimulatedMarketScenario } from '@/src/utils/testScenario';

export const getRouteForTestLogin = (login: PendingTestLogin) => {
  if (login.type === 'simulated-market') {
    return '/(tabs)/discover';
  }

  if (login.type === 'shop') {
    return '/portal-access?role=shop';
  }

  if (login.type === 'admin') {
    return '/portal-access?role=admin';
  }

  return '/(tabs)/discover';
};

export const applyTestLogin = (login: PendingTestLogin) => {
  const authState = useAuthStore.getState();

  if (login.type === 'simulated-market') {
    return Boolean(applySimulatedMarketScenario());
  }

  if (login.type === 'user') {
    return authState.loginAsExistingUser(login.userId);
  }

  if (login.type === 'shop') {
    return true;
  }

  return true;
};
