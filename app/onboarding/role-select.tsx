import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { spacing } from '@/src/theme';

export default function RoleSelectScreen() {
  return (
    <Screen>
      <AppCard style={styles.card}>
        <AppButton label="Zum Login" onPress={() => router.push('/onboarding/login')} />
      </AppCard>

      <AppCard style={styles.card}>
        <AppButton label="Profil erstellen" variant="secondary" onPress={() => router.push('/onboarding/user-profile')} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
