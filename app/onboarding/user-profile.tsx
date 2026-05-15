import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { formatDateCH, isValidDateString } from '@/src/utils/date';
import { finishUserOnboarding } from '@/src/utils/navigation';
import { isRequired, isValidEmail, isValidPhone } from '@/src/utils/validators';

const steps = ['name', 'birthDate', 'email', 'phone'] as const;
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export default function UserProfileOnboardingScreen() {
  const createUserProfile = useAuthStore((state) => state.createUserProfile);

  const [birthDateValue, setBirthDateValue] = useState(new Date(1995, 0, 1));
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    name: '',
    birthDate: toIsoDate(new Date(1995, 0, 1)),
    email: '',
    phone: '',
  });

  const errors = useMemo(() => {
    const next: Partial<Record<(typeof steps)[number], string>> = {};

    if (!isRequired(form.name)) {
      next.name = 'Bitte gib deinen Namen ein.';
    }

    if (!isValidDateString(form.birthDate)) {
      next.birthDate = 'Bitte nutze ein gueltiges Datum (YYYY-MM-DD).';
    }

    if (form.email.trim().length > 0 && !isValidEmail(form.email)) {
      next.email = 'Bitte gib eine gueltige E-Mail ein.';
    }

    if (form.phone.trim().length > 0 && !isValidPhone(form.phone)) {
      next.phone = 'Bitte gib eine gueltige Telefonnummer ein.';
    }

    return next;
  }, [form]);

  const currentStep = steps[stepIndex];
  const currentError = errors[currentStep];
  const maxBirthDate = new Date();

  const handleBirthDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidDatePicker(false);
    }

    if (!selectedDate || event.type === 'dismissed') {
      return;
    }

    setBirthDateValue(selectedDate);
    setForm((old) => ({ ...old, birthDate: toIsoDate(selectedDate) }));
  };

  const onContinue = () => {
    if (currentError) {
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((value) => value + 1);
      return;
    }

    createUserProfile(form);
    finishUserOnboarding();
  };

  const stepLabel = `${stepIndex + 1} / ${steps.length}`;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.wrapper}>
          <StepHeader
            title="Profil erstellen"
            subtitle="User-Account ist kostenlos. Wir fuehren dich Schritt fuer Schritt durch."
            step={`Schritt ${stepLabel}`}
          />

          <AppCard style={styles.formCard}>
            {currentStep === 'name' ? (
              <AppInput
                label="Name"
                required
                value={form.name}
                onChangeText={(value) => setForm((old) => ({ ...old, name: value }))}
                placeholder="Vorname Nachname"
                error={errors.name}
              />
            ) : null}

            {currentStep === 'birthDate' ? (
              <View style={styles.group}>
                <Text style={styles.label}>Geburtsdatum *</Text>
                <Text style={styles.datePreview}>{formatDateCH(form.birthDate)}</Text>

                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={birthDateValue}
                    mode="date"
                    display="spinner"
                    locale="de-CH"
                    maximumDate={maxBirthDate}
                    onChange={handleBirthDateChange}
                  />
                ) : (
                  <>
                    <AppButton
                      label="Datum auswaehlen"
                      variant="secondary"
                      onPress={() => setShowAndroidDatePicker(true)}
                    />
                    {showAndroidDatePicker ? (
                      <DateTimePicker
                        value={birthDateValue}
                        mode="date"
                        display="default"
                        maximumDate={maxBirthDate}
                        onChange={handleBirthDateChange}
                      />
                    ) : null}
                  </>
                )}

                {errors.birthDate ? <Text style={styles.error}>{errors.birthDate}</Text> : null}
              </View>
            ) : null}

            {currentStep === 'email' ? (
              <View style={styles.group}>
                <AppInput
                  label="E-Mail"
                  value={form.email}
                  onChangeText={(value) => setForm((old) => ({ ...old, email: value }))}
                  placeholder="du@beispiel.ch"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
                <Text style={styles.hint}>Optional. Du kannst diesen Schritt vorerst ueberspringen.</Text>
              </View>
            ) : null}

            {currentStep === 'phone' ? (
              <View style={styles.group}>
                <AppInput
                  label="Telefonnummer"
                  value={form.phone}
                  onChangeText={(value) => setForm((old) => ({ ...old, phone: value }))}
                  placeholder="+41 79 123 45 67"
                  keyboardType="phone-pad"
                  error={errors.phone}
                />
                <Text style={styles.hint}>Optional. Du kannst diesen Schritt vorerst ueberspringen.</Text>
              </View>
            ) : null}
          </AppCard>

          <View style={styles.row}>
            <AppButton
              label="Zurueck"
              variant="secondary"
              onPress={() => setStepIndex((value) => Math.max(0, value - 1))}
              disabled={stepIndex === 0}
            />
            <AppButton label={stepIndex === steps.length - 1 ? 'Abschliessen' : 'Weiter'} onPress={onContinue} />
          </View>

          <Text style={styles.hint}>Pflichtfelder sind mit * markiert.</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  formCard: {
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  datePreview: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
});
