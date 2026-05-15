import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { finishAdminLogin } from '@/src/utils/navigation';

export default function AdminLoginScreen() {
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin);
  const [email, setEmail] = useState('admin@biel.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  return (
    <Screen>
      <StepHeader title="Admin Login" subtitle="Admin-Bereich ist geschuetzt." step="Schritt 2" />

      <AppCard style={styles.card}>
        <AppInput
          label="Admin E-Mail"
          required
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput label="Passwort" required value={password} onChangeText={setPassword} autoCapitalize="none" />
        <Text style={styles.hint}>Mock Login: admin@biel.local / admin123</Text>
        <AppButton
          label="Einloggen"
          onPress={() => {
            const ok = loginAsAdmin(email, password);
            if (!ok) {
              setError('Admin Login fehlgeschlagen. Bitte Daten pruefen.');
              return;
            }

            finishAdminLogin();
          }}
        />
      </AppCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
});
