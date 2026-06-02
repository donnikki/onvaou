import { UserProfile } from '@/src/types';

import { isSupabaseConfigured, supabase } from './client';

export const syncAppUserProfile = async (profile: UserProfile) => {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const { error } = await supabase.from('app_users').upsert({
    id: profile.id,
    role: profile.role,
    name: profile.name,
    birth_date: profile.birthDate,
    email: profile.email,
    phone: profile.phone,
    qr_code_value: profile.qrCodeValue,
    points_balance: profile.pointsBalance,
    status: profile.status ?? 'active',
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  });

  if (error) {
    console.warn('Failed to sync mobile user profile to Supabase.', error);
  }
};
