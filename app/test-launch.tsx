import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { BielBrand } from '@/src/components/ui/BielBrand';
import { Screen } from '@/src/components/ui/Screen';
import { authService } from '@/src/services/authService';
import { useAppStore } from '@/src/store/appStore';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { applyTestLogin, getRouteForTestLogin } from '@/src/utils/testLogin';
import { cleanupSimulatedMarketScenario } from '@/src/utils/testScenario';

export default function TestLaunchScreen() {
  const users = authService.getAllUsers().filter((entry) => entry.role === 'user');
  const hasSeenAppIntro = useAppStore((state) => state.hasSeenAppIntro);
  const firstOpen = !hasSeenAppIntro;
  const setAppIntroSeen = useAppStore((state) => state.setAppIntroSeen);
  const setPendingTestLogin = useAppStore((state) => state.setPendingTestLogin);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    cleanupSimulatedMarketScenario();
  }, []);

  const startWithLogin = (login: Parameters<typeof applyTestLogin>[0]) => {
    logout();

    if (firstOpen) {
      setPendingTestLogin(login);
      setAppIntroSeen(false);
      router.replace('/onboarding/welcome');
      return;
    }

    setPendingTestLogin(null);
    setAppIntroSeen(true);
    if (applyTestLogin(login)) {
      router.replace(getRouteForTestLogin(login));
    }
  };

  const startNormalFlow = () => {
    logout();
    setPendingTestLogin(null);

    if (firstOpen) {
      setAppIntroSeen(false);
      router.replace('/onboarding/welcome');
      return;
    }

    setAppIntroSeen(true);
    router.replace('/onboarding/role-select');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <BielBrand titleSize={38} centered={false} />
        <Text style={styles.heading}>Test-Login</Text>
        <Text style={styles.subtitle}>Waehle fuer Tests direkt einen Nutzer oder starte den normalen User-Flow.</Text>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Normal starten</Text>
        <Text style={styles.cardText}>Startet die App im normalen Nutzer-Flow mit Intro und Profilerstellung.</Text>
        <AppButton label="Normaler App-Start" onPress={startNormalFlow} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Temporäre Demo</Text>
        <Text style={styles.cardText}>
          Simuliert 20 verschiedene Shops mit bereits akzeptierten Aktionen und loggt dich als neuen Nutzer ein. Diese Demo bleibt nur fuer die laufende App-Sitzung und wird beim naechsten Start automatisch entfernt.
        </Text>
        <AppButton label="20 Shops simulieren" onPress={() => startWithLogin({ type: 'simulated-market' })} />
      </AppCard>

      <AppCard style={styles.card}>
        <Pressable style={styles.checkboxRow} onPress={() => setAppIntroSeen(firstOpen)}>
          <View style={[styles.checkbox, firstOpen && styles.checkboxActive]}>
            {firstOpen ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
          </View>
          <View style={styles.checkboxTextWrap}>
            <Text style={styles.cardTitle}>Als allerersten App-Start behandeln</Text>
            <Text style={styles.cardText}>Wenn aktiv, startet zuerst die Einfuehrung und danach die gewaehlte Testrolle.</Text>
          </View>
        </Pressable>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Alle User</Text>
        <View style={styles.buttonList}>
          {users.map((user) => (
            <AppButton
              key={user.id}
              label={`${user.name} (${user.email})`}
              variant="secondary"
              onPress={() => startWithLogin({ type: 'user', userId: user.id })}
            />
          ))}
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  card: {
    gap: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  checkboxTextWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  cardText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  buttonList: {
    gap: spacing.sm,
  },
});
