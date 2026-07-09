import { cookies } from 'next/headers'
import { currencyForCountry, isSupportedCurrency, type Currency } from '@/lib/currencies'

export type Visitor = { country: string; currency: Currency }

// Country is detected in src/proxy.ts (IP geolocation headers) and stored in a
// cookie; currency defaults from the country but can be overridden by the user.
export async function getVisitor(): Promise<Visitor> {
  const store = await cookies()
  const country = store.get('gv_country')?.value?.toUpperCase() ?? 'US'
  const cookieCurrency = store.get('gv_currency')?.value?.toUpperCase() ?? ''
  const currency = isSupportedCurrency(cookieCurrency) ? cookieCurrency : currencyForCountry(country)
  return { country, currency }
}
