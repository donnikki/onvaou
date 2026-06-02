import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppInput } from '@/src/components/ui/AppInput';
import { colors, spacing, typography } from '@/src/theme';
import { OpeningHours } from '@/src/types';
import { openingDayLabels, openingDayOrder } from '@/src/utils/shopProfile';

type OpeningHoursEditorProps = {
  value: OpeningHours;
  onChange: (value: OpeningHours) => void;
};

export const OpeningHoursEditor = ({ value, onChange }: OpeningHoursEditorProps) => (
  <View style={styles.wrap}>
    {openingDayOrder.map((dayKey) => {
      const day = value[dayKey];

      return (
        <View key={dayKey} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayLabel}>{openingDayLabels[dayKey]}</Text>
            <AppButton
              label={day.isOpen ? 'Geoeffnet' : 'Geschlossen'}
              variant={day.isOpen ? 'secondary' : 'ghost'}
              onPress={() =>
                onChange({
                  ...value,
                  [dayKey]: {
                    ...day,
                    isOpen: !day.isOpen,
                  },
                })
              }
            />
          </View>

          {day.isOpen ? (
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <AppInput
                  label="Von"
                  value={day.openTime}
                  onChangeText={(nextValue) =>
                    onChange({
                      ...value,
                      [dayKey]: {
                        ...day,
                        openTime: nextValue,
                      },
                    })
                  }
                  placeholder="09:00"
                />
              </View>
              <View style={styles.timeField}>
                <AppInput
                  label="Bis"
                  value={day.closeTime}
                  onChangeText={(nextValue) =>
                    onChange({
                      ...value,
                      [dayKey]: {
                        ...day,
                        closeTime: nextValue,
                      },
                    })
                  }
                  placeholder="18:00"
                />
              </View>
            </View>
          ) : (
            <Text style={styles.closedText}>An diesem Tag geschlossen</Text>
          )}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  dayCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayLabel: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  closedText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
});
