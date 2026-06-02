import { mockUsers } from '@/src/data/mockUsers';
import { AppRole, UserProfile } from '@/src/types';
import { syncAppUserProfile } from '@/src/services/supabase/appUserSync';

const nowIso = () => new Date().toISOString();
const buildQrCodeValue = (userId: string) => `BIEL-${userId}`;

let users = [...mockUsers];
let localUsers: UserProfile[] = [];

const getAllKnownUsers = () => {
  const merged = new Map<string, UserProfile>();

  [...users, ...localUsers].forEach((entry) => {
    merged.set(entry.id, {
      ...entry,
      qrCodeValue: entry.qrCodeValue ?? buildQrCodeValue(entry.id),
    });
  });

  return Array.from(merged.values());
};

export const authService = {
  buildQrCodeValue,

  setLocalUsers(nextUsers: UserProfile[]) {
    localUsers = nextUsers.map((entry) => ({
      ...entry,
      qrCodeValue: entry.qrCodeValue ?? buildQrCodeValue(entry.id),
    }));
  },

  getById(userId: string) {
    return getAllKnownUsers().find((entry) => entry.id === userId) ?? null;
  },

  getByEmail(email: string) {
    return getAllKnownUsers().find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  getByQrCode(qrCodeValue: string) {
    return getAllKnownUsers().find((entry) => (entry.qrCodeValue ?? buildQrCodeValue(entry.id)) === qrCodeValue) ?? null;
  },

  createUserProfile(input: Pick<UserProfile, 'name' | 'birthDate' | 'email' | 'phone'>): UserProfile {
    const id = `user-${Date.now()}`;
    const user: UserProfile = {
      id,
      role: 'user',
      name: input.name,
      birthDate: input.birthDate,
      email: input.email,
      phone: input.phone,
      qrCodeValue: buildQrCodeValue(id),
      pointsBalance: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      status: 'active',
    };

    localUsers = [user, ...localUsers];
    void syncAppUserProfile(user);
    return user;
  },

  assignRole(userId: string, role: AppRole) {
    users = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            role,
            updatedAt: nowIso(),
          }
        : user,
    );
    localUsers = localUsers.map((user) =>
      user.id === userId
        ? {
            ...user,
            role,
            updatedAt: nowIso(),
          }
        : user,
    );

    return this.getById(userId);
  },

  getAllUsers() {
    return getAllKnownUsers();
  },

  updateUserStatus(userId: string, status: 'active' | 'blocked') {
    users = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status,
            updatedAt: nowIso(),
          }
        : user,
    );
    localUsers = localUsers.map((user) =>
      user.id === userId
        ? {
            ...user,
            status,
            updatedAt: nowIso(),
          }
        : user,
    );

    return this.getById(userId);
  },

  adjustPoints(userId: string, delta: number) {
    users = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            pointsBalance: Math.max(0, user.pointsBalance + delta),
            updatedAt: nowIso(),
          }
        : user,
    );
    localUsers = localUsers.map((user) =>
      user.id === userId
        ? {
            ...user,
            pointsBalance: Math.max(0, user.pointsBalance + delta),
            updatedAt: nowIso(),
          }
        : user,
    );

    return this.getById(userId);
  },

  updateUser(
    userId: string,
    updates: Partial<Pick<UserProfile, 'name' | 'birthDate' | 'email' | 'phone' | 'role' | 'status'>>,
  ) {
    users = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            ...updates,
            updatedAt: nowIso(),
          }
        : user,
    );
    localUsers = localUsers.map((user) =>
      user.id === userId
        ? {
            ...user,
            ...updates,
            updatedAt: nowIso(),
          }
        : user,
    );

    return this.getById(userId);
  },

  deleteUser(userId: string) {
    const exists = users.some((user) => user.id === userId);
    users = users.filter((user) => user.id !== userId);
    localUsers = localUsers.filter((user) => user.id !== userId);
    return exists;
  },
};
