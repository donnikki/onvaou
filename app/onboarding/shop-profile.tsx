import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { StepHeader } from '@/src/components/forms/StepHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { shopService } from '@/src/services/shopService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { ShopCategory, ShopProfile } from '@/src/types';
import { finishShopSetup } from '@/src/utils/navigation';
import { categoryToMapIcon, defaultOpeningHours } from '@/src/utils/shop';
import { categoryList, isRequired } from '@/src/utils/validators';

const steps = [
  'Basisdaten',
  'Adresse',
  'Oeffnungszeiten',
  'Produkte',
  'Dienstleistungen',
  'Bilder',
  'Map-Symbol',
] as const;

const addressCoordinateMap: Record<string, { latitude: number; longitude: number }> = {
  'Zentralstrasse 40': { latitude: 47.1338, longitude: 7.2448 },
  'Nidaugasse 14': { latitude: 47.1385, longitude: 7.2504 },
  'Bahnhofplatz 7': { latitude: 47.1326, longitude: 7.2394 },
};

const initialRegion: Region = {
  latitude: 47.1368,
  longitude: 7.2468,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

const demoAddresses = [
  {
    label: 'Zentrum',
    street: 'Zentralstrasse',
    houseNumber: '40',
    zip: '2502',
    city: 'Biel/Bienne',
    country: 'Schweiz',
    latitude: 47.1338,
    longitude: 7.2448,
  },
  {
    label: 'Altstadt',
    street: 'Nidaugasse',
    houseNumber: '14',
    zip: '2502',
    city: 'Biel/Bienne',
    country: 'Schweiz',
    latitude: 47.1385,
    longitude: 7.2504,
  },
  {
    label: 'Bahnhof',
    street: 'Bahnhofplatz',
    houseNumber: '7',
    zip: '2502',
    city: 'Biel/Bienne',
    country: 'Schweiz',
    latitude: 47.1326,
    longitude: 7.2394,
  },
] as const;

const distanceScore = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) =>
  Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);

const getNearestDemoAddress = (latitude: number, longitude: number) =>
  [...demoAddresses].sort(
    (left, right) =>
      distanceScore(left, { latitude, longitude }) - distanceScore(right, { latitude, longitude }),
  )[0];

const formatResolvedAddress = (input: {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
}) => ({
  street: input.street || 'Unbekannte Strasse',
  houseNumber: input.houseNumber,
  zip: input.zip || '2502',
  city: input.city || 'Biel/Bienne',
  country: input.country || 'Schweiz',
});

