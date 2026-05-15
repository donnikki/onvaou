import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { BielBrand } from '@/src/components/ui/BielBrand';
import { Screen } from '@/src/components/ui/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <BielBrand />
        <StepHeader
          title="Dein Biel. Deine Vorteile."
          subtitle="Entdecke lokale Angebote, unterstuetze Geschaefte in Biel und sammle Vorteile."
        />
      </View>

      <View style={styles.flagBlock} />

      <Text style={styles.text}>
        Eine App fuer Biel/Bienne mit Shops, Deals, Karte und Vorteilen fuer Nutzer, Geschaefte und Admin.
      </Text>

      <AppButton label="Starten" onPress={() => router.push('/onboarding/role-select')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xxxl,
    gap: spacing.xl,
  },
  flagBlock: {
    height: 150,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.relaxed,
  },
});
