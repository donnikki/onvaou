import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { shopService } from '@/src/services/shopService';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { colors, spacing, typography } from '@/src/theme';
import { startImpersonatedShopSession } from '@/src/utils/navigation';

const filters = ['pending', 'active', 'expired', 'blocked'] as const;

export default function AdminShopsScreen() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('pending');
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    phone: '',
    email: '',
  });
  const [, setNonce] = useState(0);

  const impersonateShop = useAuthStore((state) => state.impersonateShop);
  const allShops = useShopStore((state) => state.shops);

  const shops = allShops.filter((shop) => {
    if (filter === 'pending') {
      return !shop.adminApproved;
    }
    if (filter === 'active') {
      return shop.subscriptionStatus === 'active';
    }
    if (filter === 'expired') {
      return shop.subscriptionStatus === 'expired';
    }

    return !shop.isVisibleOnMap;
  });

  return (
    <Screen>
      <Text style={styles.heading}>Shops verwalten</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((item) => {
          const active = item === filter;
          return (
            <Pressable key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {shops.map((shop) => {
        const isEditing = editingShopId === shop.id;

        return (
          <AppCard key={shop.id} style={styles.card}>
            {isEditing ? (
              <>
                <AppInput label="Shop-Name" value={draft.name} onChangeText={(value) => setDraft((old) => ({ ...old, name: value }))} />
                <AppInput
                  label="Beschreibung"
                  value={draft.description}
                  onChangeText={(value) => setDraft((old) => ({ ...old, description: value }))}
                  multiline
                />
                <View style={styles.row}>
                  <View style={styles.half}>
                    <AppInput label="Strasse" value={draft.street} onChangeText={(value) => setDraft((old) => ({ ...old, street: value }))} />
                  </View>
                  <View style={styles.half}>
                    <AppInput
                      label="Nr."
                      value={draft.houseNumber}
                      onChangeText={(value) => setDraft((old) => ({ ...old, houseNumber: value }))}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.half}>
                    <AppInput label="PLZ" value={draft.zip} onChangeText={(value) => setDraft((old) => ({ ...old, zip: value }))} />
                  </View>
                  <View style={styles.half}>
                    <AppInput label="Ort" value={draft.city} onChangeText={(value) => setDraft((old) => ({ ...old, city: value }))} />
                  </View>
                </View>
                <AppInput label="Telefon" value={draft.phone} onChangeText={(value) => setDraft((old) => ({ ...old, phone: value }))} />
                <AppInput
                  label="E-Mail"
                  value={draft.email}
                  onChangeText={(value) => setDraft((old) => ({ ...old, email: value }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.row}>
                  <AppButton
                    label="Speichern"
                    onPress={() => {
                      shopService.updateShopBasics(shop.id, {
                        name: draft.name,
                        description: draft.description,
                        street: draft.street,
                        houseNumber: draft.houseNumber,
                        zip: draft.zip,
                        city: draft.city,
                        phone: draft.phone,
                        email: draft.email,
                      });
                      setEditingShopId(null);
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton label="Abbrechen" variant="secondary" onPress={() => setEditingShopId(null)} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.rowTop}>
                  <Text style={styles.title}>{shop.name}</Text>
                  <AppBadge text={shop.subscriptionStatus} tone={shop.subscriptionStatus === 'active' ? 'green' : 'muted'} />
                </View>
                <Text style={styles.meta}>{shop.street} {shop.houseNumber}, {shop.city}</Text>
                <Text style={styles.meta}>AdminApproved: {shop.adminApproved ? 'Ja' : 'Nein'}</Text>
                <Text style={styles.meta}>Map sichtbar: {shop.isVisibleOnMap ? 'Ja' : 'Nein'}</Text>

                <View style={styles.actionRow}>
                  <AppButton
                    label="Bearbeiten"
                    variant="secondary"
                    onPress={() => {
                      setEditingShopId(shop.id);
                      setDraft({
                        name: shop.name,
                        description: shop.description,
                        street: shop.street,
                        houseNumber: shop.houseNumber,
                        zip: shop.zip,
                        city: shop.city,
                        phone: shop.phone,
                        email: shop.email,
                      });
                    }}
                  />
                  <AppButton
                    label="Als Shop anmelden"
                    onPress={() => {
                      const ok = impersonateShop(shop.id);
                      if (ok) {
                        startImpersonatedShopSession();
                      }
                    }}
                  />
                </View>

                <View style={styles.actionRow}>
                  <AppButton
                    label={shop.adminApproved ? 'Sperren' : 'Freigeben'}
                    variant="secondary"
                    onPress={() => {
                      shopService.updateApproval(shop.id, !shop.adminApproved);
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton
                    label={shop.isVisibleOnMap ? 'Map verbergen' : 'Map anzeigen'}
                    variant="ghost"
                    onPress={() => {
                      shopService.updateVisibility(shop.id, !shop.isVisibleOnMap);
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton
                    label="Loeschen"
                    variant="ghost"
                    onPress={() => {
                      Alert.alert('Shop loeschen', `Soll ${shop.name} wirklich geloescht werden?`, [
                        { text: 'Abbrechen', style: 'cancel' },
                        {
                          text: 'Loeschen',
                          style: 'destructive',
                          onPress: () => {
                            shopService.deleteShop(shop.id);
                            setNonce((value) => value + 1);
                          },
                        },
                      ]);
                    }}
                  />
                </View>
              </>
            )}
          </AppCard>
        );
      })}
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
  filters: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    borderColor: colors.primaryRed,
    backgroundColor: colors.primaryRed,
  },
  filterText: {
    color: colors.text,
    fontFamily: typography.family.medium,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  card: {
    gap: spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
