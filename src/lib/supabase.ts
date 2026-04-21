import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch (error) {
    return false;
  }
};

export type SubscriptionTier = {
  name: string;
  price: number;
  duration: string;
  currency?: string;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
  members: number;
};

export type Space = {
  id: string;
  creator_telegram_id: number;
  name: string;
  description: string;
  cover_image: string;
  channel_link: string;
  creator_name?: string;
  category?: string;
  is_closed?: boolean;
  tiers: SubscriptionTier[];
  subscribers: number;
  payment_address?: string;
  referrer_payment_address?: string;
  is_trending?: boolean;
  is_active_today?: boolean;
  created_at: string;
};

export type SpaceSubscription = {
  id?: string;
  space_id: string;
  telegram_user_id?: number | null;
  wallet_address?: string | null;
  referral_source?: string | null;
  join_time: string;
};

type Database = {
  public: {
    Tables: {
      spaces: {
        Row: Space;
        Insert: Omit<Space, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Space>;
        Relationships: [];
      };
      space_subscriptions: {
        Row: SpaceSubscription;
        Insert: Omit<SpaceSubscription, 'id' | 'join_time'> & { id?: string; join_time?: string };
        Update: Partial<SpaceSubscription>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

type SupabaseClientOrNull = SupabaseClient<Database, 'public', 'public'> | null;

export const supabase: SupabaseClientOrNull = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
