import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { finishAdminLogin } from '@/src/utils/navigation';

const demoEmail = 'admin@biel.local';
const demoPassword = 'admin123';

export default function AdminLoginScreen() {
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin);
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState(demoPassword);
  const [error, setError] = useState('');

  const handleLogin = (nextEmail: string, nextPassword: string) => {
    setError('');

    const ok = loginAsAdmin(nextEmail, nextPassword);
    if (!ok) {
      setError('Admin Login fehlgeschlagen. Bitte Daten pruefen.');
      return;
    }

    finishAdminLogin();
  };

  return (
    <Screen>
      <StepHeader
        title="Admin Bereich"
        subtitle="Schneller Zugang fuer Freigaben, Shops und Aktionen in Biel."
        step="Schritt 2"
      />

      <AppCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primaryRed} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Admin Biel</Text>
            <Text style={styles.heroText}>Der Demo-Zugang ist bereits vorbereitet und kann direkt verwendet werden.</Text>
          </View>
        </View>

        <View style={styles.credentialRow}>
          <View style={styles.credentialPill}>
            <Ionicons name="mail-outline" size={15} color={colors.primaryRed} />
            <Text style={styles.credentialText}>{demoEmail}</Text>
          </View>
          <View style={styles.credentialPill}>
            <Ionicons name="key-outline" size={15} color={colors.primaryRed} />
            <Text style={styles.credentialText}>{demoPassword}</Text>
          </View>
        </View>

        <AppButton label="Mit Admin Demo einloggen" onPress={() => handleLogin(demoEmail, demoPassword)} />
      </AppCard>

      <AppCard style={styles.formCard}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Manuell einloggen</Text>
          <Pressable
            style={styles.fillButton}
            onPress={() => {
              setEmail(demoEmail);
              setPassword(demoPassword);
              setError('');
            }}>
            <Text style={styles.fillButtonText}>Demo-Daten einsetzen</Text>
          </Pressable>
        </View>

        <AppInput
          label="Admin E-Mail"
          required
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput label="Passwort" required value={password} onChangeText={setPassword} autoCapitalize="none" />
        <Text style={styles.hint}>Fuer Tests kannst du jederzeit den vorbereiteten Demo-Zugang oben verwenden.</Text>
        <AppButton label="Mit Eingabe einloggen" variant="secondary" onPress={() => handleLogin(email, password)} />
      </AppCard>

      {error ? (
        <AppCard style={styles.errorCard}>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.error}>{error}</Text>
          </View>
        </AppCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing.lg,
    backgroundColor: '#FFF5F5',
    borderColor: '#FBCACA',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  heroTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xl,
  },
  heroText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  credentialRow: {
    gap: spacing.sm,
  },
  credentialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCACA',
  },
  credentialText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  formCard: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  fillButton: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.chipBackground,
  },
  fillButtonText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  error: {
    flex: 1,
    color: colors.danger,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
});
