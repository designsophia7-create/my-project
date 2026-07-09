import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getRates } from '@/lib/currency'
import { getVisitor } from '@/lib/visitor'
import { ProductCard, toCardData } from '@/components/ProductCard'
import { categoryNavKey } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [category, rates, visitor, t] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
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
  ])
  if (!category) notFound()
  const tNav = await getTranslations('nav')
  const navKey = categoryNavKey(category.slug)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">{navKey ? tNav(navKey) : category.name}</h1>
      {category.products.length === 0 ? (
        <p className="text-zinc-500">{t('emptyCategory')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {category.products.map((p) => (
            <ProductCard key={p.slug} product={toCardData(p, visitor.currency, rates, locale)} />
          ))}
        </div>
      )}
    </div>
  )
}
