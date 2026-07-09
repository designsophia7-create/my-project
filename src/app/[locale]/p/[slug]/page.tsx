import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getRates, displayPrice } from '@/lib/currency'
import { getVisitor } from '@/lib/visitor'
import { keyWorksIn, countryName } from '@/lib/region'
import { RegionBadge } from '@/components/RegionBadge'
import { Countdown } from '@/components/Countdown'
import { categoryNavKey } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [product, rates, visitor, t] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { keys: { where: { status: 'AVAILABLE' } } } },
      },
    }),
    getRates(),
    getVisitor(),
    getTranslations('product'),
  ])
  if (!product || !product.isActive) notFound()

  const inStock = product._count.keys > 0
  const isPreorder = product.productType === 'PREORDER'
  const upcoming = product.releaseDate && product.releaseDate > new Date()
  const works = keyWorksIn(product.regionLock, visitor.country)
  const visitorCountry = countryName(visitor.country, locale)
  const tNav = await getTranslations('nav')
  const navKey = categoryNavKey(product.category.slug)

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-950 via-zinc-900 to-emerald-950 ring-1 ring-zinc-800">
        <span className="px-6 text-center text-2xl font-bold text-zinc-300 opacity-70">
          {product.title.split('—')[0].trim()}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-violet-400">{navKey ? tNav(navKey) : product.category.name}</p>
        <h1 className="text-2xl font-bold text-white">{product.title}</h1>
        <div className="flex items-center gap-3">
          <RegionBadge region={product.regionLock} />
          {isPreorder && (
            <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/30">
              {t('preorder')}
            </span>
          )}
        </div>

        {works ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            ✓ {t('regionOk', { country: visitorCountry })}
          </div>
        ) : (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm font-medium text-red-300">
            ⚠ {t('regionBlocked', { country: visitorCountry })}
          </div>
        )}

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">
            {displayPrice(product.basePriceUsd.toString(), visitor.currency, rates, locale)}
          </span>
          {product.compareAtPriceUsd && (
            <span className="text-lg text-zinc-500 line-through">
              {displayPrice(product.compareAtPriceUsd.toString(), visitor.currency, rates, locale)}
            </span>
          )}
        </div>

        {upcoming && <Countdown targetIso={product.releaseDate!.toISOString()} />}
        {upcoming && (
          <p className="text-sm font-medium text-violet-400">
            {t('releasesOn', {
              date: product.releaseDate!.toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
            })}
          </p>
        )}

        <p className="text-sm leading-relaxed text-zinc-400">{product.description}</p>

        <button
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-zinc-700 py-3 font-semibold text-zinc-400"
        >
          {isPreorder ? t('preorderSoon') : inStock ? t('buyNow') : t('outOfStock')}
        </button>
        <p className="text-xs text-zinc-600">
          {isPreorder ? t('preorderStock') : t('inStock', { count: product._count.keys })}
        </p>
      </div>
    </div>
  )
}
