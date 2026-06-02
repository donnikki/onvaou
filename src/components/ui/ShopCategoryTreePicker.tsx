import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/src/components/ui/CategoryIcon';
import { colors, spacing, typography } from '@/src/theme';
import { ShopCategory } from '@/src/types';
import {
  ShopTopCategoryId,
  categoryToMapIcon,
  categoryToTopCategory,
  isTopCategoryFullySelected,
  isTopCategoryPartiallySelected,
  shopTopCategories,
  toggleLeafCategorySelection,
  toggleTopCategorySelection,
} from '@/src/utils/shopCategories';

type ShopCategoryTreePickerProps =
  | {
      mode: 'multi';
      value: ShopCategory[];
      onChange: (value: ShopCategory[]) => void;
      initialExpandedIds?: ShopTopCategoryId[];
    }
  | {
      mode: 'single';
      value: ShopCategory;
      onChange: (value: ShopCategory) => void;
      initialExpandedIds?: ShopTopCategoryId[];
    };

export const ShopCategoryTreePicker = (props: ShopCategoryTreePickerProps) => {
  const [expandedIds, setExpandedIds] = useState<ShopTopCategoryId[]>(() => props.initialExpandedIds ?? []);

  useEffect(() => {
    if (props.mode !== 'single') {
      return;
    }

    const selectedTopCategoryId = categoryToTopCategory[props.value];
    setExpandedIds((current) =>
      current.includes(selectedTopCategoryId) ? current : [selectedTopCategoryId, ...current],
    );
  }, [props.mode, props.value]);

  const effectiveSelectedCategories = useMemo(
    () => (props.mode === 'multi' ? props.value : [props.value]),
    [props],
  );

  const activeCategorySet = useMemo(
    () => new Set<ShopCategory>(effectiveSelectedCategories),
    [effectiveSelectedCategories],
  );

  const toggleExpanded = (topCategoryId: ShopTopCategoryId) => {
    setExpandedIds((current) =>
      current.includes(topCategoryId)
        ? current.filter((entry) => entry !== topCategoryId)
        : [...current, topCategoryId],
    );
  };

  return (
    <View style={styles.wrap}>
      {shopTopCategories.map((topCategory) => {
        const expanded = expandedIds.includes(topCategory.id);
        const fullyActive =
          props.mode === 'multi'
            ? isTopCategoryFullySelected(topCategory.id, props.value)
            : topCategory.categories.includes(props.value);
        const partiallyActive =
          props.mode === 'multi' ? isTopCategoryPartiallySelected(topCategory.id, props.value) : false;

        return (
          <View key={topCategory.id} style={styles.group}>
            <View
              style={[
                styles.topRowWrap,
                fullyActive && styles.topRowWrapActive,
                partiallyActive && styles.topRowWrapPartial,
              ]}>
              <Pressable
                style={styles.topRowMain}
                onPress={() => {
                  if (props.mode === 'multi') {
                    props.onChange(toggleTopCategorySelection(props.value, topCategory.id));
                    return;
                  }

                  toggleExpanded(topCategory.id);
                }}>
                <View style={styles.topRowLeading}>
                  <CategoryIcon icon={topCategory.icon} size={34} />
                  <Text style={[styles.topLabel, fullyActive && styles.topLabelActive]}>{topCategory.label}</Text>
                </View>

                {props.mode === 'multi' ? (
                  <View
                    style={[
                      styles.selectionBadge,
                      fullyActive && styles.selectionBadgeActive,
                      partiallyActive && styles.selectionBadgePartial,
                    ]}>
                    <Ionicons
                      name={fullyActive ? 'checkmark' : partiallyActive ? 'remove' : 'add'}
                      size={16}
                      color={fullyActive || partiallyActive ? '#FFFFFF' : colors.primaryRed}
                    />
                  </View>
                ) : null}
              </Pressable>

              <Pressable style={styles.expandButton} onPress={() => toggleExpanded(topCategory.id)}>
                <Ionicons
                  name={expanded ? 'chevron-down' : 'chevron-forward'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            {expanded ? (
              <View style={styles.children}>
                {topCategory.categories.map((category) => {
                  const active = activeCategorySet.has(category);
                  return (
                    <Pressable
                      key={category}
                      style={[styles.childRow, active && styles.childRowActive]}
                      onPress={() => {
                        if (props.mode === 'multi') {
                          props.onChange(toggleLeafCategorySelection(props.value, category));
                          return;
                        }

                        props.onChange(category);
                      }}>
                      <View style={styles.childLeading}>
                        <CategoryIcon icon={categoryToMapIcon[category]} size={28} />
                        <Text style={[styles.childLabel, active && styles.childLabelActive]}>{category}</Text>
                      </View>

                      <View style={[styles.childSwitch, active && styles.childSwitchActive]}>
                        <Ionicons
                          name={active ? 'checkmark' : 'add'}
                          size={14}
                          color={active ? '#FFFFFF' : colors.primaryRed}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  group: {
    gap: spacing.xs,
  },
  topRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  topRowWrapActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  topRowWrapPartial: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF9F9',
  },
  topRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  topRowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  topLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  topLabelActive: {
    color: colors.primaryRedDark,
  },
  expandButton: {
    width: 44,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  selectionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectionBadgeActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  selectionBadgePartial: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  children: {
    marginLeft: spacing.lg,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  childRowActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  childLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  childLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  childLabelActive: {
    color: colors.primaryRedDark,
    fontFamily: typography.family.semibold,
  },
  childSwitch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  childSwitchActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
});
