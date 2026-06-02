import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { UserCompletedActionsCard } from '@/src/components/user/UserCompletedActionsCard';
import { useAuthStore } from '@/src/store/authStore';
import { useAppStore } from '@/src/store/appStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH } from '@/src/utils/date';
import { resetToRoleSelection } from '@/src/utils/navigation';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuthStore();
  const favoriteShopIds = useAppStore((state) => state.favoriteShopIds);
  const [, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Ensure service-backed "history" lists re-render when returning to this tab.
      setRefreshKey((value) => value + 1);
    }, []),
  );

  if (!currentUser) {
    return (
      <Screen>
        <Text style={styles.heading}>Profil</Text>
        <AppCard style={styles.card}>
          <Text style={styles.value}>Du nutzt die App aktuell als Gast.</Text>
          <AppButton label="Login oder Sign up" onPress={resetToRoleSelection} />
          <AppButton label="Hilfe & Erklaerung" variant="secondary" onPress={() => router.push('/help')} />
        </AppCard>
      </Screen>
    );
  }

  if (currentUser.role !== 'user') {
    const portalRole = currentUser.role === 'admin' ? 'admin' : 'shop';

    return (
      <Screen>
        <Text style={styles.heading}>Profil</Text>

        <AppCard style={styles.card}>
          <Text style={styles.testModeTitle}>Nur noch fuer Nutzer</Text>
          <Text style={styles.hint}>Shop- und Admin-Profile werden jetzt ausschliesslich im Webportal verwaltet.</Text>
          <AppButton
            label={portalRole === 'admin' ? 'Admin Webportal' : 'Shop Webportal'}
            onPress={() => router.push(`/portal-access?role=${portalRole}`)}
          />
          <AppButton label="Zur Nutzer-Auswahl" variant="secondary" onPress={resetToRoleSelection} />
          <AppButton
            label="Logout"
            variant="ghost"
            onPress={() => {
              logout();
              resetToRoleSelection();
            }}
          />
        </AppCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.heading}>Profil</Text>

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

      {currentUser.role === 'user' ? (
        <UserCompletedActionsCard userId={currentUser.id} />
      ) : null}

      <AppCard style={styles.card}>
        <AppButton label="Hilfe & Erklaerung" variant="secondary" onPress={() => router.push('/help')} />
      </AppCard>

      <AppButton
        label="Logout"
        variant="ghost"
        onPress={() => {
          logout();
          resetToRoleSelection();
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
