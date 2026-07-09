// Pure currency helpers — safe to import from the proxy and client components.
// Anything that touches the database lives in currency.ts.
import { EU_COUNTRIES } from '@/lib/region'

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export function currencyForCountry(country: string): Currency {
  if (country === 'US') return 'USD'
  if (country === 'GB') return 'GBP'
  if (country === 'CA') return 'CAD'
  if (country === 'AU') return 'AUD'
  if (country === 'JP') return 'JPY'
  if (EU_COUNTRIES.has(country)) return 'EUR'
  return 'USD'
}

export function isSupportedCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

export function convertFromUsd(
  usd: number | string,
  currency: Currency,
  rates: Record<Currency, number>,
): number {
  return Number(usd) * (rates[currency] ?? 1)
}

export function formatPrice(amount: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function displayPrice(
  usd: number | string,
  currency: Currency,
  rates: Record<Currency, number>,
  locale: string,
): string {
  return formatPrice(convertFromUsd(usd, currency, rates), currency, locale)
}
