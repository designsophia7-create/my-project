import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/currencies'

export * from '@/lib/currencies'

// Offline fallback, only used until the first successful live fetch.
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.5,
  JPY: 155,
}

const RATES_TTL_MS = 12 * 3600 * 1000

// Units of each currency per 1 USD. Rates are cached in the fx_rates table and
// refreshed from the ECB (frankfurter.dev, keyless) at most every 12 hours;
// a failed fetch falls back to the last stored rates, then to FALLBACK_RATES.
export const getRates = cache(async (): Promise<Record<Currency, number>> => {
  let stored: Record<string, number> = {}
  try {
    const rows = await prisma.fxRate.findMany()
    stored = Object.fromEntries(rows.map((r) => [r.currency, Number(r.rateToUsd)]))
    const fresh =
      rows.length >= SUPPORTED_CURRENCIES.length - 1 &&
      rows.every((r) => Date.now() - r.fetchedAt.getTime() < RATES_TTL_MS)
    if (fresh) return { ...FALLBACK_RATES, ...stored }

    const symbols = SUPPORTED_CURRENCIES.filter((c) => c !== 'USD').join(',')
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`, {
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const data = (await res.json()) as { rates: Record<string, number> }
      const now = new Date()
      await Promise.all(
        Object.entries(data.rates).map(([currency, rate]) =>
          prisma.fxRate.upsert({
            where: { currency },
            update: { rateToUsd: rate, fetchedAt: now },
            create: { currency, rateToUsd: rate, fetchedAt: now },
          }),
        ),
      )
      return { ...FALLBACK_RATES, ...data.rates, USD: 1 }
    }
  } catch {
    // network or DB hiccup — fall through to whatever we have
  }
  return { ...FALLBACK_RATES, ...stored, USD: 1 }
})
