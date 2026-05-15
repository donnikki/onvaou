import { UserProfile } from '@/src/types';

const now = new Date().toISOString();

export const mockUsers: UserProfile[] = [
  {
    id: 'user-demo-1',
    role: 'user',
    name: 'Lena Meier',
    birthDate: '1994-04-12',
    email: 'lena@biel.local',
    phone: '+41 79 555 12 34',
    qrCodeValue: 'BIEL-user-demo-1',
    pointsBalance: 390,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  },
  {
    id: 'shop-owner-1',
    role: 'shop_active',
    name: 'Marco Schneider',
    birthDate: '1988-02-20',
    email: 'marco@choppers-biel.ch',
    phone: '+41 79 222 22 22',
    qrCodeValue: 'BIEL-shop-owner-1',
    pointsBalance: 0,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  },
  {
    id: 'admin-1',
    role: 'admin',
    name: 'Admin Biel',
    birthDate: '1985-06-01',
    email: 'admin@biel.local',
    phone: '+41 32 111 11 11',
    qrCodeValue: 'BIEL-admin-1',
    pointsBalance: 0,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  },
];
