import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppButton } from '@/src/components/ui/AppButton';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';

export default function RoleSelectScreen() {
  const { selectRole, startShopOnboarding } = useAuthStore();

  return (
    <Screen>
      <StepHeader title="Wie moechtest du Biel nutzen?" subtitle="Eine App mit drei Bereichen." step="Schritt 1" />

      <AppCard style={styles.card}>
        <Text style={styles.title}>Ich bin Nutzer</Text>
        <Text style={styles.text}>Kostenlos Angebote entdecken, Shops finden und spaeter Punkte sammeln.</Text>
        <AppButton
          label="Als Nutzer starten"
          onPress={() => {
            selectRole('user');
            router.push('/onboarding/user-profile');
          }}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>Ich bin Shop</Text>
          <AppBadge text="Abo erforderlich" />
        </View>
        <Text style={styles.text}>Shop-Profil erstellen, auf der Karte erscheinen und Aktionen verwalten.</Text>
        <AppButton
          label="Als Shop starten"
          onPress={() => {
            startShopOnboarding();
            router.push('/onboarding/shop-subscription');
          }}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.text}>Verwaltung fuer App-Betreiber. Zugriff nur mit Admin-Login.</Text>
        <AppButton
          label="Admin Login"
          variant="secondary"
          onPress={() => {
            selectRole('admin');
            router.push('/onboarding/admin-login');
          }}
        />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
});
