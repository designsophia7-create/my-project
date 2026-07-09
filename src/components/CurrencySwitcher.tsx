'use client'

import { useRouter } from '@/i18n/navigation'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/currencies'

export function CurrencySwitcher({ current }: { current: Currency }) {
  const router = useRouter()

  function change(currency: string) {
    document.cookie = `gv_currency=${currency}; path=/; max-age=${365 * 24 * 3600}; samesite=lax`
    router.refresh()
  }

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      aria-label="Currency"
      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  )
}
