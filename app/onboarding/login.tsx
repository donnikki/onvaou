import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { spacing } from '@/src/theme';
import { isRequired, isValidEmail } from '@/src/utils/validators';

export default function LoginScreen() {
  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  const emailError = useMemo(() => {
    if (!isRequired(email)) {
      return 'Bitte gib deine E-Mail ein.';
    }

    if (!isValidEmail(email)) {
      return 'Bitte gib eine gueltige E-Mail ein.';
    }

    return '';
  }, [email]);

  const handleLogin = () => {
    if (emailError) {
      setLoginError(emailError);
      return;
    }

    const ok = loginWithEmail(email);
    if (!ok) {
      setLoginError('Auf diesem iPhone wurde noch kein Profil mit dieser E-Mail gespeichert.');
      return;
    }

    setLoginError('');
    router.replace('/(tabs)/discover');
  };

  return (
    <Screen>
      <AppCard style={styles.card}>
        <AppInput
          label="E-Mail"
          required
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (loginError) {
              setLoginError('');
            }
          }}
          placeholder="du@beispiel.ch"
          keyboardType="email-address"
          autoCapitalize="none"
          error={loginError || undefined}
        />
        <AppButton label="Einloggen" onPress={handleLogin} />
      </AppCard>

      <AppCard style={styles.card}>
        <AppButton label="Zum Sign up" variant="secondary" onPress={() => router.push('/onboarding/user-profile')} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
