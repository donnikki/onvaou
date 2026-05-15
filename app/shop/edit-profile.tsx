import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { shopService } from '@/src/services/shopService';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { ShopCategory } from '@/src/types';
import { categoryList } from '@/src/utils/validators';

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
};

export default function ShopEditProfileScreen() {
  const activeShopId = useAuthStore((state) => state.activeShopId);
  const [savedMessage, setSavedMessage] = useState('');
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
    });
  }, [shop]);

  if (!shop || !form) {
    return (
      <Screen>
        <Text style={styles.heading}>Shop-Profil bearbeiten</Text>
        <EmptyState
          title="Kein Shop-Profil aktiv"
          description="Waehle zuerst ein Shop-Profil aus oder logge dich als Shop ein."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.heading}>Shop-Profil bearbeiten</Text>

      <AppCard style={styles.card}>
        <AppInput
          label="Shop-Name"
          required
          value={form.name}
          onChangeText={(value) => setForm((old) => (old ? { ...old, name: value } : old))}
        />
        <Text style={styles.label}>Kategorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categoryList.map((item) => {
            const active = form.category === item;
            return (
              <Pressable
                key={item}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setForm((old) => (old ? { ...old, category: item } : old))}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <AppInput
          label="Kurzbeschreibung"
          value={form.description}
          onChangeText={(value) => setForm((old) => (old ? { ...old, description: value } : old))}
          multiline
        />
        <AppInput
          label="Slogan"
          value={form.slogan}
          onChangeText={(value) => setForm((old) => (old ? { ...old, slogan: value } : old))}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Adresse</Text>
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
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Kontakt</Text>
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
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Bilder</Text>
        <AppInput
          label="Logo URL"
          value={form.logoUrl}
          autoCapitalize="none"
          onChangeText={(value) => setForm((old) => (old ? { ...old, logoUrl: value } : old))}
        />
        <AppInput
          label="Hero-Bild URL"
          value={form.heroImageUrl}
          autoCapitalize="none"
          onChangeText={(value) => setForm((old) => (old ? { ...old, heroImageUrl: value } : old))}
        />
      </AppCard>

      <AppButton
        label="Aenderungen speichern"
        onPress={() => {
          shopService.updateShopBasics(shop.id, {
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
          });
          setSavedMessage('Shop-Profil wurde aktualisiert.');
        }}
      />

      {savedMessage ? <Text style={styles.savedMessage}>{savedMessage}</Text> : null}
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
    gap: spacing.md,
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
  categoryRow: {
    gap: spacing.sm,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    backgroundColor: colors.primaryRed,
    borderColor: colors.primaryRed,
  },
  categoryText: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  categoryTextActive: {
    color: '#FFFFFF',
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
  savedMessage: {
    color: colors.success,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
});
