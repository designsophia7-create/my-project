import Link from 'next/link'
import { auth, signOut } from '@/auth'

const NAV = [
  { href: '/c/new-releases', label: 'New Releases' },
  { href: '/c/pre-orders', label: 'Pre-Orders' },
  { href: '/c/subscriptions', label: 'Subscriptions' },
  { href: '/c/gift-cards', label: 'Gift Cards' },
]

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          Game<span className="text-violet-400">Vault</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-zinc-400 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <Link href="/account" className="text-zinc-300 transition hover:text-white">
                {session.user.name ?? session.user.email}
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-zinc-300 transition hover:text-white">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-violet-600 px-3 py-1.5 font-semibold text-white transition hover:bg-violet-500"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
