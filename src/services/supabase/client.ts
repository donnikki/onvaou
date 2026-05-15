import 'react-native-url-polyfill/auto';

import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { env } from '@/src/utils/env';

const hasConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

if (!hasConfig) {
  console.info('Supabase not configured, using mock data.');
}

export const isSupabaseConfigured = hasConfig;

export const supabase: SupabaseClient | null = hasConfig
  ? createClient(env.supabaseUrl!, env.supabaseAnonKey!)
  : null;
