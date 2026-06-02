import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { colors, spacing, typography } from '@/src/theme';

const userHelpItems = [
  'Karte oeffnen und Symbole antippen',
  'Shop-Profil mit Infos und Bildern ansehen',
  'Deals und Aktionen entdecken',
  'Favoriten speichern',
  'Wallet und Punkte als vorbereitete Funktion nutzen',
];

const portalHelpItems = [
  'Shop-Profil auf der Website pflegen',
  'Aktionen im Webportal erstellen und abschliessen',
  'Bilder, Oeffnungszeiten und Inhalte online anpassen',
  'Admin-Freigaben und QR-Einloesungen im Browser bearbeiten',
];

const faqs = [
  {
    question: 'Ist Biel fuer Nutzer kostenlos?',
    answer: 'Ja. Nutzer entdecken Shops, Deals und spaeter auch Punkte kostenlos.',
  },
  {
    question: 'Wo finde ich Shop und Admin?',
    answer: 'Shop und Admin sind nicht mehr Teil der Mobile-App und laufen jetzt ueber das Webportal.',
  },
  {
    question: 'Warum sehe ich in der App kein Shop-Dashboard mehr?',
    answer: 'Die Mobile-App ist jetzt bewusst auf den Nutzer-Fall reduziert, damit Shops und Admin separat im Browser arbeiten.',
  },
  {
    question: 'Wie funktionieren Punkte?',
    answer: 'Die Punktefunktion ist vorbereitet. Spaeter kommen Quittungen, Punkte und Verlosungen dazu.',
  },
  {
    question: 'Wie kann ich Hilfe erhalten?',
    answer: 'Oeffne jederzeit diesen Hilfe-Bereich oder sieh dir die Einfuehrung erneut an.',
  },
];

const HelpSection = ({
  title,
  icon,
  items,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: string[];
}) => (
  <AppCard style={styles.card}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={colors.primaryRed} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>

    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listRow}>
          <View style={styles.listDot} />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  </AppCard>
);

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Pressable style={[styles.faqItem, open && styles.faqItemOpen]} onPress={() => setOpen((value) => !value)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </Pressable>
  );
};

export default function HelpScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Hilfe</Text>
        <Text style={styles.heading}>Hilfe & Erklaerung</Text>
        <Text style={styles.subtitle}>Kurz, klar und jederzeit wieder oeffnbar.</Text>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Einführung</Text>
        <Text style={styles.supportText}>Sieh dir die App-Erklaerung bei Bedarf noch einmal Schritt fuer Schritt an.</Text>
        <AppButton label="Einführung erneut ansehen" onPress={() => router.push('/help/intro')} />
      </AppCard>

      <HelpSection title="Fuer Nutzer" icon="person-outline" items={userHelpItems} />
      <HelpSection title="Webportal fuer Shop und Admin" icon="desktop-outline" items={portalHelpItems} />

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Portalzugriff</Text>
        <Text style={styles.supportText}>Wenn du einen Shop oder Admin verwalten willst, geht das jetzt ueber die Website.</Text>
        <AppButton label="Shop Webportal" variant="secondary" onPress={() => router.push('/portal-access?role=shop')} />
        <AppButton label="Admin Webportal" variant="ghost" onPress={() => router.push('/portal-access?role=admin')} />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Haeufige Fragen</Text>
        <View style={styles.faqList}>
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  eyebrow: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heading: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
  card: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  supportText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryRed,
    marginTop: 6,
  },
  listText: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  faqList: {
    gap: spacing.sm,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  faqItemOpen: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF9F9',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  faqAnswer: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
});
