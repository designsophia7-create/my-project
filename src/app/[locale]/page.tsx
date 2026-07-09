import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { getRates } from '@/lib/currency'
import { getVisitor } from '@/lib/visitor'
import { ProductCard, toCardData } from '@/components/ProductCard'
import { categoryNavKey } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [categories, rates, visitor, t, tHero] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 4,
          select: {
            slug: true,
            title: true,
            platform: true,
            regionLock: true,
            basePriceUsd: true,
            compareAtPriceUsd: true,
            releaseDate: true,
          },
        },
      },
    }),
    getRates(),
    getVisitor(),
    getTranslations('common'),
    getTranslations('hero'),
  ])
  const tNav = await getTranslations('nav')

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-r from-violet-950 via-zinc-900 to-emerald-950 p-10 ring-1 ring-zinc-800">
        <h1 className="max-w-2xl text-4xl font-black leading-tight text-white">
          {tHero.rich('title', {
            accent: (chunks) => <span className="text-violet-400">{chunks}</span>,
          })}
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">{tHero('subtitle')}</p>
      </section>

      {categories
        .filter((c) => c.products.length > 0)
        .map((category) => (
          <section key={category.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {categoryNavKey(category.slug) ? tNav(categoryNavKey(category.slug)!) : category.name}
              </h2>
              <Link href={`/c/${category.slug}`} className="text-sm text-violet-400 hover:text-violet-300">
                {t('viewAll')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((p) => (
                <ProductCard key={p.slug} product={toCardData(p, visitor.currency, rates, locale)} />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
