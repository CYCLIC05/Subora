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
