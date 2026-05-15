export type AppRole =
  | 'guest'
  | 'user'
  | 'shop_pending_subscription'
  | 'shop_active'
  | 'shop_expired'
  | 'admin';

export type UserAccountStatus = 'active' | 'blocked';

export type UserProfile = {
  id: string;
  role: AppRole;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  qrCodeValue?: string;
  pointsBalance: number;
  createdAt: string;
  updatedAt: string;
  status?: UserAccountStatus;
};
