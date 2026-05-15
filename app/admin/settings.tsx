import { Switch, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { useAppStore } from '@/src/store/appStore';
import { colors, spacing, typography } from '@/src/theme';

export default function AdminSettingsScreen() {
  const featureFlags = useAppStore((state) => state.featureFlags);
  const setFeatureFlag = useAppStore((state) => state.setFeatureFlag);

  return (
    <Screen>
      <Text style={styles.heading}>Einstellungen</Text>

      <AppCard style={styles.card}>
        <FeatureRow
          label="receiptScanningEnabled"
          value={featureFlags.receiptScanningEnabled}
          onChange={(value) => setFeatureFlag('receiptScanningEnabled', value)}
        />
        <FeatureRow label="lotteryEnabled" value={featureFlags.lotteryEnabled} onChange={(value) => setFeatureFlag('lotteryEnabled', value)} />
        <FeatureRow label="mockMode" value={featureFlags.mockMode} onChange={(value) => setFeatureFlag('mockMode', value)} />
      </AppCard>
    </Screen>
  );
}

const FeatureRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primaryRed, false: '#D1D5DB' }} />
  </View>
);

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
});
