# GameVault — Global Digital Games Store

E-commerce platform for digital game keys, pre-orders, gift cards, and gaming subscriptions with instant automated delivery. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full tech stack rationale, database schema, and 5-phase roadmap.

**Status: Phase 1 (Foundation) complete** — scaffold, database schema, encrypted key vault, auth, seeded catalog, dark storefront.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma 7 · Auth.js v5

## Getting started

```bash
npm install                 # also runs prisma generate
cp .env.example .env        # then fill in the values
npx prisma migrate dev      # create the schema
npm run db:seed             # sample catalog + demo keys
npm run dev
```

Required environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js JWT signing secret (`openssl rand -hex 32`) |
| `KEY_VAULT_SECRET` | 32-byte hex key for AES-256-GCM encryption of game keys at rest (`openssl rand -hex 32`) |

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed categories, products, and encrypted demo keys |
| `npm run lint` | ESLint |

## Project layout

- `prisma/schema.prisma` — full data model (users, products, digital_keys, orders, payments, fx_rates)
- `src/lib/keyvault.ts` — AES-256-GCM encrypt/decrypt for game keys
- `src/auth.ts` — Auth.js credentials auth (OAuth arrives in Phase 2)
- `src/app` — storefront (home, category, product, auth, account pages)
- `legacy/` — pre-existing MailerLite landing page, kept for reference
