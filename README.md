# 🚀 Subora Spaces

**Monetize your Telegram communities with ease.**

Subora Spaces is a Telegram Web App built for creators who want to sell premium membership tiers for private Telegram channels and groups. It combines a curated discovery experience, dynamic subscription tier creation, and a creator dashboard to manage spaces and revenue.

---

## ✨ What Subora Does

- Lists private Telegram communities as premium "Spaces".
- Lets creators define flexible subscription tiers with names, prices, and billing periods.
- Enables members to select a tier and purchase access using Telegram-native payment flow.
- Provides a dashboard for creators to monitor space performance, revenue trends, and active memberships.

---

## 🏗 Architecture Overview

### App structure
- `src/app/`: Next.js App Router pages and routing.
- `src/components/`: Reusable UI components and page sections.
- `src/lib/`: Type definitions, mock API data, and shared utilities.
- `src/app/api/`: API route endpoints for spaces and dashboard data.

### Key components
- `DiscoverPage`: search and browse available Spaces.
- `SpaceCard`: visual card for each community listing.
- `SpacePurchasePanel`: tier selection and Telegram TWA checkout.
- `DashboardClient`: creator dashboard with analytics and space management.
- `create/page.tsx`: builder form for new spaces with dynamic tier entry.

### Data model
- `Space` includes `tiers: SubscriptionTier[]`.
- Each tier has:
  - `name`
  - `price`
  - `duration`
- This enables flexible, non-hardcoded pricing plans per space.

### Integration flow
1. Discover spaces on the home page.
2. Open a space detail page to review tiers.
3. Select a tier and complete checkout through Telegram Web App hooks.
4. Create or manage spaces via the creator dashboard.

---

## 🧠 How It Works

### Member experience
- Browse curated Telegram communities on the discover page.
- Filter and select a community card.
- On the space details page, choose a subscription tier.
- The Telegram MainButton updates with the selected tier and price.
- Checkout is handled inside the Telegram Mini App experience.

### Creator experience
- Use the create page to define a new Space.
- Add or remove subscription tiers dynamically.
- Provide basic space details like name, description, cover image, and link.
- View created spaces and analytics in the dashboard.

### Backend / mock data
- `src/lib/mockApi.ts` provides in-memory sample spaces, dashboard stats, and revenue points.
- This mock layer can be replaced with a real Supabase backend or another database.

---

## 🛠 Tech Stack

- **Framework**: Next.js App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Frontend**: React 19
- **Data**: Supabase-compatible model and mock API
- **Telegram**: `@twa-dev/sdk` for Web App button and haptic feedback
- **Wallets**: `@tonconnect/ui-react` for optional TON integration
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- Supabase account (optional for production)
- Telegram bot token if you want to run the Web App integration

### 2. Install

```bash
git clone https://github.com/your-username/subora-spaces.git
cd subora-spaces
npm install
```

### 3. Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 4. Run

```bash
npm run dev
```

---

## 📦 Database Schema

Run this in Supabase if you want a matching backend:

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

alter table public.spaces enable row level security;

create policy "Public spaces are viewable by everyone" on public.spaces for select using (true);
create policy "Anyone can insert" on public.spaces for insert with check (true);
```

---

## 📱 Telegram Mini App Notes

- Uses `MainButton` to surface the purchase action.
- Supports `BackButton` and `HapticFeedback` when available.
- Designed to run inside Telegram Web App or standard browser fallback.

---

## 📄 License

MIT © Taiwo Oyewole

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
