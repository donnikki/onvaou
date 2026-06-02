import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/src/components/ui/CategoryIcon';
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
import { ActionTemplate, OfferType, ShopCategory } from '@/src/types';
import { getAdminOfferSuggestions } from '@/src/utils/adminOfferSuggestions';
import {
  ShopTopCategoryId,
  categoryToTopCategory,
  getTopCategory,
  shopTopCategories,
  topCategoryToLeafCategories,
} from '@/src/utils/shopCategories';
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

const getOfferTypeLabel = (type: OfferType) => {
  switch (type) {
    case 'percent':
      return 'Rabatt';
    case 'free_item':
      return 'Gratis Produkt';
    case 'free_with_purchase':
      return 'Gratis bei Kauf';
    case 'two_for_one':
      return '2 fuer 1';
    case 'fixed_price':
      return 'Spezialpreis';
    case 'bundle':
      return 'Bundle';
    case 'first_x_visitors':
      return 'Erste Besucher';
    case 'limited_reward':
      return 'Limitierte Aktion';
    case 'group_visit':
      return 'Mit Freunden';
    case 'happy_hour':
      return 'Happy Hour';
    case 'points_boost':
      return 'Punkte Boost';
    case 'special':
      return 'Freie Aktion';
    default:
      return 'Aktion';
  }
};

const getOfferStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_shop':
      return 'Beim Shop offen';
    case 'active':
      return 'Akzeptiert';
    case 'declined':
      return 'Abgelehnt';
    case 'paused':
      return 'Pausiert';
    case 'expired':
      return 'Abgelaufen';
    default:
      return status;
  }
};

const getOfferStatusTone = (status: string): 'red' | 'green' | 'muted' => {
  if (status === 'active') {
    return 'green';
  }

  if (status === 'declined') {
    return 'red';
  }

  return 'muted';
};

const getShopStatusTone = (approved: boolean, subscriptionStatus: string): 'red' | 'green' | 'muted' => {
  if (approved && subscriptionStatus === 'active') {
    return 'green';
  }

  if (!approved) {
    return 'red';
  }

  return 'muted';
};

