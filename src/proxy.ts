import createIntlMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { currencyForCountry } from './lib/currencies'

const handleI18nRouting = createIntlMiddleware(routing)

// Detect the visitor's country once per request. On Vercel the platform
// injects x-vercel-ip-country; other hosts commonly provide cf-ipcountry or
// x-country-code. A ?country=XX query param overrides for local testing.
function detectCountry(request: NextRequest): string | null {
  const override = request.nextUrl.searchParams.get('country')
  if (override && /^[a-zA-Z]{2}$/.test(override)) return override.toUpperCase()
  return (
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-country-code')
  )
}

export default function proxy(request: NextRequest) {
  const response = handleI18nRouting(request)

  const detected = detectCountry(request)
  const known = request.cookies.get('gv_country')?.value
  const country = detected ?? known ?? 'US'

  if (country !== known) {
    response.cookies.set('gv_country', country, { path: '/', sameSite: 'lax' })
  }
  // Only initialize the currency automatically; a user's explicit choice
  // (set by the header switcher) is never overwritten here.
  const explicitOverride = request.nextUrl.searchParams.has('country')
  if (!request.cookies.get('gv_currency') || explicitOverride) {
    response.cookies.set('gv_currency', currencyForCountry(country), { path: '/', sameSite: 'lax' })
  }

  return response
}

export const config = {
  // Skip API routes, Next internals, and static files.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
