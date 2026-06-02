import { router } from 'expo-router';

import { BielIntroFlow } from '@/src/components/help/BielIntroFlow';
import { useAppStore } from '@/src/store/appStore';

export default function HelpIntroScreen() {
  const markAppIntroSeen = useAppStore((state) => state.markAppIntroSeen);

  return (
    <BielIntroFlow
      finishLabel="Fertig"
      onFinish={() => {
        markAppIntroSeen();
        router.replace('/help');
      }}
      onSkip={() => router.replace('/help')}
    />
  );
}
