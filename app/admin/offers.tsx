import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { offerService } from '@/src/services/offerService';
import { redemptionService } from '@/src/services/redemptionService';
import { shopService } from '@/src/services/shopService';
import { useAppStore } from '@/src/store/appStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { ActionTemplate, OfferType } from '@/src/types';
import { getOfferConditionLabel, getOfferRewardLabel } from '@/src/utils/offers';

type OfferDraft = {
  name: string;
  type: OfferType;
  title: string;
  description: string;
  discountPercent: string;
  freeItem: string;
  purchaseRequirement: string;
  fixedPriceLabel: string;
  bundleDetails: string;
  maxRedemptions: string;
  inventoryTotal: string;
  rewardLabel: string;
  friendsRequired: string;
  pointsReward: string;
  validUntil: string;
};

const createDraft = (overrides?: Partial<OfferDraft>): OfferDraft => ({
  name: '',
  type: 'percent',
  title: '',
  description: '',
  discountPercent: '',
  freeItem: '',
  purchaseRequirement: '',
  fixedPriceLabel: '',
  bundleDetails: '',
  maxRedemptions: '',
  inventoryTotal: '',
  rewardLabel: '',
  friendsRequired: '',
  pointsReward: '',
  validUntil: '2026-12-31',
  ...overrides,
});

const quickTemplates: {
  key: string;
  label: string;
  description: string;
  draft: Partial<OfferDraft>;
}[] = [
  {
    key: 'percent',
    label: '% Rabatt',
    description: 'Klassische Rabattaktion mit Prozent.',
    draft: createDraft({
      name: 'Prozent-Rabatt',
      type: 'percent',
      title: '15% Rabatt',
      description: 'Auf ausgewahlte Produkte oder Dienstleistungen.',
      discountPercent: '15',
      pointsReward: '30',
    }),
  },
  {
    key: 'free-item',
    label: 'Gratis Produkt',
    description: 'Ein Produkt komplett kostenlos anbieten.',
    draft: createDraft({
      name: 'Gratis Produkt',
      type: 'free_item',
      title: 'Gratis Produkt',
      description: 'Ein Produkt wird ohne Aufpreis abgegeben.',
      freeItem: 'Kaffee',
      rewardLabel: '1 Kaffee gratis',
      pointsReward: '40',
    }),
  },
  {
    key: 'free-with-purchase',
    label: 'Gratis bei Kauf',
    description: 'Gratisprodukt bei Kauf eines anderen Produkts.',
    draft: createDraft({
      name: 'Gratis bei Kauf',
      type: 'free_with_purchase',
      title: 'Gratis bei Kauf',
      description: 'Ein Gratisprodukt wird bei einem Kauf dazugegeben.',
      freeItem: 'Dessert',
      purchaseRequirement: 'Bei Kauf eines Hauptgerichts',
      pointsReward: '45',
    }),
  },
  {
    key: 'limited-reward',
    label: 'Nur erste 10',
    description: 'Nur fuer die ersten X bestaetigten Nutzer.',
    draft: createDraft({
      name: 'Limitierte Aktion',
      type: 'limited_reward',
      title: 'Nur fuer die ersten 10 Nutzer',
      description: 'Solange Vorrat reicht. Restbestand wird live angezeigt.',
      inventoryTotal: '10',
      rewardLabel: 'Gratis Dessert',
      pointsReward: '60',
    }),
  },
  {
    key: 'group-visit',
    label: 'Mit Freunden',
    description: 'Gueltig, wenn Nutzer mit Freunden erscheinen.',
    draft: createDraft({
      name: 'Freunde Aktion',
      type: 'group_visit',
      title: 'Aktion mit Freunden',
      description: 'Gueltig, wenn der Nutzer mit Freunden erscheint.',
      friendsRequired: '2',
      rewardLabel: 'Gratis Runde Shots',
      pointsReward: '80',
    }),
  },
  {
    key: 'two-for-one',
    label: '2 fuer 1',
    description: 'Zwei Produkte zum Preis von einem.',
    draft: createDraft({
      name: '2 fuer 1',
      type: 'two_for_one',
      title: '2 fuer 1',
      description: 'Zwei Produkte zum Preis von einem.',
      purchaseRequirement: 'Gilt auf ein gleiches Produkt',
      pointsReward: '50',
    }),
  },
  {
    key: 'fixed-price',
    label: 'Spezialpreis',
    description: 'Fixer Aktionspreis fuer ein Angebot.',
    draft: createDraft({
      name: 'Spezialpreis',
      type: 'fixed_price',
      title: 'Spezialpreis',
      description: 'Ein Angebot zu einem klaren Aktionspreis.',
      fixedPriceLabel: 'CHF 19',
      pointsReward: '25',
    }),
  },
  {
    key: 'bundle',
    label: 'Bundle',
    description: 'Mehrere Produkte als Paket anbieten.',
    draft: createDraft({
      name: 'Bundle',
      type: 'bundle',
      title: 'Bundle Angebot',
      description: 'Mehrere Produkte als Paket zu einem Vorteilspreis.',
      bundleDetails: 'Kaffee + Gipfeli + Saft',
      fixedPriceLabel: 'CHF 12',
      pointsReward: '35',
    }),
  },
  {
    key: 'happy-hour',
    label: 'Happy Hour',
    description: 'Zeitlich begrenzte Aktion fuer bestimmte Zeiten.',
    draft: createDraft({
      name: 'Happy Hour',
      type: 'happy_hour',
      title: 'Happy Hour',
      description: 'Gueltig heute von 17:00 bis 19:00 Uhr.',
      rewardLabel: '2 Drinks zum Spezialpreis',
      fixedPriceLabel: 'CHF 14',
      pointsReward: '30',
    }),
  },
  {
    key: 'points-boost',
    label: 'Punkte Boost',
    description: 'Nutzer erhalten extra Punkte bei Bestaetigung.',
    draft: createDraft({
      name: 'Punkte Boost',
      type: 'points_boost',
      title: 'Doppelte Punkte',
      description: 'Bei dieser Aktion gibt es extra Punkte fuer Nutzer.',
      pointsReward: '100',
      rewardLabel: 'Doppelte Punkte',
    }),
  },
  {
    key: 'special',
    label: 'Freie Aktion',
    description: 'Freier Text fuer individuelle Kampagnen.',
    draft: createDraft({
      name: 'Freie Aktion',
      type: 'special',
      title: 'Spezialangebot',
      description: 'Individuelle Aktion fuer einen bestimmten Shop.',
    }),
  },
];

