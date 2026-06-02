import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { OpeningHoursEditor } from '@/src/components/shop/OpeningHoursEditor';
import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { ShopCategoryPicker } from '@/src/components/ui/ShopCategoryPicker';
import { ShopCategoryTreePicker } from '@/src/components/ui/ShopCategoryTreePicker';
import { shopService } from '@/src/services/shopService';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { MapIcon, OpeningHours, ShopCategory } from '@/src/types';
import { pickMultipleImages, pickSingleImage } from '@/src/utils/mediaLibrary';
import { categoryToMapIcon } from '@/src/utils/shop';
import {
  getShopContentConfig,
  parseProductsFromLines,
  parseServicesFromLines,
  serializeProducts,
  serializeServices,
} from '@/src/utils/shopProfile';

type EditForm = {
  name: string;
  category: ShopCategory;
  description: string;
  slogan: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  heroImageUrl: string;
  galleryImageUrls: string[];
  openingHours: OpeningHours;
  primaryLines: string;
  secondaryLines: string;
  mapIcon: MapIcon;
};

type SectionId = 'base' | 'contact' | 'hours' | 'content' | 'images';

const initialSections: Record<SectionId, boolean> = {
  base: true,
  contact: false,
  hours: false,
  content: true,
  images: true,
};

