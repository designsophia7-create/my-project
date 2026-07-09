import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { auth, signOut } from '@/auth'
import { getVisitor } from '@/lib/visitor'
import { LocaleSwitcher } from './LocaleSwitcher'
import { CurrencySwitcher } from './CurrencySwitcher'
import { SearchBox } from './SearchBox'

const NAV = [
  { href: '/c/new-releases', key: 'newReleases' },
  { href: '/c/pre-orders', key: 'preOrders' },
  { href: '/c/subscriptions', key: 'subscriptions' },
  { href: '/c/gift-cards', key: 'giftCards' },
] as const

export async function Header() {
  const [session, visitor, t] = await Promise.all([auth(), getVisitor(), getTranslations('nav')])

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          Game<span className="text-violet-400">Vault</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-zinc-400 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <SearchBox placeholder={t('searchPlaceholder')} />
          <CurrencySwitcher current={visitor.currency} />
          <LocaleSwitcher />
          {session?.user ? (
            <>
              <Link href="/account" className="max-w-32 truncate text-zinc-300 transition hover:text-white">
                {session.user.name ?? session.user.email}
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                  {t('signOut')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-zinc-300 transition hover:text-white">
                {t('signIn')}
              </Link>
              <Link
                href="/sign-up"
                className="whitespace-nowrap rounded-lg bg-violet-600 px-3 py-1.5 font-semibold text-white transition hover:bg-violet-500"
              >
                {t('createAccount')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
