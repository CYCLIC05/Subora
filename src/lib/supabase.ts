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
  currency?: string | null;
  amount_paid?: number | null;
  invite_link?: string | null;
  join_time: string;
  expires_at?: string | null;
  status?: 'pending' | 'active' | 'rejected' | 'expired';
};

export type Transaction = {
  id?: string;
  space_id: string | null;
  telegram_user_id: number | null;
  wallet_address: string | null;
  amount: number;
  currency: string;
  tx_hash: string | null;
  status: string;
  created_at?: string;
};

export type SearchQuery = {
  id?: string;
  query: string;
  count: number;
  last_searched: string;
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
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Transaction>;
        Relationships: [];
      };
      revenue_points: {
        Row: RevenuePoint;
        Insert: Omit<RevenuePoint, 'date'> & { date: string };
        Update: Partial<RevenuePoint>;
        Relationships: [];
      };
      search_queries: {
        Row: SearchQuery;
        Insert: Omit<SearchQuery, 'id' | 'last_searched'> & { id?: string; last_searched?: string };
        Update: Partial<SearchQuery>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      track_search_query: {
        Args: { search_term: string };
        Returns: void;
      };
    };
  };
};

type SupabaseClientOrNull = SupabaseClient<Database, 'public', 'public'> | null;

if (!supabaseUrl) console.error('MISSING: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) console.error('MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase: SupabaseClientOrNull = (isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin: SupabaseClientOrNull = (isValidUrl(supabaseUrl) && supabaseServiceKey)
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
