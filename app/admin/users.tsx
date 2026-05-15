import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppInput } from '@/src/components/ui/AppInput';
import { Screen } from '@/src/components/ui/Screen';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/authStore';
import { colors, spacing, typography } from '@/src/theme';
import { finishAdminLogin, startImpersonatedShopSession, startImpersonatedUserSession } from '@/src/utils/navigation';

export default function AdminUsersScreen() {
  const [query, setQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', email: '', phone: '', birthDate: '' });
  const [, setNonce] = useState(0);

  const currentUser = useAuthStore((state) => state.currentUser);
  const impersonateUser = useAuthStore((state) => state.impersonateUser);

  const sourceUsers = authService.getAllUsers();
  const users = !query.trim()
    ? sourceUsers
    : sourceUsers.filter((user) => {
        const normalized = query.toLowerCase();
        return user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized);
      });

  return (
    <Screen>
      <Text style={styles.heading}>User verwalten</Text>
      <TextInput
        placeholder="Suche nach Name oder E-Mail"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        placeholderTextColor={colors.textMuted}
      />

      {users.map((user) => {
        const isEditing = editingUserId === user.id;

        return (
          <AppCard key={user.id} style={styles.card}>
            {isEditing ? (
              <>
                <AppInput label="Name" value={draft.name} onChangeText={(value) => setDraft((old) => ({ ...old, name: value }))} />
                <AppInput
                  label="E-Mail"
                  value={draft.email}
                  onChangeText={(value) => setDraft((old) => ({ ...old, email: value }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AppInput label="Telefon" value={draft.phone} onChangeText={(value) => setDraft((old) => ({ ...old, phone: value }))} />
                <AppInput
                  label="Geburtsdatum"
                  value={draft.birthDate}
                  onChangeText={(value) => setDraft((old) => ({ ...old, birthDate: value }))}
                  placeholder="YYYY-MM-DD"
                />

                <View style={styles.row}>
                  <AppButton
                    label="Speichern"
                    onPress={() => {
                      authService.updateUser(user.id, {
                        name: draft.name,
                        email: draft.email,
                        phone: draft.phone,
                        birthDate: draft.birthDate,
                      });
                      setEditingUserId(null);
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton label="Abbrechen" variant="secondary" onPress={() => setEditingUserId(null)} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>{user.name}</Text>
                <Text style={styles.meta}>{user.email}</Text>
                <Text style={styles.meta}>Rolle: {user.role}</Text>
                <Text style={styles.meta}>Punkte: {user.pointsBalance}</Text>
                <Text style={styles.meta}>Status: {user.status ?? 'active'}</Text>

                <View style={styles.row}>
                  <AppButton
                    label="Bearbeiten"
                    variant="secondary"
                    onPress={() => {
                      setEditingUserId(user.id);
                      setDraft({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        birthDate: user.birthDate,
                      });
                    }}
                  />
                  <AppButton
                    label="Als Profil anmelden"
                    onPress={() => {
                      const ok = impersonateUser(user.id);
                      if (!ok) {
                        return;
                      }

                      if (user.role.startsWith('shop_')) {
                        startImpersonatedShopSession();
                        return;
                      }

                      if (user.role === 'admin') {
                        finishAdminLogin();
                        return;
                      }

                      startImpersonatedUserSession();
                    }}
                  />
                </View>

                <View style={styles.row}>
                  <AppButton
                    label={user.status === 'blocked' ? 'Aktivieren' : 'Sperren'}
                    variant="secondary"
                    onPress={() => {
                      authService.updateUserStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked');
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton
                    label="Loeschen"
                    variant="ghost"
                    onPress={() => {
                      const isOwnProfile = currentUser?.id === user.id;

                      if (isOwnProfile) {
                        Alert.alert('Nicht moeglich', 'Du kannst dein aktuell angemeldetes Profil nicht loeschen.');
                        return;
                      }

                      Alert.alert('User loeschen', `Soll ${user.name} wirklich geloescht werden?`, [
                        { text: 'Abbrechen', style: 'cancel' },
                        {
                          text: 'Loeschen',
                          style: 'destructive',
                          onPress: () => {
                            authService.deleteUser(user.id);
                            setNonce((value) => value + 1);
                          },
                        },
                      ]);
                    }}
                  />
                  <AppButton
                    label="+50 Punkte"
                    variant="ghost"
                    onPress={() => {
                      authService.adjustPoints(user.id, 50);
                      setNonce((value) => value + 1);
                    }}
                  />
                  <AppButton
                    label="-50 Punkte"
                    variant="ghost"
                    onPress={() => {
                      authService.adjustPoints(user.id, -50);
                      setNonce((value) => value + 1);
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
  search: {
    height: 48,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: typography.family.regular,
  },
  card: {
    gap: spacing.sm,
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
    flexWrap: 'wrap',
  },
});
