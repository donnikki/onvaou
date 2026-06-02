import { Redirect } from 'expo-router';

import { useAuthStore } from '@/src/store/authStore';

export default function IndexScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (currentUser?.role === 'user' && onboardingCompleted) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/onboarding/role-select" />;
}
