import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Header } from '@/components/Header'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GameVault — Instant Digital Game Keys',
    template: '%s | GameVault',
  },
  description:
    'Global store for digital game keys, pre-orders, gift cards, and gaming subscriptions. Instant delivery, unbeatable Xbox Series prices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} GameVault. Instant digital delivery, worldwide.</p>
        </footer>
      </body>
    </html>
  )
}
