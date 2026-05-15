import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { authService } from '@/src/services/authService';
import { offerService } from '@/src/services/offerService';
import { redemptionService } from '@/src/services/redemptionService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { getOfferConditionLabel, getOfferRewardLabel } from '@/src/utils/offers';

export default function ShopRedemptionsScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const activeShopId = useAuthStore((state) => state.activeShopId);
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [, setRefreshKey] = useState(0);

  const activeOffers = offerService.getByShopId(activeShopId ?? '').filter((offer) => offer.status === 'active');
  const selectedOffer = activeOffers.find((offer) => offer.id === selectedOfferId) ?? activeOffers[0] ?? null;
  const scannedProfile = scannedCode ? authService.getByQrCode(scannedCode.trim()) : null;
  const recentRedemptions = redemptionService.listByShopId(activeShopId ?? '').slice(0, 6);

  const confirmRedemption = async () => {
    if (!currentUser || !selectedOffer || !scannedCode.trim()) {
      setStatusMessage('Bitte zuerst Aktion waehlen und einen QR-Code erfassen.');
      return;
    }

    const result = await redemptionService.confirmRedemption({
      offerId: selectedOffer.id,
      qrCodeValue: scannedCode.trim(),
      confirmedByShopUserId: currentUser.id,
    });

    setStatusMessage(result.message);
    if (result.ok) {
      setScannedCode('');
      setRefreshKey((value) => value + 1);
    }
  };

  if (!activeShopId) {
    return (
      <Screen>
        <EmptyState title="Kein Shop aktiv" description="Waehle zuerst ein Shop-Profil aus, damit du Einloesungen bestaetigen kannst." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.heading}>Einloesungen</Text>

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>1. Aktion waehlen</Text>
        {activeOffers.length === 0 ? (
          <EmptyState title="Keine aktiven Aktionen" description="Sobald ein Deal vom Shop akzeptiert wurde, kannst du ihn hier bestaetigen." />
        ) : (
          activeOffers.map((offer) => {
            const active = selectedOffer?.id === offer.id;
            return (
              <View key={offer.id} style={[styles.offerRow, active && styles.offerRowActive]}>
                <View style={styles.offerTextWrap}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerMeta}>{offer.description}</Text>
                  {getOfferRewardLabel(offer) ? <Text style={styles.offerHint}>{getOfferRewardLabel(offer)}</Text> : null}
                  {getOfferConditionLabel(offer) ? <Text style={styles.offerHint}>{getOfferConditionLabel(offer)}</Text> : null}
                </View>
                <AppButton label={active ? 'Aktiv' : 'Waehlen'} variant={active ? 'primary' : 'secondary'} onPress={() => setSelectedOfferId(offer.id)} />
              </View>
            );
          })
        )}
      </AppCard>

      {selectedOffer ? (
        <AppCard style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>2. QR bestaetigen</Text>
            <AppBadge text={getOfferConditionLabel(selectedOffer) ?? 'Aktion aktiv'} tone="muted" />
          </View>

          {!permission?.granted ? (
            <AppButton label="Kamera erlauben" onPress={() => requestPermission()} />
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => setScannedCode(data)}
              />
            </View>
          )}

          <Text style={styles.helper}>
            Falls du im Simulator testest, kannst du den Profil-Code auch direkt unten einfuegen.
          </Text>

          <AppInput
            label="Profil-Code oder gescannter QR"
            value={scannedCode}
            onChangeText={setScannedCode}
            placeholder="BIEL-user-demo-1"
            autoCapitalize="characters"
          />

          {scannedProfile ? (
            <View style={styles.profileBox}>
              <Text style={styles.profileName}>{scannedProfile.name}</Text>
              <Text style={styles.profileMeta}>Profil gefunden. Rolle: {scannedProfile.role}</Text>
            </View>
          ) : null}

          <AppButton label="Einloesung bestaetigen" onPress={() => void confirmRedemption()} />
          {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
        </AppCard>
      ) : null}

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Letzte Bestaetigungen</Text>
        {recentRedemptions.length === 0 ? (
          <Text style={styles.helper}>Noch keine bestaetigten Einloesungen.</Text>
        ) : (
          recentRedemptions.map((entry) => {
            const profile = authService.getById(entry.userId);
            const offer = offerService.getAll().find((item) => item.id === entry.offerId);
            return (
              <View key={entry.id} style={styles.historyBlock}>
                <View style={styles.row}>
                  <Text style={styles.historyTitle}>{profile?.name ?? entry.userId}</Text>
                  <AppBadge text={`+${entry.pointsAwarded} Punkte`} tone="green" />
                </View>
                <Text style={styles.offerMeta}>{offer?.title ?? 'Aktion'}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  offerRow: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
  },
  offerRowActive: {
    borderColor: colors.primaryRed,
    backgroundColor: '#FFF5F5',
  },
  offerTextWrap: {
    gap: spacing.xs,
  },
  offerTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.lg,
  },
  offerMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  offerHint: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.xs,
  },
  cameraWrap: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  camera: {
    height: 240,
    width: '100%',
  },
  helper: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  profileBox: {
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    padding: spacing.md,
    gap: spacing.xs,
  },
  profileName: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
  profileMeta: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  status: {
    color: colors.primaryRed,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  historyBlock: {
    gap: spacing.xs,
  },
  historyTitle: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.md,
  },
});
