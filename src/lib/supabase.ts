import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch {
    return false;
  }
};

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Fallback to null (casted for types) if not configured

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
  created_at: string;
};
