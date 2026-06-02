import { router, useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { getPortalTitle, getPortalUrl, isPortalConfigured, PortalRole } from '@/src/config/portal';
import { colors, spacing, typography } from '@/src/theme';

const resolveRole = (value: string | string[] | undefined): PortalRole =>
  value === 'admin' ? 'admin' : 'shop';

export default function PortalAccessScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = resolveRole(params.role);
  const title = getPortalTitle(role);
  const targetUrl = getPortalUrl(role);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Webportal</Text>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subtitle}>Shop und Admin werden nicht mehr in der Mobile-App verwaltet.</Text>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Zugriff ueber die Website</Text>
        <Text style={styles.cardText}>
          {isPortalConfigured
            ? 'Oeffne das Webportal im Browser, um Profile, Aktionen, Bilder und QR-Einloesungen zu verwalten.'
            : 'Das Webportal ist im Projekt unter web/portal vorbereitet. Hinterlege danach deine echte URL in src/config/portal.ts.'}
        </Text>
        <AppButton
          label={isPortalConfigured ? 'Webportal oeffnen' : 'URL noch nicht gesetzt'}
          disabled={!isPortalConfigured}
          onPress={() => {
            void Linking.openURL(targetUrl);
          }}
        />
        <AppButton label="Zur Nutzer-App" variant="secondary" onPress={() => router.replace('/onboarding/role-select')} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  eyebrow: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
});