export default function AdminOffersScreen() {
  const shops = useShopStore((state) => state.shops);
  const offerTemplates = useAppStore((state) => state.offerTemplates);
  const upsertOfferTemplate = useAppStore((state) => state.upsertOfferTemplate);
  const deleteOfferTemplate = useAppStore((state) => state.deleteOfferTemplate);

  const sortedShops = useMemo(() => [...shops].sort((left, right) => left.name.localeCompare(right.name, 'de-CH')), [shops]);
  const firstAvailableTopCategoryId =
    shopTopCategories.find((entry) => sortedShops.some((shop) => categoryToTopCategory[shop.category] === entry.id))?.id ??
    shopTopCategories[0].id;

  const [selectedTopCategoryId, setSelectedTopCategoryId] = useState<ShopTopCategoryId>(firstAvailableTopCategoryId);
  const [selectedLeafCategory, setSelectedLeafCategory] = useState<ShopCategory | 'all'>('all');
  const [selectedShopId, setSelectedShopId] = useState(sortedShops[0]?.id ?? '');
  const [draft, setDraft] = useState<OfferDraft>(createDraft());
  const [savedMessage, setSavedMessage] = useState('');
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
  const [historyMode, setHistoryMode] = useState<'selected' | 'all'>('selected');
  const [refreshKey, setRefreshKey] = useState(0);

  const topCategoryGroups = useMemo(
    () =>
      shopTopCategories.map((topCategory) => ({
        ...topCategory,
        shops: sortedShops.filter((shop) => categoryToTopCategory[shop.category] === topCategory.id),
      })),
    [sortedShops],
  );

  useEffect(() => {
    if (!topCategoryGroups.some((entry) => entry.id === selectedTopCategoryId && entry.shops.length > 0)) {
      const fallbackTopCategoryId = topCategoryGroups.find((entry) => entry.shops.length > 0)?.id ?? shopTopCategories[0].id;
      setSelectedTopCategoryId(fallbackTopCategoryId);
    }
  }, [selectedTopCategoryId, topCategoryGroups]);

  const selectedTopCategory = getTopCategory(selectedTopCategoryId);
  const shopsInTopCategory = topCategoryGroups.find((entry) => entry.id === selectedTopCategoryId)?.shops ?? [];
  const availableLeafCategories = topCategoryToLeafCategories[selectedTopCategoryId].filter((category) =>
    shopsInTopCategory.some((shop) => shop.category === category),
  );

  useEffect(() => {
    if (selectedLeafCategory !== 'all' && !availableLeafCategories.includes(selectedLeafCategory)) {
      setSelectedLeafCategory('all');
    }
  }, [availableLeafCategories, selectedLeafCategory]);

  const visibleShops =
    selectedLeafCategory === 'all' ? shopsInTopCategory : shopsInTopCategory.filter((shop) => shop.category === selectedLeafCategory);

  useEffect(() => {
    if (visibleShops.length === 0) {
      if (selectedShopId) {
        setSelectedShopId('');
      }
      return;
    }

    if (!visibleShops.some((shop) => shop.id === selectedShopId)) {
      setSelectedShopId(visibleShops[0].id);
    }
  }, [selectedShopId, visibleShops]);

  const selectedShop = sortedShops.find((shop) => shop.id === selectedShopId) ?? null;
  const effectiveCategory = selectedShop?.category ?? (selectedLeafCategory !== 'all' ? selectedLeafCategory : null);
  const suggestions = useMemo(
    () =>
      getAdminOfferSuggestions({
        topCategoryId: selectedTopCategoryId,
        shopCategory: effectiveCategory,
      }),
    [effectiveCategory, selectedTopCategoryId],
  );
  const featuredSuggestions = suggestions.slice(0, 6);
  const moreSuggestions = suggestions.slice(6);

  const offers = useMemo(() => [...offerService.getAll()].sort((left, right) => right.createdAt.localeCompare(left.createdAt)), [refreshKey]);
  const pendingCount = offers.filter((offer) => offer.status === 'pending_shop').length;
  const activeCount = offers.filter((offer) => offer.status === 'active').length;
  const selectedShopOffers = offers.filter((offer) => (historyMode === 'all' ? true : offer.shopId === selectedShopId));

  const applySuggestion = (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) {
      return;
    }

    setDraft(
      createDraft({
        name: suggestion.draft.name,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.draft.description,
        discountPercent: suggestion.draft.discountPercent ?? '',
        freeItem: suggestion.draft.freeItem ?? '',
        purchaseRequirement: suggestion.draft.purchaseRequirement ?? '',
        fixedPriceLabel: suggestion.draft.fixedPriceLabel ?? '',
        bundleDetails: suggestion.draft.bundleDetails ?? '',
        maxRedemptions: suggestion.draft.maxRedemptions ?? '',
        inventoryTotal: suggestion.draft.inventoryTotal ?? '',
        rewardLabel: suggestion.draft.rewardLabel ?? '',
        friendsRequired: suggestion.draft.friendsRequired ?? '',
        pointsReward: suggestion.draft.pointsReward ?? '',
        validUntil: suggestion.draft.validUntil ?? '2026-12-31',
      }),
    );
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
    setSavedMessage('Aktion wurde an den Shop gesendet und als Vorlage gespeichert.');
    setRefreshKey((value) => value + 1);
  };

  const activeHistoryShop = historyMode === 'selected' && selectedShop ? selectedShop.name : 'Alle Shops';

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heading}>Aktionen verwalten</Text>
        <Text style={styles.subtitle}>Waehle zuerst eine Shop-Kategorie, dann den passenden Shop und danach eine fertige Aktionsidee.</Text>
      </View>

      <AppCard style={styles.overviewCard}>
        <View style={styles.overviewTop}>
          <Text style={styles.sectionTitle}>Schnellueberblick</Text>
          <AppBadge text={`${suggestions.length} Ideen`} tone="muted" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sortedShops.length}</Text>
            <Text style={styles.statLabel}>Shops</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Offen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Aktiv</Text>
          </View>
        </View>

        {selectedShop ? (
          <View style={styles.selectedSummary}>
            <CategoryIcon icon={selectedTopCategory.icon} size={28} />
            <View style={styles.selectedSummaryText}>
              <Text style={styles.selectedSummaryTitle}>{selectedShop.name}</Text>
              <Text style={styles.selectedSummaryMeta}>
                {selectedTopCategory.label} · {selectedShop.category}
              </Text>
            </View>
          </View>
        ) : null}
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>1. Oberkategorie waehlen</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topCategoryRow}>
          {topCategoryGroups.map((topCategory) => {
            const active = topCategory.id === selectedTopCategoryId;

            return (
              <Pressable
                key={topCategory.id}
                style={[styles.topCategoryCard, active && styles.topCategoryCardActive]}
                onPress={() => {
                  setSelectedTopCategoryId(topCategory.id);
                  setSelectedLeafCategory('all');
                  setShowMoreSuggestions(false);
                  setSavedMessage('');
                }}>
                <View style={styles.topCategoryCardRow}>
                  <CategoryIcon icon={topCategory.icon} size={28} />
                  <AppBadge text={`${topCategory.shops.length}`} tone={active ? 'green' : 'muted'} />
                </View>
                <Text style={[styles.topCategoryTitle, active && styles.topCategoryTitleActive]}>{topCategory.label}</Text>
                <Text style={[styles.topCategoryText, active && styles.topCategoryTextActive]}>
                  {topCategory.shops.length === 0 ? 'Noch keine Shops' : `${topCategory.shops.length} Shops verfuegbar`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {availableLeafCategories.length > 0 ? (
          <View style={styles.subcategoryWrap}>
            <Text style={styles.subsectionLabel}>Unterkategorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcategoryRow}>
              <Pressable
                style={[styles.filterChip, selectedLeafCategory === 'all' && styles.filterChipActive]}
                onPress={() => {
                  setSelectedLeafCategory('all');
                  setSavedMessage('');
                }}>
                <Text style={[styles.filterChipText, selectedLeafCategory === 'all' && styles.filterChipTextActive]}>Alle</Text>
              </Pressable>
              {availableLeafCategories.map((category) => {
                const active = selectedLeafCategory === category;
                return (
                  <Pressable
                    key={category}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => {
                      setSelectedLeafCategory(category);
                      setSavedMessage('');
                    }}>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{category}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>2. Shop waehlen</Text>
          <AppBadge text={`${visibleShops.length}`} tone="muted" />
        </View>
        <Text style={styles.helperText}>Die Shops sind nach Kategorie sortiert, damit du schneller den passenden Empfaenger findest.</Text>

        {visibleShops.length === 0 ? (
          <EmptyState title="Keine Shops in dieser Auswahl" description="Waehle eine andere Ober- oder Unterkategorie." />
        ) : (
          <View style={styles.shopList}>
            {visibleShops.map((shop) => {
              const active = selectedShopId === shop.id;
              const shopTone = getShopStatusTone(shop.adminApproved, shop.subscriptionStatus);

              return (
                <Pressable
                  key={shop.id}
                  style={[styles.shopCard, active && styles.shopCardActive]}
                  onPress={() => {
                    setSelectedTopCategoryId(categoryToTopCategory[shop.category]);
                    setSelectedLeafCategory(shop.category);
                    setSelectedShopId(shop.id);
                    setShowMoreSuggestions(false);
                    setSavedMessage('');
                  }}>
                  <View style={styles.shopCardHeader}>
                    <View style={styles.shopCardTitleWrap}>
                      <Text style={styles.shopCardTitle}>{shop.name}</Text>
                      <Text style={styles.shopCardMeta}>{shop.category}</Text>
                    </View>
                    <AppBadge
                      text={shop.adminApproved ? (shop.subscriptionStatus === 'active' ? 'Bereit' : 'Abo inaktiv') : 'Nicht freigegeben'}
                      tone={shopTone}
                    />
                  </View>
                  <Text style={styles.shopCardText}>{shop.description}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>3. Passende Vorschlaege</Text>
          <AppBadge text={`${suggestions.length}`} tone="muted" />
        </View>
        <Text style={styles.helperText}>
          {selectedShop
            ? `Diese Ideen passen zu ${selectedShop.name} und der Kategorie ${selectedShop.category}.`
            : `Diese Ideen passen zur Oberkategorie ${selectedTopCategory.label}.`}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
          {featuredSuggestions.map((suggestion, index) => (
            <Pressable key={suggestion.key} style={styles.suggestionCard} onPress={() => applySuggestion(index)}>
              <View style={styles.suggestionCardTop}>
                <Text style={styles.suggestionTitle}>{suggestion.label}</Text>
                <Ionicons name="flash-outline" size={16} color={colors.primaryRed} />
              </View>
              <Text style={styles.suggestionText}>{suggestion.description}</Text>
              <Text style={styles.suggestionMeta}>{suggestion.title}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {moreSuggestions.length > 0 ? (
          <>
            <AppButton
              label={showMoreSuggestions ? 'Weniger Vorschlaege' : 'Mehr Vorschlaege anzeigen'}
              variant="ghost"
              onPress={() => setShowMoreSuggestions((value) => !value)}
            />
            {showMoreSuggestions ? (
              <View style={styles.moreSuggestionList}>
                {moreSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={suggestion.key}
                    style={styles.moreSuggestionRow}
                    onPress={() => applySuggestion(index + featuredSuggestions.length)}>
                    <View style={styles.moreSuggestionTextWrap}>
                      <Text style={styles.moreSuggestionTitle}>{suggestion.label}</Text>
                      <Text style={styles.moreSuggestionText}>{suggestion.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>4. Gespeicherte Vorlagen</Text>
          <AppBadge text={`${offerTemplates.length}`} tone="muted" />
        </View>
        {offerTemplates.length === 0 ? (
          <Text style={styles.helperText}>Gesendete Aktionen werden automatisch hier gespeichert und koennen spaeter erneut geladen werden.</Text>
        ) : (
          <View style={styles.templateList}>
            {offerTemplates.map((template) => (
              <View key={template.id} style={styles.templateRow}>
                <Pressable
                  style={styles.templateCard}
                  onPress={() => {
                    setDraft(mapTemplateToDraft(template));
                    setSavedMessage('');
                  }}>
                  <Text style={styles.templateTitle}>{template.name}</Text>
                  <Text style={styles.templateText}>{template.title}</Text>
                  <Text style={styles.templateMeta}>{getOfferTypeLabel(template.type)}</Text>
                </Pressable>
                <AppButton label="Entfernen" variant="ghost" onPress={() => deleteOfferTemplate(template.id)} />
              </View>
            ))}
          </View>
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>5. Aktion erstellen</Text>
          <Pressable
            style={styles.resetDraftButton}
            onPress={() => {
              setDraft(createDraft({ type: 'special' }));
              setSavedMessage('');
            }}>
            <Text style={styles.resetDraftButtonText}>Leere Aktion</Text>
          </Pressable>
        </View>

        {selectedShop ? (
          <View style={styles.editorSummary}>
            <View style={styles.editorSummaryPill}>
              <Ionicons name="storefront-outline" size={15} color={colors.primaryRed} />
              <Text style={styles.editorSummaryText}>{selectedShop.name}</Text>
            </View>
            <View style={styles.editorSummaryPill}>
              <Ionicons name="grid-outline" size={15} color={colors.primaryRed} />
              <Text style={styles.editorSummaryText}>{selectedShop.category}</Text>
            </View>
            <View style={styles.editorSummaryPill}>
              <Ionicons name="pricetag-outline" size={15} color={colors.primaryRed} />
              <Text style={styles.editorSummaryText}>{getOfferTypeLabel(draft.type)}</Text>
            </View>
          </View>
        ) : null}

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

        <AppButton label="Aktion an Shop senden" onPress={sendOffer} disabled={!selectedShopId} />
        {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Gesendete Aktionen</Text>
          <AppBadge text={activeHistoryShop} tone="muted" />
        </View>

        <View style={styles.historyFilterRow}>
          <Pressable
            style={[styles.filterChip, historyMode === 'selected' && styles.filterChipActive]}
            onPress={() => setHistoryMode('selected')}>
            <Text style={[styles.filterChipText, historyMode === 'selected' && styles.filterChipTextActive]}>Nur gewaehlter Shop</Text>
          </Pressable>
          <Pressable style={[styles.filterChip, historyMode === 'all' && styles.filterChipActive]} onPress={() => setHistoryMode('all')}>
            <Text style={[styles.filterChipText, historyMode === 'all' && styles.filterChipTextActive]}>Alle Shops</Text>
          </Pressable>
        </View>

        {selectedShopOffers.length === 0 ? (
          <EmptyState
            title="Noch keine Aktionen versendet"
            description="Waehle zuerst einen Shop aus und sende dann eine Vorlage oder eine neue Aktion."
          />
        ) : (
          <View style={styles.offerList}>
            {selectedShopOffers.map((offer) => {
              const shop = shopService.getById(offer.shopId);
              const confirmedCount = redemptionService.getConfirmedCount(offer.id);

              return (
                <View key={offer.id} style={styles.offerBlock}>
                  <View style={styles.offerHeader}>
                    <View style={styles.offerHeaderText}>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                      <Text style={styles.offerMeta}>
                        {shop?.name ?? 'Unbekannt'} · {shop?.category ?? 'Shop'}
                      </Text>
                    </View>
                    <AppBadge text={getOfferStatusLabel(offer.status)} tone={getOfferStatusTone(offer.status)} />
                  </View>
                  <Text style={styles.offerText}>{offer.description}</Text>
                  {getOfferRewardLabel(offer) ? <Text style={styles.offerMeta}>{getOfferRewardLabel(offer)}</Text> : null}
                  {getOfferConditionLabel(offer) ? <Text style={styles.offerMeta}>{getOfferConditionLabel(offer)}</Text> : null}
                  <Text style={styles.offerMeta}>Bestaetigt: {confirmedCount}</Text>
                </View>
              );
            })}
          </View>
        )}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginTop: spacing.sm,
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
    lineHeight: typography.lineHeight.normal,
  },
  overviewCard: {
    gap: spacing.md,
    backgroundColor: '#FFF6F6',
    borderColor: '#FBCACA',
  },
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE2E2',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.primaryRed,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE2E2',
  },
  selectedSummaryText: {
    flex: 1,
    gap: 2,
  },
  selectedSummaryTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  selectedSummaryMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  card: {
    gap: spacing.md,
  },
  topCategoryRow: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  topCategoryCard: {
    width: 188,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.sm,
  },
  topCategoryCardActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  topCategoryCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topCategoryTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  topCategoryTitleActive: {
    color: colors.primaryRed,
  },
  topCategoryText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  topCategoryTextActive: {
    color: '#8B1D1D',
  },
  subsectionLabel: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  subcategoryWrap: {
    gap: spacing.sm,
  },
  subcategoryRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  filterChipText: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helperText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  shopList: {
    gap: spacing.sm,
  },
  shopCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.sm,
  },
  shopCardActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  shopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  shopCardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  shopCardTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  shopCardMeta: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  shopCardText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  suggestionRow: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  suggestionCard: {
    width: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FBCACA',
    backgroundColor: '#FFF8F8',
    padding: spacing.md,
    gap: spacing.sm,
  },
  suggestionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionTitle: {
    flex: 1,
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  suggestionText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  suggestionMeta: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  moreSuggestionList: {
    gap: spacing.sm,
  },
  moreSuggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
  },
  moreSuggestionTextWrap: {
    flex: 1,
    gap: 2,
  },
  moreSuggestionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  moreSuggestionText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  templateList: {
    gap: spacing.sm,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  templateCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.xs,
  },
  templateTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  templateText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  templateMeta: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
  },
  resetDraftButton: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.chipBackground,
  },
  resetDraftButtonText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  editorSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  editorSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FBCACA',
  },
  editorSummaryText: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  success: {
    color: colors.success,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  historyFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  offerList: {
    gap: spacing.md,
  },
  offerBlock: {
    gap: spacing.xs,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  offerHeaderText: {
    flex: 1,
    gap: 2,
  },
  offerTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  offerMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  offerText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
});