export default function ShopProfileOnboardingScreen() {
  const { currentUser, activeShopId } = useAuthStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [category, setCategory] = useState<ShopCategory>('Coiffeur');
  const [form, setForm] = useState({
    name: 'Choppers',
    description: 'Moderner Shop in Biel/Bienne.',
    slogan: 'Dein Style. Unser Handwerk.',
    street: 'Zentralstrasse',
    houseNumber: '40',
    zip: '2502',
    city: 'Biel/Bienne',
    country: 'Schweiz',
    phone: '+41 32 322 40 40',
    email: 'hello@choppers-biel.ch',
    website: '',
    products: 'Kaffee, Pflegeprodukte, Drinks',
    services: 'Herrenhaarschnitt, Bartpflege, Beratung & Styling',
    logoUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80',
    galleryImageUrls:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=600&q=80',
  });
  const [confirmedCoordinates, setConfirmedCoordinates] = useState(
    addressCoordinateMap['Zentralstrasse 40'] ?? { latitude: initialRegion.latitude, longitude: initialRegion.longitude },
  );
  const [pendingCoordinates, setPendingCoordinates] = useState(confirmedCoordinates);
  const [pendingAddress, setPendingAddress] = useState(
    formatResolvedAddress({
      street: form.street,
      houseNumber: form.houseNumber,
      zip: form.zip,
      city: form.city,
      country: form.country,
    }),
  );
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const validBase = useMemo(
    () => isRequired(form.name) && isRequired(form.description) && isRequired(form.street) && isRequired(form.email),
    [form],
  );

  const applyDemoAddress = (address: (typeof demoAddresses)[number]) => {
    setForm((old) => ({
      ...old,
      street: address.street,
      houseNumber: address.houseNumber,
      zip: address.zip,
      city: address.city,
      country: address.country,
    }));
    setPendingCoordinates({ latitude: address.latitude, longitude: address.longitude });
    setConfirmedCoordinates({ latitude: address.latitude, longitude: address.longitude });
    setPendingAddress(
      formatResolvedAddress({
        street: address.street,
        houseNumber: address.houseNumber,
        zip: address.zip,
        city: address.city,
        country: address.country,
      }),
    );
  };

  const resolveAddressForPin = async (latitude: number, longitude: number) => {
    setIsResolvingAddress(true);

    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      const first = result[0];

      if (first) {
        setPendingAddress(
          formatResolvedAddress({
            street: first.street ?? first.name ?? '',
            houseNumber: first.streetNumber ?? '',
            zip: first.postalCode ?? '',
            city: first.city ?? first.subregion ?? '',
            country: first.country ?? 'Schweiz',
          }),
        );
        return;
      }
    } catch {
      // Fallback below keeps the flow usable without native geocoder success.
    } finally {
      setIsResolvingAddress(false);
    }

    const nearest = getNearestDemoAddress(latitude, longitude);
    setPendingAddress(
      formatResolvedAddress({
        street: nearest.street,
        houseNumber: nearest.houseNumber,
        zip: nearest.zip,
        city: nearest.city,
        country: nearest.country,
      }),
    );
  };

  const confirmMapAddress = () => {
    setConfirmedCoordinates(pendingCoordinates);
    setForm((old) => ({
      ...old,
      street: pendingAddress.street,
      houseNumber: pendingAddress.houseNumber,
      zip: pendingAddress.zip,
      city: pendingAddress.city,
      country: pendingAddress.country,
    }));
  };

  const onSubmit = () => {
    const coordinateKey = `${form.street.trim()} ${form.houseNumber.trim()}`;
    const coords = confirmedCoordinates ?? addressCoordinateMap[coordinateKey] ?? { latitude: 47.1368, longitude: 7.2468 };

    const profile: ShopProfile = {
      id: activeShopId ?? `shop-${Date.now()}`,
      ownerUserId: currentUser?.id ?? 'shop-owner-1',
      name: form.name,
      category,
      description: form.description,
      slogan: form.slogan,
      street: form.street,
      houseNumber: form.houseNumber,
      zip: form.zip,
      city: form.city,
      country: form.country,
      latitude: coords.latitude,
      longitude: coords.longitude,
      phone: form.phone,
      email: form.email,
      website: form.website || undefined,
      openingHours: defaultOpeningHours,
      products: form.products
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value, index) => ({
          id: `product-${index}`,
          name: value,
          description: `${value} aus dem Sortiment`,
        })),
      services: form.services
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value, index) => ({
          id: `service-${index}`,
          name: value,
          description: `${value} im Shop`,
        })),
      logoUrl: form.logoUrl,
      heroImageUrl: form.heroImageUrl,
      galleryImageUrls: form.galleryImageUrls
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      mapIcon: categoryToMapIcon[category],
      subscriptionStatus: 'active',
      adminApproved: false,
      isVisibleOnMap: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shopService.upsert(profile);
    finishShopSetup();
  };

  return (
    <Screen>
      <StepHeader
        title="Shop-Profil erstellen"
        subtitle="Gefuehrter Flow fuer ein professionelles Profil in Biel."
        step={`Schritt ${stepIndex + 1} / ${steps.length}`}
      />

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>{steps[stepIndex]}</Text>

        {stepIndex === 0 ? (
          <View style={styles.group}>
            <AppInput label="Shop-Name" required value={form.name} onChangeText={(value) => setForm((old) => ({ ...old, name: value }))} />
            <Text style={styles.label}>Kategorie *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categoryList.map((item) => {
                const active = item === category;
                return (
                  <Pressable key={item} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => setCategory(item)}>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <AppInput
              label="Kurzbeschreibung"
              required
              value={form.description}
              onChangeText={(value) => setForm((old) => ({ ...old, description: value }))}
              multiline
            />
            <AppInput
              label="Slogan"
              value={form.slogan}
              onChangeText={(value) => setForm((old) => ({ ...old, slogan: value }))}
            />
          </View>
        ) : null}

        {stepIndex === 1 ? (
          <View style={styles.group}>
            <Text style={styles.label}>Standort auf Karte waehlen</Text>
            <Text style={styles.hint}>Tippe auf die Karte und setze die Nadel dort, wo dein Shop steht.</Text>

            <View style={styles.mapCard}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: pendingCoordinates.latitude,
                  longitude: pendingCoordinates.longitude,
                  latitudeDelta: initialRegion.latitudeDelta,
                  longitudeDelta: initialRegion.longitudeDelta,
                }}
                onPress={(event) => {
                  const nextCoordinates = event.nativeEvent.coordinate;
                  setPendingCoordinates(nextCoordinates);
                  void resolveAddressForPin(nextCoordinates.latitude, nextCoordinates.longitude);
                }}>
                <Marker coordinate={pendingCoordinates} />
              </MapView>
            </View>

            <View style={styles.addressPreview}>
              <Text style={styles.addressPreviewTitle}>Position der Nadel</Text>
              {isResolvingAddress ? (
                <View style={styles.resolvingRow}>
                  <ActivityIndicator color={colors.primaryRed} />
                  <Text style={styles.hint}>Adresse wird gesucht...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.addressPreviewText}>
                    {pendingAddress.street} {pendingAddress.houseNumber}
                  </Text>
                  <Text style={styles.addressPreviewText}>
                    {pendingAddress.zip} {pendingAddress.city}, {pendingAddress.country}
                  </Text>
                  <Text style={styles.coordinateText}>
                    {pendingCoordinates.latitude.toFixed(5)}, {pendingCoordinates.longitude.toFixed(5)}
                  </Text>
                </>
              )}
            </View>

            <AppButton label="Adresse bestaetigen" onPress={confirmMapAddress} disabled={isResolvingAddress} />

            <Text style={styles.label}>Schnellauswahl</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.addressSuggestionRow}>
              {demoAddresses.map((address) => {
                const active =
                  form.street === address.street &&
                  form.houseNumber === address.houseNumber &&
                  form.zip === address.zip;

                return (
                  <Pressable
                    key={`${address.street}-${address.houseNumber}`}
                    style={[styles.addressSuggestionCard, active && styles.addressSuggestionCardActive]}
                    onPress={() => applyDemoAddress(address)}>
                    <Text style={[styles.addressSuggestionLabel, active && styles.addressSuggestionLabelActive]}>
                      {address.label}
                    </Text>
                    <Text style={[styles.addressSuggestionText, active && styles.addressSuggestionTextActive]}>
                      {address.street} {address.houseNumber}
                    </Text>
                    <Text style={[styles.addressSuggestionText, active && styles.addressSuggestionTextActive]}>
                      {address.zip} {address.city}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.hint}>
              Tipp: Waehle eine Demo-Adresse aus Biel oder passe sie unten an.
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.inputFlex}>
                <AppInput
                  label="Strasse"
                  required
                  value={form.street}
                  onChangeText={(value) => setForm((old) => ({ ...old, street: value }))}
                  placeholder="z. B. Zentralstrasse"
                />
              </View>
              <View style={styles.inputSmall}>
                <AppInput
                  label="Nr."
                  required
                  value={form.houseNumber}
                  onChangeText={(value) => setForm((old) => ({ ...old, houseNumber: value }))}
                  placeholder="40"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputSmall}>
                <AppInput
                  label="PLZ"
                  required
                  value={form.zip}
                  onChangeText={(value) => setForm((old) => ({ ...old, zip: value }))}
                  keyboardType="numeric"
                  placeholder="2502"
                />
              </View>
              <View style={styles.inputFlex}>
                <AppInput
                  label="Ort"
                  value={form.city}
                  onChangeText={(value) => setForm((old) => ({ ...old, city: value }))}
                  placeholder="Biel/Bienne"
                />
              </View>
            </View>

            <AppInput
              label="Land"
              value={form.country}
              onChangeText={(value) => setForm((old) => ({ ...old, country: value }))}
              placeholder="Schweiz"
            />

            <View style={styles.addressPreview}>
              <Text style={styles.addressPreviewTitle}>Bestaetigte Adresse</Text>
              <Text style={styles.addressPreviewText}>
                {form.street || 'Strasse'} {form.houseNumber || ''}
              </Text>
              <Text style={styles.addressPreviewText}>
                {form.zip || 'PLZ'} {form.city || 'Biel/Bienne'}, {form.country || 'Schweiz'}
              </Text>
            </View>

            <Text style={styles.hint}>Demo-Geocoding nutzt bekannte Biel-Adressen und faellt sonst auf Stadtzentrum zurueck.</Text>
          </View>
        ) : null}

        {stepIndex === 2 ? (
          <View style={styles.group}>
            <Text style={styles.hint}>Mo-So jeweils geoeffnet/geschlossen mit Zeitfenster. (V1 nutzt Standardzeiten)</Text>
            <AppInput label="Telefon" required value={form.phone} onChangeText={(value) => setForm((old) => ({ ...old, phone: value }))} keyboardType="phone-pad" />
            <AppInput label="E-Mail" required value={form.email} onChangeText={(value) => setForm((old) => ({ ...old, email: value }))} keyboardType="email-address" autoCapitalize="none" />
          </View>
        ) : null}

        {stepIndex === 3 ? (
          <AppInput
            label="Produkte (mit Komma trennen)"
            value={form.products}
            onChangeText={(value) => setForm((old) => ({ ...old, products: value }))}
            multiline
          />
        ) : null}

        {stepIndex === 4 ? (
          <AppInput
            label="Dienstleistungen (mit Komma trennen)"
            value={form.services}
            onChangeText={(value) => setForm((old) => ({ ...old, services: value }))}
            multiline
          />
        ) : null}

        {stepIndex === 5 ? (
          <View style={styles.group}>
            <AppInput label="Logo URL" value={form.logoUrl} onChangeText={(value) => setForm((old) => ({ ...old, logoUrl: value }))} autoCapitalize="none" />
            <AppInput label="Hero-Bild URL" value={form.heroImageUrl} onChangeText={(value) => setForm((old) => ({ ...old, heroImageUrl: value }))} autoCapitalize="none" />
            <AppInput
              label="Galerie URLs (mit Komma trennen)"
              value={form.galleryImageUrls}
              onChangeText={(value) => setForm((old) => ({ ...old, galleryImageUrls: value }))}
              multiline
              autoCapitalize="none"
            />
          </View>
        ) : null}

        {stepIndex === 6 ? (
          <View style={styles.group}>
            <Text style={styles.hint}>Map-Symbol wird automatisch anhand der Kategorie gesetzt: {categoryToMapIcon[category]}</Text>
            <AppInput label="Website (optional)" value={form.website} onChangeText={(value) => setForm((old) => ({ ...old, website: value }))} autoCapitalize="none" />
          </View>
        ) : null}
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          label="Zurueck"
          variant="secondary"
          disabled={stepIndex === 0}
          onPress={() => setStepIndex((value) => Math.max(0, value - 1))}
        />
        {stepIndex < steps.length - 1 ? (
          <AppButton
            label="Weiter"
            onPress={() => {
              if (!validBase) {
                return;
              }
              setStepIndex((value) => Math.min(steps.length - 1, value + 1));
            }}
          />
        ) : (
          <AppButton label="Shop-Profil speichern" onPress={onSubmit} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  group: {
    gap: spacing.md,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family.medium,
    fontSize: typography.size.md,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
  },
  categoryRow: {
    gap: spacing.sm,
  },
  addressSuggestionRow: {
    gap: spacing.sm,
  },
  mapCard: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: 240,
  },
  addressSuggestionCard: {
    width: 170,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    gap: spacing.xs,
  },
  addressSuggestionCardActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  addressSuggestionLabel: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
  addressSuggestionLabelActive: {
    color: colors.primaryRedDark,
  },
  addressSuggestionText: {
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  addressSuggestionTextActive: {
    color: colors.text,
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
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  inputFlex: {
    flex: 1,
  },
  inputSmall: {
    width: 108,
  },
  addressPreview: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFAFA',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  addressPreviewTitle: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  addressPreviewText: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  coordinateText: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
});
