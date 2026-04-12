# 🚀 Subora Spaces

**Monetize your Telegram communities with ease.** 

Subora Spaces is a premium Telegram Mini App (TWA) designed for creators. It allows you to list paid "Spaces" (private channels or groups) and collect subscription revenue directly through **Telegram Stars**.

Inspired by the collaborative aesthetic of **Miro** and the community-building power of **Circle.so**, Subora provides a clean, professional, and native-feeling experience for both creators and members.

---

## ✨ Features

- **Discover Marketplace**: Browse curated private communities with beautiful Miro-style cards.
- **Tiered Subscriptions**: Creators can offer multiple access tiers (e.g., Weekly vs. Monthly).
- **Telegram Stars Integration**: Seamless payment flow for listing fees and member subscriptions.
- **Creator Dashboard**: Track your spaces, revenue, and member growth at a glance.
- **Native TWA Feel**: Built-in support for the Telegram MainButton, BackButton, and Haptic Feedback.
- **TON Connect**: Optional wallet integration for future TON blockchain features.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State & Logic**: [React 19](https://reactjs.org/)
- **Backend / DB**: [Supabase](https://supabase.com/)
- **TWA SDK**: [@twa-dev/sdk](https://github.com/twa-dev/SDK)
- **Wallets**: [@tonconnect/ui-react](https://github.com/ton-connect/sdk)
- **Animations**: Framer Motion, Canvas Confetti

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase](https://supabase.com/) Account
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/subora-spaces.git

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 4. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
create table public.spaces (
  id uuid default gen_random_uuid() primary key,
  creator_telegram_id bigint not null,
  name text not null,
  description text not null,
  cover_image text not null,
  channel_link text not null,
  tiers jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.spaces enable row level security;

-- Policies
create policy "Public spaces are viewable by everyone" on public.spaces for select using (true);
create policy "Anyone can insert" on public.spaces for insert with check (true);
```

---

## 🎨 Design System

Subora follows the Miro Design System:
- **Primary Color**: Blue 450 (`#5b76fe`)
- **Accent Color**: Bright Yellow (`#f8db02`)
- **Text**: Near Black (`#1c1c1e`)
- **Pastel Palette**: Coral, Rose, Teal, Orange.
- **Typography**: Noto Sans (Body), Inter/Roobert fallback (Display).

---

## 📱 Telegram Mini App Configuration

Ensure your bot is configured to point its Mini App URL to your deployment (e.g., Vercel).

Native features used:
- `webapp.expand()`
- `webapp.MainButton` (Primary actions)
- `webapp.BackButton` (Navigation)
- `webapp.HapticFeedback` (Tactile interactions)

---

## 📄 License

MIT © [Taiwo Oyewole](https://github.com/your-username)
