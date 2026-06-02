import { useEffect } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { goToAdminLogin, resetToRoleSelection } from '@/src/utils/navigation';

export default function AdminDashboardScreen() {
  const user = useAuthStore((state) => state.currentUser);
  const isImpersonating = useAuthStore((state) => state.isImpersonating);

  useEffect(() => {
    if ((!user || user.role !== 'admin') && !isImpersonating) {
      goToAdminLogin();
    }
  }, [user, isImpersonating]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Screen>
      <Text style={styles.heading}>Admin Dashboard</Text>

      <AppCard style={styles.card}>
        <AppButton
          label="Zur Profil-Wahl"
          variant="ghost"
          onPress={resetToRoleSelection}
        />
        <AppButton label="User verwalten" onPress={() => router.push('/admin/users')} />
        <AppButton label="Shops verwalten" variant="secondary" onPress={() => router.push('/admin/shops')} />
        <AppButton label="Aktionen verwalten" variant="secondary" onPress={() => router.push('/admin/offers')} />
        <AppButton label="App-Einstellungen" variant="secondary" onPress={() => router.push('/admin/settings')} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  card: {
    gap: spacing.md,
  },
});
