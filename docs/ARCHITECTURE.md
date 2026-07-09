# GameVault — Global Digital Games Store
## Architecture & Development Plan (Step 1)

A global e-commerce platform for digital game keys, pre-orders, gift cards, and gaming subscriptions, with instant automated delivery.

---

## 1. Tech Stack Recommendation

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | One codebase for storefront + API. Server-side rendering and ISR give fast, SEO-indexed product pages (critical for a store competing on price — organic search is the traffic engine). Edge Middleware handles geo-detection with zero latency cost. |
| Styling / UI | **Tailwind CSS + shadcn/ui** | Fast to build, fully customizable design system, dark-mode-first gaming aesthetic, no runtime CSS cost. |
| Database | **PostgreSQL** (Neon or Supabase, serverless) | ACID transactions are non-negotiable for key inventory — we must atomically assign exactly one key per paid order, never double-sell. Row-level locking (`SELECT … FOR UPDATE SKIP LOCKED`) makes the key-vault race-safe. |
| ORM | **Prisma** | Type-safe queries end-to-end with TypeScript, mature migrations, transaction API for the key-assignment flow. |
| Cache / rate-limit | **Redis (Upstash)** | Caches FX exchange rates and geo lookups; rate-limits checkout and key-reveal endpoints against abuse. |
| Auth | **Auth.js (NextAuth v5)** | Email + OAuth (Google/Discord — gamer-friendly), self-owned user data, no per-user vendor fees. |
| Payments | **Stripe** (cards, Apple/Google Pay, local methods) + **PayPal** + **crypto gateway** (Coinbase Commerce or NOWPayments) | Stripe covers 135+ currencies and local payment methods globally; PayPal for buyer trust; crypto for regions cards underserve. All delivery is driven by signed webhooks — never by client-side redirects. |
| Email | **Resend + React Email** | Reliable transactional delivery of keys/receipts, templates written as React components (consistent with the stack). |
| i18n / currency | **next-intl** + IP geolocation (Vercel geo headers / MaxLind GeoLite2) + cached FX rates API | Locale-routed URLs (`/en`, `/de`, `/es`…) that Google indexes per language; currency auto-selected by IP with manual override. |
| Background jobs | **Inngest** (or BullMQ) | Durable, retryable jobs for key delivery emails, webhook processing, pre-order release-day fulfillment. |
| Hosting | **Vercel** (app) + Neon (DB) + Upstash (Redis) | Global edge network out of the box — the store is fast in every region, which matches the "globally targeted" requirement. Scales to zero cost when idle. |

**Security posture for the key vault:** game keys are encrypted at rest with AES-256-GCM (encryption key held in environment/KMS, never in the DB), decrypted only at the moment of delivery after payment is confirmed by webhook signature verification. Admin key uploads are audit-logged.

---

## 2. Database Schema (core tables)

