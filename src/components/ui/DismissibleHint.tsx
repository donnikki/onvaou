import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { colors, spacing, typography } from '@/src/theme';

type DismissibleHintProps = {
  title: string;
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
  style?: ViewStyle;
};

export const DismissibleHint = ({
  title,
  text,
  icon = 'information-circle-outline',
  onClose,
  style,
}: DismissibleHintProps) => (
  <AppCard style={[styles.card, style]}>
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primaryRed} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Pressable hitSlop={8} onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  </AppCard>
);

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.primaryRedDark,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  closeButton: {
    paddingTop: 2,
  },
});
