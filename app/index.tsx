import { Redirect } from 'expo-router';

import { useAuthStore } from '@/src/store/authStore';

export default function IndexScreen() {
  const { currentUser, onboardingCompleted } = useAuthStore();

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (currentUser?.role === 'admin') {
    return <Redirect href="/admin/dashboard" />;
  }

  if (currentUser?.role === 'shop_active' || currentUser?.role === 'shop_expired') {
    return <Redirect href="/shop/dashboard" />;
  }

  if (currentUser?.role === 'shop_pending_subscription') {
    return <Redirect href="/onboarding/shop-subscription" />;
  }

  return <Redirect href="/(tabs)/discover" />;
}
