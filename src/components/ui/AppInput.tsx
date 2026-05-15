import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '@/src/theme';

type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  multiline?: boolean;
};

export const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  multiline = false,
}: AppInputProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>
      {label}
      {required ? ' *' : ''}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
});
