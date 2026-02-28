import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@/src/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Mutable headers object — Supabase reads this by reference on every request
export const supabaseHeaders: Record<string, string> = {};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: supabaseHeaders,
  },
});

export const setSupabaseAuthHeader = (token: string) => {
  supabaseHeaders['Authorization'] = `Bearer ${token}`;
};

export const clearSupabaseAuthHeader = () => {
  delete supabaseHeaders['Authorization'];
};