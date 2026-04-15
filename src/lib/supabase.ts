import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch (error) {
    return false;
  }
};

type SupabaseClientOrNull = ReturnType<typeof createClient> | null

export const supabase: SupabaseClientOrNull = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type SubscriptionTier = {
  name: string;
  price: number;
  duration: string;
};

export type Space = {
  id: string;
  creator_telegram_id: number;
  name: string;
  description: string;
  cover_image: string;
  channel_link: string;
  tiers: SubscriptionTier[];
  subscribers: number;
  payment_address?: string;
  is_trending?: boolean;
  created_at: string;
};
