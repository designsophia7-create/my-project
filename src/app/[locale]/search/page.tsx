import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getRates } from '@/lib/currency'
import { getVisitor } from '@/lib/visitor'
import { ProductCard, toCardData } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const [{ locale }, { q }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)
  const query = (q ?? '').trim().slice(0, 100)

  const [products, rates, visitor, t] = await Promise.all([
    query
      ? prisma.product.findMany({
          where: {
            isActive: true,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 24,
          select: {
            slug: true,
            title: true,
            platform: true,
            regionLock: true,
            basePriceUsd: true,
            compareAtPriceUsd: true,
            releaseDate: true,
          },
        })
      : Promise.resolve([]),
    getRates(),
    getVisitor(),
    getTranslations('search'),
  ])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">{t('title', { query })}</h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">{t('none', { query })}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={toCardData(p, visitor.currency, rates, locale)} />
          ))}
        </div>
      )}
    </div>
  )
}
