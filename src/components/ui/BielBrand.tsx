import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/theme';

type BielBrandProps = {
  titleSize?: number;
  centered?: boolean;
};

export const BielBrand = ({ titleSize = 44, centered = true }: BielBrandProps) => (
  <View style={[styles.wrap, centered && styles.centered]}>
    <View style={styles.shield}>
      <MaterialCommunityIcons name="content-cut" size={16} color="#FFFFFF" />
      <MaterialCommunityIcons name="content-cut" size={16} color="#FFFFFF" style={styles.crossIcon} />
    </View>
    <Text style={[styles.title, { fontSize: titleSize }]}>Biel</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  centered: {
    alignSelf: 'center',
  },
  shield: {
    width: 36,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryRed,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossIcon: {
    position: 'absolute',
    transform: [{ rotate: '90deg' }],
  },
  title: {
    color: colors.primaryRed,
    fontFamily: typography.family.bold,
    letterSpacing: 0.5,
  },
});