export default function ShopEditProfileScreen() {
  const activeShopId = useAuthStore((state) => state.activeShopId);
  const [savedMessage, setSavedMessage] = useState('');
  const [openSections, setOpenSections] = useState(initialSections);
  const shops = useShopStore((state) => state.shops);
  const shop =
    shops.find((entry) => entry.id === (activeShopId ?? 'shop-choppers')) ??
    shopService.getById(activeShopId ?? 'shop-choppers');
  const [form, setForm] = useState<EditForm | null>(null);

  useEffect(() => {
    if (!shop) {
      setForm(null);
      return;
    }

    const config = getShopContentConfig(shop.category);
    const primaryLines = config.primaryKind === 'products' ? serializeProducts(shop.products) : serializeServices(shop.services);
    const secondaryLines = config.secondaryKind === 'products' ? serializeProducts(shop.products) : serializeServices(shop.services);

    setForm({
      name: shop.name,
      category: shop.category,
      description: shop.description,
      slogan: shop.slogan,
      street: shop.street,
      houseNumber: shop.houseNumber,
      zip: shop.zip,
      city: shop.city,
      country: shop.country,
      phone: shop.phone,
      email: shop.email,
      website: shop.website ?? '',
      logoUrl: shop.logoUrl,
      heroImageUrl: shop.heroImageUrl,
      galleryImageUrls: shop.galleryImageUrls,
      openingHours: shop.openingHours,
      primaryLines,
      secondaryLines,
      mapIcon: shop.mapIcon,
    });
  }, [shop]);

  const contentConfig = useMemo(
    () => (form ? getShopContentConfig(form.category) : null),
    [form],
  );

  if (!shop || !form || !contentConfig) {
    return (
      <Screen>
        <Text style={styles.heading}>Mein Profil anpassen</Text>
        <EmptyState
          title="Kein Shop-Profil aktiv"
          description="Waehle zuerst ein Shop-Profil aus oder logge dich als Shop ein."
        />
      </Screen>
    );
  }

  const saveProfile = () => {
    const products =
      contentConfig.primaryKind === 'products'
        ? parseProductsFromLines(form.primaryLines)
        : parseProductsFromLines(form.secondaryLines);
    const services =
      contentConfig.primaryKind === 'services'
        ? parseServicesFromLines(form.primaryLines)
        : parseServicesFromLines(form.secondaryLines);

    shopService.updateShopProfile(shop.id, {
      name: form.name,
      category: form.category,
      description: form.description,
      slogan: form.slogan,
      street: form.street,
      houseNumber: form.houseNumber,
      zip: form.zip,
      city: form.city,
      country: form.country,
      phone: form.phone,
      email: form.email,
      website: form.website || undefined,
      logoUrl: form.logoUrl,
      heroImageUrl: form.heroImageUrl,
      galleryImageUrls: form.galleryImageUrls,
      openingHours: form.openingHours,
      products,
      services,
      mapIcon: form.mapIcon,
    });

    setSavedMessage('Dein Shop-Profil wurde gespeichert.');
  };

  return (
    <Screen>
      <Text style={styles.heading}>Mein Profil anpassen</Text>
      <Text style={styles.subheading}>Bearbeite dein Profil kompakt und oeffne unten jederzeit die Nutzer-Vorschau.</Text>

      <AppCard style={styles.heroCard}>
        <Image source={{ uri: form.heroImageUrl }} style={styles.heroImage} />
        <View style={styles.heroContent}>
          <Image source={{ uri: form.logoUrl }} style={styles.logo} />
          <View style={styles.heroTextWrap}>
            <View style={styles.heroBadgeRow}>
              <AppBadge text={form.category} tone="muted" />
              <AppBadge text={shop.adminApproved ? 'Freigegeben' : 'Pruefung offen'} tone={shop.adminApproved ? 'green' : 'muted'} />
            </View>
            <Text style={styles.heroTitle}>{form.name}</Text>
            <Text style={styles.heroMeta}>{form.street} {form.houseNumber}, {form.city}</Text>
          </View>
        </View>
      </AppCard>

      <EditorSection
        title="Basis & Stil"
        open={openSections.base}
        onToggle={() => setOpenSections((value) => ({ ...value, base: !value.base }))}>
        <AppInput
          label="Shop-Name"
          required
          value={form.name}
          onChangeText={(value) => setForm((old) => (old ? { ...old, name: value } : old))}
        />
        <Text style={styles.label}>Kategorie</Text>
        <ShopCategoryTreePicker
          mode="single"
          value={form.category}
          onChange={(value) =>
            setForm((old) =>
              old
                ? {
                    ...old,
                    category: value,
                    mapIcon: categoryToMapIcon[value],
                  }
                : old,
            )
          }
        />
        <Text style={styles.label}>Map-Symbol</Text>
        <ShopCategoryPicker
          mode="icon"
          value={form.mapIcon}
          onChange={(value) => setForm((old) => (old ? { ...old, mapIcon: value } : old))}
        />
        <AppInput
          label="Kurze Beschreibung"
          value={form.description}
          onChangeText={(value) => setForm((old) => (old ? { ...old, description: value } : old))}
          multiline
        />
        <AppInput
          label="Slogan"
          value={form.slogan}
          onChangeText={(value) => setForm((old) => (old ? { ...old, slogan: value } : old))}
        />
      </EditorSection>

      <EditorSection
        title="Kontakt & Standort"
        open={openSections.contact}
        onToggle={() => setOpenSections((value) => ({ ...value, contact: !value.contact }))}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput
              label="Strasse"
              value={form.street}
              onChangeText={(value) => setForm((old) => (old ? { ...old, street: value } : old))}
            />
          </View>
          <View style={styles.smallField}>
            <AppInput
              label="Nr."
              value={form.houseNumber}
              onChangeText={(value) => setForm((old) => (old ? { ...old, houseNumber: value } : old))}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.smallField}>
            <AppInput
              label="PLZ"
              value={form.zip}
              keyboardType="numeric"
              onChangeText={(value) => setForm((old) => (old ? { ...old, zip: value } : old))}
            />
          </View>
          <View style={styles.flex}>
            <AppInput
              label="Ort"
              value={form.city}
              onChangeText={(value) => setForm((old) => (old ? { ...old, city: value } : old))}
            />
          </View>
        </View>
        <AppInput
          label="Land"
          value={form.country}
          onChangeText={(value) => setForm((old) => (old ? { ...old, country: value } : old))}
        />
        <AppInput
          label="Telefon"
          value={form.phone}
          keyboardType="phone-pad"
          onChangeText={(value) => setForm((old) => (old ? { ...old, phone: value } : old))}
        />
        <AppInput
          label="E-Mail"
          value={form.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value) => setForm((old) => (old ? { ...old, email: value } : old))}
        />
        <AppInput
          label="Website"
          value={form.website}
          autoCapitalize="none"
          onChangeText={(value) => setForm((old) => (old ? { ...old, website: value } : old))}
        />
      </EditorSection>

      <EditorSection
        title="Oeffnungszeiten"
        open={openSections.hours}
        onToggle={() => setOpenSections((value) => ({ ...value, hours: !value.hours }))}>
        <OpeningHoursEditor
          value={form.openingHours}
          onChange={(value) => setForm((old) => (old ? { ...old, openingHours: value } : old))}
        />
      </EditorSection>

      <EditorSection
        title="Inhalte fuer Nutzer"
        open={openSections.content}
        onToggle={() => setOpenSections((value) => ({ ...value, content: !value.content }))}>
        <Text style={styles.helperText}>Je eine Zeile pro Eintrag. Optional kannst du mit `|` noch Preis oder Zusatzinfo angeben.</Text>
        <AppInput
          label={contentConfig.primaryTitle}
          value={form.primaryLines}
          onChangeText={(value) => setForm((old) => (old ? { ...old, primaryLines: value } : old))}
          placeholder={contentConfig.primaryPlaceholder}
          multiline
        />
        <AppInput
          label={contentConfig.secondaryTitle}
          value={form.secondaryLines}
          onChangeText={(value) => setForm((old) => (old ? { ...old, secondaryLines: value } : old))}
          placeholder={contentConfig.secondaryPlaceholder}
          multiline
        />
      </EditorSection>

      <EditorSection
        title="Bilder"
        open={openSections.images}
        onToggle={() => setOpenSections((value) => ({ ...value, images: !value.images }))}>
        <View style={styles.imageActions}>
          <AppButton
            label="Logo aus Mediathek"
            variant="secondary"
            onPress={async () => {
              const uri = await pickSingleImage();
              if (!uri) {
                return;
              }
              setForm((old) => (old ? { ...old, logoUrl: uri } : old));
            }}
          />
          <AppButton
            label="Titelbild aus Mediathek"
            variant="secondary"
            onPress={async () => {
              const uri = await pickSingleImage();
              if (!uri) {
                return;
              }
              setForm((old) => (old ? { ...old, heroImageUrl: uri } : old));
            }}
          />
          <AppButton
            label="Galeriebilder hinzufuegen"
            variant="ghost"
            onPress={async () => {
              const uris = await pickMultipleImages();
              if (uris.length === 0) {
                return;
              }
              setForm((old) => (old ? { ...old, galleryImageUrls: [...old.galleryImageUrls, ...uris].slice(0, 8) } : old));
            }}
          />
        </View>

        <View style={styles.previewImagesWrap}>
          <Image source={{ uri: form.logoUrl }} style={styles.previewImageLogo} />
          <Image source={{ uri: form.heroImageUrl }} style={styles.previewImageHero} />
        </View>

        <View style={styles.galleryGrid}>
          {form.galleryImageUrls.map((imageUrl) => (
            <View key={imageUrl} style={styles.galleryItem}>
              <Image source={{ uri: imageUrl }} style={styles.galleryItemImage} />
              <Pressable
                style={styles.removeImageButton}
                onPress={() =>
                  setForm((old) =>
                    old
                      ? {
                          ...old,
                          galleryImageUrls: old.galleryImageUrls.filter((entry) => entry !== imageUrl),
                        }
                      : old,
                  )
                }>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      </EditorSection>

      {savedMessage ? <Text style={styles.savedMessage}>{savedMessage}</Text> : null}

      <View style={styles.footerButtons}>
        <AppButton label="Aenderungen speichern" onPress={saveProfile} />
        <AppButton label="Vorschau meines Profiles" variant="secondary" onPress={() => router.push(`/shop-detail/${shop.id}?preview=1`)} />
      </View>
    </Screen>
  );
}

type EditorSectionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const EditorSection = ({ title, open, onToggle, children }: EditorSectionProps) => (
  <AppCard style={styles.card}>
    <Pressable style={styles.sectionHeader} onPress={onToggle}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
    </Pressable>
    {open ? children : null}
  </AppCard>
);

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xxl,
  },
  subheading: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.normal,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  heroContent: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  heroTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.size.xl,
  },
  heroMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  card: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  helperText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  smallField: {
    width: 108,
  },
  imageActions: {
    gap: spacing.sm,
  },
  previewImagesWrap: {
    gap: spacing.sm,
  },
  previewImageLogo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  previewImageHero: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  galleryItem: {
    position: 'relative',
  },
  galleryItemImage: {
    width: 104,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(23,23,23,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedMessage: {
    color: colors.success,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  footerButtons: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
