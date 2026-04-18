create extension if not exists "pgcrypto";

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  creator_telegram_id bigint not null,
  name text not null,
  description text not null,
  cover_image text not null,
  channel_link text not null,
  tiers jsonb not null,
  subscribers bigint not null default 0,
  payment_address text,
  is_trending boolean not null default false,
  is_active_today boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.space_subscriptions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.spaces(id),
  telegram_user_id bigint,
  wallet_address text,
  join_time timestamptz not null default now()
);
