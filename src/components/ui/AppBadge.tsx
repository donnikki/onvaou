import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/src/theme';

type AppBadgeProps = {
  text: string;
  tone?: 'red' | 'green' | 'muted';
};

export const AppBadge = ({ text, tone = 'red' }: AppBadgeProps) => {
  return (
    <View style={[styles.base, tone === 'red' && styles.red, tone === 'green' && styles.green, tone === 'muted' && styles.muted]}>
      <Text style={[styles.text, tone === 'red' && styles.redText, tone === 'green' && styles.greenText]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  red: {
    backgroundColor: '#FEE2E2',
  },
  green: {
    backgroundColor: '#DCFCE7',
  },
  muted: {
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xs,
  },
  redText: {
    color: colors.primaryRed,
  },
  greenText: {
    color: colors.success,
  },
});
