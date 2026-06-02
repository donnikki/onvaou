import { router } from 'expo-router';

import { BielIntroFlow } from '@/src/components/help/BielIntroFlow';
import { useAppStore } from '@/src/store/appStore';
import { applyTestLogin, getRouteForTestLogin } from '@/src/utils/testLogin';

export default function WelcomeScreen() {
  const markAppIntroSeen = useAppStore((state) => state.markAppIntroSeen);
  const pendingTestLogin = useAppStore((state) => state.pendingTestLogin);
  const setPendingTestLogin = useAppStore((state) => state.setPendingTestLogin);

  const finish = () => {
    markAppIntroSeen();

    if (pendingTestLogin && applyTestLogin(pendingTestLogin)) {
      const nextRoute = getRouteForTestLogin(pendingTestLogin);
      setPendingTestLogin(null);
      router.replace(nextRoute);
      return;
    }

    setPendingTestLogin(null);
    router.replace('/onboarding/role-select');
  };

  return <BielIntroFlow finishLabel="Profil erstellen" onFinish={finish} onSkip={finish} />;
}
