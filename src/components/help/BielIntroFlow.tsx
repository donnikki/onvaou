import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { BielBrand } from '@/src/components/ui/BielBrand';
import { Screen } from '@/src/components/ui/Screen';
import { colors, spacing, typography } from '@/src/theme';

const introSlides = [
  {
    title: 'Willkommen bei Biel',
    text: 'Dein Biel. Deine Vorteile. Entdecke lokale Shops, Restaurants, Bars, Coiffeure und Events in Biel.',
    icon: 'sparkles-outline' as const,
  },
  {
    title: 'Entdecke Biel auf der Karte',
    text: 'Tippe auf ein Symbol, um ein Shop-Profil zu öffnen. Zoome und verschiebe die Karte, um Angebote in Biel zu entdecken.',
    icon: 'map-outline' as const,
  },
  {
    title: 'Deals & Aktionen',
    text: 'Finde lokale Vorteile wie Rabatte, Gratis-Angebote oder exklusive Aktionen von Bieler Shops.',
    icon: 'pricetags-outline' as const,
  },
  {
    title: 'Nutzer oder Shop',
    text: 'Nutzer verwenden Biel kostenlos. Shops können mit einem Abo ein Profil erstellen und auf der Karte erscheinen.',
    icon: 'people-outline' as const,
  },
  {
    title: 'Punkte & Vorteile',
    text: 'Später kannst du mit Quittungen Punkte sammeln und an Verlosungen teilnehmen. Diese Funktion ist bereits vorbereitet.',
    icon: 'wallet-outline' as const,
  },
];

type BielIntroFlowProps = {
  finishLabel: string;
  onFinish: () => void;
  onSkip?: () => void;
};

export const BielIntroFlow = ({ finishLabel, onFinish, onSkip }: BielIntroFlowProps) => {
  const [index, setIndex] = useState(0);
  const slide = introSlides[index];
  const isLast = index === introSlides.length - 1;

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.topBlock}>
          <BielBrand titleSize={38} centered={false} />
          <StepHeader step={`Schritt ${index + 1} / ${introSlides.length}`} title={slide.title} subtitle={slide.text} />
        </View>

        <AppCard style={styles.heroCard}>
          <View style={styles.iconStage}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={44} color={colors.primaryRed} />
            </View>
          </View>

          <View style={styles.progressRow}>
            {introSlides.map((entry, dotIndex) => (
              <View key={entry.title} style={[styles.dot, dotIndex === index && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.heroTitle}>{slide.title}</Text>
          <Text style={styles.heroText}>{slide.text}</Text>
        </AppCard>

        <View style={styles.buttonGrid}>
          <View style={styles.topActions}>
            <AppButton
              label="Zurueck"
              variant="secondary"
              disabled={index === 0}
              onPress={() => setIndex((value) => Math.max(0, value - 1))}
            />
            {onSkip ? <AppButton label="Ueberspringen" variant="ghost" onPress={onSkip} /> : null}
          </View>

          <AppButton
            label={isLast ? finishLabel : 'Weiter'}
            onPress={() => {
              if (isLast) {
                onFinish();
                return;
              }

              setIndex((value) => Math.min(introSlides.length - 1, value + 1));
            }}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  topBlock: {
    gap: spacing.lg,
  },
  heroCard: {
    gap: spacing.lg,
    borderRadius: 26,
    padding: spacing.xl,
  },
  iconStage: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FECACA',
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primaryRed,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
    textAlign: 'center',
  },
  heroText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: 'center',
  },
  buttonGrid: {
    gap: spacing.md,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
