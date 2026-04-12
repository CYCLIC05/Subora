import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Space = {
  id: string;
  creator_telegram_id: number;
  name: string;
  description: string;
  cover_image: string;
  channel_link: string;
  tiers: {
    tier1: {
      name: string;
      price: number;
      duration: string;
    };
    tier2?: {
      name: string;
      price: number;
      duration: string;
    };
  };
  created_at: string;
};
