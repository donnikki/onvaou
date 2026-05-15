import { StyleSheet, Text, View } from 'react-native';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function WalletScreen() {
  const points = 390;
  const progress = Math.min(1, points / 500);

  return (
    <Screen>
      <Text style={styles.heading}>Wallet</Text>

      <AppCard style={styles.card}>
        <Text style={styles.label}>Deine Treuepunkte</Text>
        <Text style={styles.points}>{points} Punkte</Text>
        <Text style={styles.sub}>Naechste Belohnung bei 500 Punkten</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Quittungen</Text>
        <Text style={styles.sub}>Quittung scannen und automatische Punktevergabe wird bald verfuegbar.</Text>
        <AppButton label="Quittung scannen" disabled onPress={() => undefined} />
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Verlosungen</Text>
          <AppBadge text="Bald verfuegbar" tone="muted" />
        </View>
        <Text style={styles.label}>Monatsverlosung Biel</Text>
        <Text style={styles.sub}>Teilnahmen: 0</Text>
      </AppCard>
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
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.lg,
  },
  points: {
    color: colors.primaryRed,
    fontFamily: typography.family.bold,
    fontSize: 34,
  },
  sub: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  progressTrack: {
    marginTop: spacing.sm,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: colors.primaryRed,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
