import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/src/components/ui/CategoryIcon';
import { colors, spacing, typography } from '@/src/theme';
import { MapIcon, ShopCategory } from '@/src/types';
import { shopCategoryOptions } from '@/src/utils/shopCategories';

type ShopCategoryPickerProps =
  | {
      mode: 'category';
      value: ShopCategory | null;
      onChange: (value: ShopCategory | null) => void;
      showAllOption?: boolean;
      layout?: 'grid' | 'row';
    }
  | {
      mode: 'icon';
      value: MapIcon;
      onChange: (value: MapIcon) => void;
      layout?: 'grid' | 'row';
    };

export const ShopCategoryPicker = (props: ShopCategoryPickerProps) => {
  const layout = props.layout ?? 'grid';
  const compact = layout === 'row';

  const renderOption = (label: string, icon: MapIcon, active: boolean, onPress: () => void, key: string) => (
    <Pressable
      key={key}
      style={[styles.option, compact ? styles.optionCompact : styles.optionGrid, active && styles.optionActive]}
      onPress={onPress}>
      <View style={[styles.iconWrap, compact ? styles.iconWrapCompact : styles.iconWrapRegular, active && styles.iconWrapActive]}>
        <CategoryIcon icon={icon} size={compact ? 38 : 52} />
      </View>
      <Text numberOfLines={2} style={[styles.label, compact && styles.labelCompact, active && styles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  );

  const content = (
    <>
      {props.mode === 'category' && props.showAllOption
        ? renderOption('Alle', 'markt', props.value === null, () => props.onChange(null), 'all-categories')
        : null}
      {shopCategoryOptions.map((option) => {
        const active = props.mode === 'category' ? props.value === option.category : props.value === option.icon;
        const onPress =
          props.mode === 'category'
            ? () => props.onChange(option.category)
            : () => props.onChange(option.icon);

        return renderOption(option.category, option.icon, active, onPress, `${option.category}-${option.icon}`);
      })}
    </>
  );

  if (layout === 'row') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowWrap}>
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.gridWrap}>{content}</View>;
};

const styles = StyleSheet.create({
  rowWrap: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  optionGrid: {
    width: 104,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  optionCompact: {
    width: 90,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  optionActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  iconWrapRegular: {
    width: 64,
    height: 64,
  },
  iconWrapCompact: {
    width: 50,
    height: 50,
  },
  iconWrapActive: {
    backgroundColor: '#FFF1F1',
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
    lineHeight: 16,
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
  labelActive: {
    color: colors.primaryRedDark,
    fontFamily: typography.family.semibold,
  },
});
