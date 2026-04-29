# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Architecture

**ZEYBOX** is Algeria's experience-gifting platform. Customers buy a themed "box" (e.g. Wellness, Adventure, Restaurant), receive a QR voucher, choose an experience from the box's partner list, and the partner scans the redemption code to confirm service delivery.

### Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via PostCSS)
- Supabase (Postgres + Auth + Edge Functions) — client at `src/lib/supabaseClient.ts`, env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- React Router v7 (browser router, no SSR)
- i18next — bilingual EN/AR, translations inlined in `src/i18n.ts`; language change also flips `document.dir` for RTL

### Routing (`src/App.tsx`)

Two distinct route groups:

| Group | Layout | Routes |
|---|---|---|
| Main site | `SiteLayout` (nav + footer) | `/`, `/best-sellers`, `/gift-ideas`, `/enterprise`, `/voucher`, `/login`, `/account`, `/box/:id`, `/admin/partners` |
| Partner portal | Standalone (no nav) | `/partner/login`, `/partner/scan` |

### Key data model (Supabase tables)

- `boxes` — product catalog; has `category`, `price_dzd`, `image_url`
- `experiences` — bookable activities linked to `partners`
- `box_experiences` — many-to-many join between boxes and experiences
- `orders` — purchase records (`status: PENDING | CONFIRMED`)
- `vouchers` — issued after order confirmation (`status: active | consumed`)
- `voucher_redemptions` — created when customer chooses an experience (`status: ISSUED | REDEEMED`); holds `redeem_code` and `qr_token`
- `profiles` — extends auth users with `role` (`PARTNER` | `ADMIN` | customer) and `partner_id`
- `partners` — partner businesses

### Payment flow (`src/pages/BoxDetails.tsx`)

- **EDAHABIA / CIB** → calls Edge Function `create-chargily-checkout`, redirects to Chargily hosted page
- **CASH / BaridiMob** → inserts directly into `orders` with `status: PENDING`

### Voucher redemption flow (`src/pages/Voucher.tsx` → `src/pages/PartnerScan.tsx`)

1. Customer enters voucher code → verifies against `vouchers` table → selects an experience → creates row in `voucher_redemptions` (status `ISSUED`) and marks voucher `consumed`
2. Partner scans/enters `redeem_code` → verifies redemption row → confirms service → row updated to `REDEEMED`

### Partner portal auth (`src/pages/PartnerScan.tsx`)

Protected by checking `profiles.role === "PARTNER"` and `profiles.partner_id` after Supabase auth; redirects to `/partner/login` if unauthorized.

### Admin dashboard (`src/pages/AdminPartners.tsx`)

Calls the `get_partner_activity` Postgres RPC to aggregate redemption stats per partner.

### i18n

All UI strings go through `useTranslation()` / `t()` from `react-i18next`. Add new keys to both `en` and `ar` translation objects in `src/i18n.ts`. The partner portal (`PartnerScan.tsx`) is French-only (partner-facing, not yet translated).

### Deployment

- Frontend: Vercel — `vercel.json` rewrites all routes to `index.html` for SPA routing
- Backend: Supabase hosted (project `zeybox-web`)
- Edge Functions: `supabase/functions/send-voucher/` (sends voucher emails via Deno)
