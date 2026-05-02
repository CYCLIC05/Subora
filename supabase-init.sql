create extension if not exists "pgcrypto";

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  creator_telegram_id bigint not null,
  name text not null,
  description text not null,
  cover_image text not null,
  channel_link text not null,
  creator_name text,
  category text,
  tiers jsonb not null,
  subscribers bigint not null default 0,
  payment_address text,
  referrer_payment_address text,
  is_closed boolean not null default false,
  is_trending boolean not null default false,
  is_active_today boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.space_subscriptions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.spaces(id) on delete cascade,
  telegram_user_id bigint,
  wallet_address text,
  referral_source text,
  currency text not null default 'TON',
  amount_paid numeric not null default 0,
  invite_link text,
  join_time timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.spaces(id) on delete set null,
  telegram_user_id bigint,
  wallet_address text,
  amount numeric not null,
  currency text not null,
  tx_hash text,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create table public.revenue_points (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  revenue bigint not null default 0,
  members bigint not null default 0
);

create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  query text unique not null,
  count bigint not null default 1,
  last_searched timestamptz not null default now()
);

-- RPC for atomic search tracking
create or replace function public.track_search_query(search_term text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.search_queries (query, count, last_searched)
  values (search_term, 1, now())
  on conflict (query)
  do update set 
    count = public.search_queries.count + 1,
    last_searched = now();
end;
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- SPACES: Public read, Creator write
CREATE POLICY "Anyone can read spaces" ON public.spaces FOR SELECT USING (true);
CREATE POLICY "Anyone can read trending spaces" ON public.spaces FOR SELECT USING (is_trending = true);
CREATE POLICY "Anyone can read closed spaces" ON public.spaces FOR SELECT USING (is_closed = true);
CREATE POLICY "Creators can insert spaces" ON public.spaces FOR INSERT WITH CHECK (auth.uid()::text = creator_telegram_id::text);
CREATE POLICY "Creators can update own spaces" ON public.spaces FOR UPDATE USING (auth.uid()::text = creator_telegram_id::text);
CREATE POLICY "Creators can delete own spaces" ON public.spaces FOR DELETE USING (auth.uid()::text = creator_telegram_id::text);

-- SPACE_SUBSCRIPTIONS: Users read own, Creators read their space's
CREATE POLICY "Anyone can read subscriptions" ON public.space_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can insert own subscription" ON public.space_subscriptions FOR INSERT WITH CHECK (auth.uid()::text = telegram_user_id::text);
CREATE POLICY "Users can update own subscription" ON public.space_subscriptions FOR UPDATE USING (auth.uid()::text = telegram_user_id::text);
CREATE POLICY "Creators can read their space subscriptions" ON public.space_subscriptions FOR SELECT USING (
  exists (select 1 from public.spaces where id = space_id and creator_telegram_id::text = auth.uid()::text)
);

-- TRANSACTIONS: Public read, Users read own, Creators read their space's
CREATE POLICY "Anyone can read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert own transaction" ON public.transactions FOR INSERT WITH CHECK (auth.uid()::text = telegram_user_id::text);
CREATE POLICY "Creators can read their space transactions" ON public.transactions FOR SELECT USING (
  exists (select 1 from public.spaces where id = space_id and creator_telegram_id::text = auth.uid()::text)
);

-- REVENUE_POINTS: Public read, Authenticated write
CREATE POLICY "Anyone can read revenue" ON public.revenue_points FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert revenue" ON public.revenue_points FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update revenue" ON public.revenue_points FOR UPDATE USING (auth.uid() IS NOT NULL);

-- SEARCH_QUERIES: Public read/write (analytics)
CREATE POLICY "Anyone can read search queries" ON public.search_queries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert search queries" ON public.search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update search queries" ON public.search_queries FOR UPDATE USING (true);
