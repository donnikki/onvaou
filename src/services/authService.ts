import { mockUsers } from '@/src/data/mockUsers';
import { AppRole, UserProfile } from '@/src/types';

const nowIso = () => new Date().toISOString();
const buildQrCodeValue = (userId: string) => `BIEL-${userId}`;

let users = [...mockUsers];

export const authService = {
  buildQrCodeValue,

  getById(userId: string) {
    const user = users.find((entry) => entry.id === userId) ?? null;
    return user
      ? {
          ...user,
          qrCodeValue: user.qrCodeValue ?? buildQrCodeValue(user.id),
        }
      : null;
  },

  getByEmail(email: string) {
    const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? null;
    return user
      ? {
          ...user,
          qrCodeValue: user.qrCodeValue ?? buildQrCodeValue(user.id),
        }
      : null;
  },

  getByQrCode(qrCodeValue: string) {
    const user = users.find((entry) => (entry.qrCodeValue ?? buildQrCodeValue(entry.id)) === qrCodeValue) ?? null;
    return user
      ? {
          ...user,
          qrCodeValue: user.qrCodeValue ?? buildQrCodeValue(user.id),
        }
      : null;
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

    users = [user, ...users];
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

    return this.getById(userId);
  },

  getAllUsers() {
    return users.map((user) => ({
      ...user,
      qrCodeValue: user.qrCodeValue ?? buildQrCodeValue(user.id),
    }));
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

    return this.getById(userId);
  },

  deleteUser(userId: string) {
    const exists = users.some((user) => user.id === userId);
    users = users.filter((user) => user.id !== userId);
    return exists;
  },
};
