import type { RegionLock } from '@/generated/prisma/enums'

export const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
])

// Whether a key with the given region lock activates in the visitor's country.
export function keyWorksIn(regionLock: RegionLock, country: string): boolean {
  switch (regionLock) {
    case 'GLOBAL':
      return true
    case 'US':
      return country === 'US'
    case 'UK':
      return country === 'GB'
    case 'EU':
      return EU_COUNTRIES.has(country)
    case 'ROW':
      return country !== 'US' && country !== 'GB' && !EU_COUNTRIES.has(country)
  }
}

export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}
