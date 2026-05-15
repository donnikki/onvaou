const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null || value.trim() === '') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  enableMockMode: toBoolean(process.env.EXPO_PUBLIC_ENABLE_MOCK_MODE, true),
  enableMockIap: toBoolean(process.env.EXPO_PUBLIC_ENABLE_MOCK_IAP, true),
};