const mapTemplateToDraft = (template: ActionTemplate): OfferDraft =>
  createDraft({
    name: template.name,
    type: template.type,
    title: template.title,
    description: template.description,
    discountPercent: template.discountPercent ? String(template.discountPercent) : '',
    freeItem: template.freeItem ?? '',
    purchaseRequirement: template.purchaseRequirement ?? '',
    fixedPriceLabel: template.fixedPriceLabel ?? '',
    bundleDetails: template.bundleDetails ?? '',
    maxRedemptions: template.maxRedemptions ? String(template.maxRedemptions) : '',
    inventoryTotal: template.inventoryTotal ? String(template.inventoryTotal) : '',
    rewardLabel: template.rewardLabel ?? '',
    friendsRequired: template.friendsRequired ? String(template.friendsRequired) : '',
    pointsReward: template.pointsReward ? String(template.pointsReward) : '',
    validUntil: template.validUntil,
  });

const buildTemplateFromDraft = (draft: OfferDraft): ActionTemplate => {
  const now = new Date().toISOString();
  return {
    id: `template-${Date.now()}`,
    name: draft.name.trim() || draft.title.trim() || 'Neue Vorlage',
    type: draft.type,
    title: draft.title.trim(),
    description: draft.description.trim(),
    discountPercent: draft.discountPercent ? Number(draft.discountPercent) : undefined,
    freeItem: draft.freeItem.trim() || undefined,
    purchaseRequirement: draft.purchaseRequirement.trim() || undefined,
    fixedPriceLabel: draft.fixedPriceLabel.trim() || undefined,
    bundleDetails: draft.bundleDetails.trim() || undefined,
    maxRedemptions: draft.maxRedemptions ? Number(draft.maxRedemptions) : undefined,
    inventoryTotal: draft.inventoryTotal ? Number(draft.inventoryTotal) : undefined,
    rewardLabel: draft.rewardLabel.trim() || undefined,
    friendsRequired: draft.friendsRequired ? Number(draft.friendsRequired) : undefined,
    pointsReward: draft.pointsReward ? Number(draft.pointsReward) : undefined,
    validUntil: draft.validUntil,
    createdAt: now,
    updatedAt: now,
  };
};

