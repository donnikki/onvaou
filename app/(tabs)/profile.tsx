import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH } from '@/src/utils/date';
import {
  goToRoleSelection as navigateToRoleSelection,
  goToWelcome,
  returnToAdminDashboard,
} from '@/src/utils/navigation';

export default function ProfileScreen() {
  const { currentUser, logout, shopSubscriptionStatus, goToRoleSelection, isImpersonating, returnToAdmin } =
    useAuthStore();
  const favoriteShopIds = useAppStore((state) => state.favoriteShopIds);

  if (!currentUser) {
    return (
      <Screen>
        <Text style={styles.heading}>Profil</Text>
        <AppCard style={styles.card}>
          <Text style={styles.value}>Du nutzt die App aktuell als Gast.</Text>
          <AppButton label="Onboarding starten" onPress={() => goToWelcome()} />
        </AppCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.heading}>Profil</Text>

      {isImpersonating ? (
        <AppCard style={styles.card}>
          <Text style={styles.testModeTitle}>Testmodus aktiv</Text>
          <Text style={styles.hint}>Du simulierst aktuell ein anderes Profil.</Text>
          <AppButton
            label="Zurueck als Admin"
            variant="secondary"
            onPress={() => {
              const restored = returnToAdmin();
              if (restored) {
                returnToAdminDashboard();
              }
            }}
          />
        </AppCard>
      ) : null}

      <AppCard style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{currentUser.name}</Text>
        <Text style={styles.label}>E-Mail</Text>
        <Text style={styles.value}>{currentUser.email}</Text>
        <Text style={styles.label}>Telefon</Text>
        <Text style={styles.value}>{currentUser.phone}</Text>
        <Text style={styles.label}>Geburtsdatum</Text>
        <Text style={styles.value}>{formatDateCH(currentUser.birthDate)}</Text>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Punkte</Text>
          <AppBadge text={`${currentUser.pointsBalance} Punkte`} />
        </View>
        <Text style={styles.value}>Favoriten: {favoriteShopIds.length}</Text>
        <Text style={styles.hint}>Quittungen scannen und Punkte sammeln wird bald verfuegbar.</Text>
      </AppCard>

      {currentUser.role === 'shop_active' || currentUser.role === 'shop_expired' ? (
        <AppCard style={styles.card}>
          <Text style={styles.label}>Shop-Abo Status</Text>
          <Text style={styles.value}>{shopSubscriptionStatus}</Text>
          <AppButton label="Zum Shop-Dashboard" onPress={() => router.push('/shop/dashboard')} />
          <AppButton label="Shop-Profil bearbeiten" variant="secondary" onPress={() => router.push('/shop/edit-profile')} />
        </AppCard>
      ) : null}

      {currentUser.role === 'admin' ? (
        <AppCard style={styles.card}>
          <AppButton label="Zum Admin-Dashboard" onPress={() => router.push('/admin/dashboard')} />
        </AppCard>
      ) : null}

      <AppButton
        label="Zur Profil-Wahl"
        variant="secondary"
        onPress={() => {
          goToRoleSelection();
          navigateToRoleSelection();
        }}
      />

      <AppButton
        label="Logout"
        variant="ghost"
        onPress={() => {
          logout();
          goToWelcome();
        }}
      />
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
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  value: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  testModeTitle: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
});
