import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { Screen } from '@/src/components/ui/Screen';
import { colors, spacing, typography } from '@/src/theme';
import { AppRole } from '@/src/types';

type RoleGateProps = {
  role: AppRole;
  allow: AppRole[];
  fallbackTitle?: string;
};

export const RoleGate = ({ role, allow, fallbackTitle = 'Kein Zugriff fuer diese Rolle.' }: RoleGateProps) => {
  if (allow.includes(role)) {
    return null;
  }

  if (role === 'guest') {
    return <Redirect href="/onboarding/welcome" />;
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>{fallbackTitle}</Text>
        <Text style={styles.text}>Bitte melde dich mit einer berechtigten Rolle an.</Text>
        <AppButton label="Zurueck zum Profil" onPress={() => router.push('/(tabs)/profile')} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
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
  },
});
