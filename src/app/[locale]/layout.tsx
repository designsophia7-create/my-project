import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/Header'
import '../globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GameVault — Instant Digital Game Keys',
    template: '%s | GameVault',
  },
  description:
    'Global store for digital game keys, pre-orders, gift cards, and gaming subscriptions. Instant delivery, unbeatable Xbox Series prices.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('footer')

  return (
    <html lang={locale} className="dark">
      <body className={`${geist.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}>
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
            <p>{t('line', { year: new Date().getFullYear() })}</p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
