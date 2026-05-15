import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppBadge } from '@/src/components/ui/AppBadge';
import { AppCard } from '@/src/components/ui/AppCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';

const roleLabels = {
  guest: 'Gast',
  user: 'Nutzer',
  shop_pending_subscription: 'Shop wartet auf Abo',
  shop_active: 'Shop aktiv',
  shop_expired: 'Shop Abo abgelaufen',
  admin: 'Admin',
} as const;

export default function QrScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser) {
    return (
      <Screen>
        <EmptyState
          title="Noch kein Profil aktiv"
          description="Sobald ein Nutzer-, Shop- oder Admin-Profil aktiv ist, erscheint hier der persoenliche QR-Code."
        />
      </Screen>
    );
  }

  const qrValue = currentUser.qrCodeValue ?? authService.buildQrCodeValue(currentUser.id);

  return (
    <Screen>
      <Text style={styles.heading}>Dein QR-Code</Text>

      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>{currentUser.name}</Text>
            <Text style={styles.meta}>{roleLabels[currentUser.role]}</Text>
          </View>
          <AppBadge text="Einzigartig" />
        </View>

        <View style={styles.qrWrap}>
          <QRCode value={qrValue} size={220} color={colors.text} backgroundColor="#FFFFFF" />
        </View>

        <Text style={styles.codeLabel}>Profil-Code</Text>
        <Text style={styles.code}>{qrValue}</Text>
        <Text style={styles.help}>
          Diesen QR-Code kann ein Shop-Profil im Bereich Einloesungen scannen. Danach wird die Aktion bestaetigt und die Punkte werden deinem Nutzerprofil gutgeschrieben.
        </Text>
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
    gap: spacing.lg,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    color: colors.text,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.xl,
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
  },
  qrWrap: {
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLabel: {
    color: colors.textMuted,
    fontFamily: typography.family.medium,
    fontSize: typography.size.sm,
  },
  code: {
    color: colors.primaryRed,
    fontFamily: typography.family.bold,
    fontSize: typography.size.lg,
    textAlign: 'center',
  },
  help: {
    color: colors.textMuted,
    fontFamily: typography.family.regular,
    fontSize: typography.size.md,
    textAlign: 'center',
  },
});
