'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/navigation'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'sign-up') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          setError(data?.error ?? t('registerFailed'))
          return
        }
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError(t('invalid'))
        return
      }
      router.push('/account')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none'

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-white">
        {mode === 'sign-in' ? t('signInTitle') : t('signUpTitle')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'sign-up' && (
          <input
            type="text"
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        )}
        <input
          type="email"
          required
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {busy ? t('wait') : mode === 'sign-in' ? t('signInButton') : t('signUpButton')}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-500">
        {mode === 'sign-in' ? (
          <>
            {t('noAccount')}{' '}
            <Link href="/sign-up" className="text-violet-400 hover:text-violet-300">
              {t('createOne')}
            </Link>
          </>
        ) : (
          <>
            {t('haveAccount')}{' '}
            <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
              {t('signInLink')}
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