```
users
  id              uuid PK
  email           text UNIQUE NOT NULL
  password_hash   text            -- null for OAuth-only accounts
  name            text
  role            enum('customer','admin')        default 'customer'
  preferred_currency  char(3)     -- e.g. 'USD', overrides geo-detection
  preferred_locale    text        -- e.g. 'en', 'de'
  detected_country    char(2)     -- last seen ISO country, for region warnings
  created_at / updated_at

categories
  id, slug UNIQUE, name, sort_order
  type  enum('new_release','preorder','subscription','gift_card','catalog')

products
  id              uuid PK
  category_id     FK -> categories
  slug            text UNIQUE
  title           text
  description     text
  platform        enum('xbox_series','xbox_one','pc','psn','nintendo','multi')
  product_type    enum('game','preorder','gift_card','subscription')
  region_lock     enum('global','us','eu','uk','row', ...)   -- drives the warning system
  base_price_usd  numeric(10,2)   -- prices stored in USD, converted at display time
  compare_at_price_usd numeric(10,2)  -- for "was $79.99" strikethrough
  release_date    timestamptz     -- powers pre-order countdown timers
  is_active       boolean
  cover_image_url text
  metadata        jsonb           -- publisher, genre, screenshots, ratings
  created_at / updated_at

digital_keys                      -- the vault
  id              uuid PK
  product_id      FK -> products
  encrypted_key   text NOT NULL   -- AES-256-GCM ciphertext, never plaintext
  status          enum('available','reserved','sold','revoked')
  order_item_id   FK -> order_items, NULL until sold
  batch_id        uuid            -- which admin upload it came from (audit)
  created_at / sold_at

orders
  id              uuid PK
  user_id         FK -> users (nullable — guest checkout by email)
  email           text NOT NULL
  status          enum('pending','paid','delivered','failed','refunded')
  currency        char(3)         -- currency the customer actually paid in
  fx_rate         numeric(12,6)   -- USD->currency rate locked at checkout
  subtotal / total  numeric(10,2)
  ip_country      char(2)         -- country at purchase time (region-lock audit trail)
  created_at / updated_at

order_items
  id              uuid PK
  order_id        FK -> orders
  product_id      FK -> products
  quantity        int
  unit_price_usd  numeric(10,2)   -- price snapshot at purchase time

payments
  id              uuid PK
  order_id        FK -> orders
  gateway         enum('stripe','paypal','crypto')
  gateway_txn_id  text UNIQUE     -- idempotency: each webhook processed exactly once
  status          enum('pending','succeeded','failed','refunded')
  amount / currency
  raw_webhook     jsonb           -- forensic record
  created_at

fx_rates
  currency  char(3) PK, rate_to_usd numeric(12,6), fetched_at
```

**Instant-delivery flow (the critical path):**
1. Payment gateway webhook arrives → signature verified → `payments` row upserted by `gateway_txn_id` (idempotent).
2. In a single DB transaction: pick one `digital_keys` row per item with `FOR UPDATE SKIP LOCKED WHERE status='available'`, mark it `sold`, link to `order_item_id`, set order `delivered`.
3. Decrypt key(s), send email via job queue (retries on failure), and expose on the order-confirmation page + account order history.
4. If stock ran out (oversell edge case): order flagged, admin alerted, customer notified — never a silent failure.

---

## 3. Project Roadmap — 5 Phases

**Phase 1 — Foundation (scaffold & data layer)**
Next.js + TypeScript + Tailwind scaffold, Prisma schema & migrations for all tables above, seed data (sample Xbox Series catalog), Auth.js sign-up/sign-in, base layout with dark gaming theme, admin route shell.
*Exit criteria: app runs, DB migrated, users can register/log in.*

**Phase 2 — Storefront & global systems**
Category pages (New Releases, Pre-Orders with live countdown timers, Subscriptions, Gift Cards), product detail pages with the **region-lock warning banner** (compares product `region_lock` vs visitor's IP country), search & filtering, cart, geo-detection middleware, multi-currency display with locked FX rates, next-intl language switching.
*Exit criteria: a visitor in Germany sees EUR prices, German UI option, and a red warning on a "US Only" key.*

**Phase 3 — Checkout, payments & instant delivery**
Stripe Checkout + PayPal + crypto gateway integration, webhook handlers with signature verification and idempotency, the transactional key-assignment vault, delivery emails (Resend), order-confirmation key reveal, guest checkout, order history.
*Exit criteria: a test payment in any gateway delivers a key by email and on screen within seconds.*

**Phase 4 — Admin panel & operations**
Bulk key upload (CSV) with encryption at ingest, product/inventory CRUD, low-stock alerts, order & refund management, pre-order release-day auto-fulfillment job, basic fraud controls (velocity limits, mismatched-geo flags), sales dashboard.
*Exit criteria: you can run the store day-to-day without touching code.*

**Phase 5 — Hardening & launch**
Security audit (rate limiting, CSP headers, key-vault review), performance pass (Core Web Vitals, image optimization), SEO (structured data for products, per-locale sitemaps), legal pages (ToS, refund policy — important for key resale), error monitoring (Sentry), production deploy on Vercel with custom domain.
*Exit criteria: production launch.*