export default function AdminOffersScreen() {
  const shops = useShopStore((state) => state.shops);
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id ?? '');
  const [draft, setDraft] = useState<OfferDraft>(createDraft());
  const [savedMessage, setSavedMessage] = useState('');
  const [, setRefreshKey] = useState(0);

  const offerTemplates = useAppStore((state) => state.offerTemplates);
  const upsertOfferTemplate = useAppStore((state) => state.upsertOfferTemplate);
  const deleteOfferTemplate = useAppStore((state) => state.deleteOfferTemplate);

  const offers = offerService.getAll();

  const applyQuickTemplate = (templateKey: string) => {
    const found = quickTemplates.find((item) => item.key === templateKey);
    if (!found) {
      return;
    }

    setDraft(createDraft(found.draft));
    setSavedMessage('');
  };

  const sendOffer = () => {
    if (!selectedShopId || !draft.title.trim() || !draft.description.trim()) {
      setSavedMessage('Bitte zuerst Shop, Titel und Beschreibung erfassen.');
      return;
    }

    const template = buildTemplateFromDraft(draft);
    upsertOfferTemplate(template);

    offerService.createAdminProposal({
      shopId: selectedShopId,
      title: template.title,
      description: template.description,
      type: template.type,
      discountPercent: template.discountPercent,
      freeItem: template.freeItem,
      purchaseRequirement: template.purchaseRequirement,
      fixedPriceLabel: template.fixedPriceLabel,
      bundleDetails: template.bundleDetails,
      maxRedemptions: template.maxRedemptions,
      inventoryTotal: template.inventoryTotal,
      rewardLabel: template.rewardLabel,
      friendsRequired: template.friendsRequired,
      pointsReward: template.pointsReward,
      validUntil: template.validUntil,
    });

    setDraft(mapTemplateToDraft(template));
    setSavedMessage('Aktion wurde an den Shop gesendet und als neue Vorlage in der Historie gespeichert.');
    setRefreshKey((value) => value + 1);
  };

  return (
    <Screen>
      <Text style={styles.heading}>Aktionen verwalten</Text>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>1. Shop waehlen</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {shops.map((shop) => {
            const active = selectedShopId === shop.id;
            return (
              <Pressable
                key={shop.id}
                style={[styles.shopChip, active && styles.shopChipActive]}
                onPress={() => setSelectedShopId(shop.id)}>
                <Text style={[styles.shopChipText, active && styles.shopChipTextActive]}>{shop.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>2. Schnellvorlage waehlen</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTemplateRow}>
          {quickTemplates.map((template) => (
            <Pressable key={template.key} style={styles.quickTemplateCard} onPress={() => applyQuickTemplate(template.key)}>
              <Text style={styles.quickTemplateTitle}>{template.label}</Text>
              <Text style={styles.quickTemplateText}>{template.description}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>3. Gespeicherte Vorlagen</Text>
          <AppBadge text={`${offerTemplates.length}`} tone="muted" />
        </View>
        {offerTemplates.length === 0 ? (
          <Text style={styles.helperText}>Alle gesendeten Aktionen erscheinen hier automatisch als wiederverwendbare Vorlagen.</Text>
        ) : (
          offerTemplates.map((template) => (
            <View key={template.id} style={styles.savedTemplateRow}>
              <Pressable style={styles.savedTemplateCard} onPress={() => setDraft(mapTemplateToDraft(template))}>
                <Text style={styles.savedTemplateTitle}>{template.name}</Text>
                <Text style={styles.savedTemplateText}>{template.title}</Text>
                {getOfferConditionLabel(template) ? <Text style={styles.savedTemplateMeta}>{getOfferConditionLabel(template)}</Text> : null}
              </Pressable>
              <AppButton label="Entfernen" variant="ghost" onPress={() => deleteOfferTemplate(template.id)} />
            </View>
          ))
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>4. Aktion erstellen</Text>
        <AppInput
          label="Vorlagenname"
          value={draft.name}
          onChangeText={(value) => setDraft((old) => ({ ...old, name: value }))}
          placeholder="z. B. Lunch Rabatt Standard"
        />
        <AppInput
          label="Aktionstitel"
          value={draft.title}
          onChangeText={(value) => setDraft((old) => ({ ...old, title: value }))}
          placeholder="z. B. 15% Rabatt auf Lunch"
        />
        <AppInput
          label="Beschreibung"
          value={draft.description}
          onChangeText={(value) => setDraft((old) => ({ ...old, description: value }))}
          placeholder="Kurze Beschreibung fuer den Shop"
          multiline
        />
        <AppInput
          label="Gueltig bis"
          value={draft.validUntil}
          onChangeText={(value) => setDraft((old) => ({ ...old, validUntil: value }))}
          placeholder="2026-12-31"
        />

        {draft.type === 'percent' ? (
          <AppInput
            label="Rabatt in %"
            value={draft.discountPercent}
            onChangeText={(value) => setDraft((old) => ({ ...old, discountPercent: value }))}
            keyboardType="numeric"
            placeholder="15"
          />
        ) : null}

        {draft.type === 'free_item' || draft.type === 'free_with_purchase' ? (
          <AppInput
            label="Gratisprodukt"
            value={draft.freeItem}
            onChangeText={(value) => setDraft((old) => ({ ...old, freeItem: value }))}
            placeholder="z. B. Kaffee"
          />
        ) : null}

        {draft.type === 'free_with_purchase' || draft.type === 'two_for_one' ? (
          <AppInput
            label="Bedingung / Kaufvoraussetzung"
            value={draft.purchaseRequirement}
            onChangeText={(value) => setDraft((old) => ({ ...old, purchaseRequirement: value }))}
            placeholder="z. B. Bei Kauf eines Hauptgerichts"
          />
        ) : null}

        {draft.type === 'fixed_price' || draft.type === 'bundle' || draft.type === 'happy_hour' ? (
          <AppInput
            label="Aktionspreis"
            value={draft.fixedPriceLabel}
            onChangeText={(value) => setDraft((old) => ({ ...old, fixedPriceLabel: value }))}
            placeholder="z. B. CHF 19"
          />
        ) : null}

        {draft.type === 'bundle' ? (
          <AppInput
            label="Bundle Inhalt"
            value={draft.bundleDetails}
            onChangeText={(value) => setDraft((old) => ({ ...old, bundleDetails: value }))}
            placeholder="z. B. Kaffee + Gipfeli + Saft"
          />
        ) : null}

        {draft.type === 'first_x_visitors' || draft.type === 'limited_reward' ? (
          <AppInput
            label="Anzahl verfuegbar"
            value={draft.inventoryTotal}
            onChangeText={(value) => setDraft((old) => ({ ...old, inventoryTotal: value }))}
            keyboardType="numeric"
            placeholder="10"
          />
        ) : null}

        {draft.type === 'group_visit' ? (
          <AppInput
            label="Anzahl Freunde"
            value={draft.friendsRequired}
            onChangeText={(value) => setDraft((old) => ({ ...old, friendsRequired: value }))}
            keyboardType="numeric"
            placeholder="2"
          />
        ) : null}

        <AppInput
          label="Belohnung / Benefit"
          value={draft.rewardLabel}
          onChangeText={(value) => setDraft((old) => ({ ...old, rewardLabel: value }))}
          placeholder="z. B. Gratis Dessert oder Doppelte Punkte"
        />

        <AppInput
          label="Punkte fuer Nutzer"
          value={draft.pointsReward}
          onChangeText={(value) => setDraft((old) => ({ ...old, pointsReward: value }))}
          keyboardType="numeric"
          placeholder="40"
        />

        {draft.type === 'first_x_visitors' ? (
          <AppInput
            label="Optionale Einloesungsgrenze"
            value={draft.maxRedemptions}
            onChangeText={(value) => setDraft((old) => ({ ...old, maxRedemptions: value }))}
            keyboardType="numeric"
            placeholder="50"
          />
        ) : null}

        <AppButton label="Aktion an Shop senden" onPress={sendOffer} />
        {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Gesendete Aktionen</Text>
        {offers.length === 0 ? (
          <EmptyState
            title="Noch keine Aktionen versendet"
            description="Waehle zuerst einen Shop aus und sende dann eine Vorlage oder eine neue Aktion."
          />
        ) : (
          offers.map((offer) => {
            const shop = shopService.getById(offer.shopId);
            const confirmedCount = redemptionService.getConfirmedCount(offer.id);

            return (
              <View key={offer.id} style={styles.offerBlock}>
                <View style={styles.row}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <AppBadge
                    text={
                      offer.status === 'pending_shop'
                        ? 'Beim Shop offen'
                        : offer.status === 'active'
                          ? 'Akzeptiert'
                          : offer.status === 'declined'
                            ? 'Abgelehnt'
                            : offer.status
                    }
                    tone={offer.status === 'active' ? 'green' : 'muted'}
                  />
                </View>
                <Text style={styles.meta}>Shop: {shop?.name ?? 'Unbekannt'}</Text>
                <Text style={styles.offerText}>{offer.description}</Text>
                {getOfferRewardLabel(offer) ? <Text style={styles.meta}>{getOfferRewardLabel(offer)}</Text> : null}
                {getOfferConditionLabel(offer) ? <Text style={styles.meta}>{getOfferConditionLabel(offer)}</Text> : null}
                <Text style={styles.meta}>Bestaetigt: {confirmedCount}</Text>
              </View>
            );
          })
        )}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  card: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  helperText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  quickTemplateRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  shopChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  shopChipActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  shopChipText: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  shopChipTextActive: {
    color: '#FFFFFF',
  },
  quickTemplateCard: {
    width: 188,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.xs,
  },
  quickTemplateTitle: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  quickTemplateText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedTemplateCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.xs,
  },
  savedTemplateTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  savedTemplateText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  savedTemplateMeta: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
  },
  success: {
    color: colors.success,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  offerBlock: {
    gap: spacing.xs,
  },
  offerTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  offerText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
  },
});
