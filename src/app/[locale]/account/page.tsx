import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getVisitor } from '@/lib/visitor'
import { countryName } from '@/lib/region'

export const metadata = { title: 'My account' }
export const dynamic = 'force-dynamic'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  if (!session?.user) redirect(`/${locale}/sign-in`)

  const [user, visitor, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, createdAt: true },
    }),
    getVisitor(),
    getTranslations('account'),
  ])

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm">
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-zinc-500">{t('email')}</dt>
            <dd className="text-zinc-200">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">{t('name')}</dt>
            <dd className="text-zinc-200">{user?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">{t('memberSince')}</dt>
            <dd className="text-zinc-200">{user?.createdAt.toLocaleDateString(locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">{t('location')}</dt>
            <dd className="text-zinc-200">
              {countryName(visitor.country, locale)} · {visitor.currency}
            </dd>
          </div>
        </dl>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-500">
        {t('ordersComing')}
      </div>
    </div>
  )
}
