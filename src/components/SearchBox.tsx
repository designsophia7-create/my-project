'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

export function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const [q, setQ] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`)
      }}
      className="hidden lg:block"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-44 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
      />
    </form>
  )
}
