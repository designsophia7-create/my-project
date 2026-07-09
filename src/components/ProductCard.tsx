import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { RegionBadge } from './RegionBadge'
import { displayPrice, type Currency } from '@/lib/currency'
import type { RegionLock, Platform } from '@/generated/prisma/enums'

const PLATFORM_LABELS: Record<Platform, string> = {
  XBOX_SERIES: 'Xbox Series X|S',
  XBOX_ONE: 'Xbox One',
  PC: 'PC',
  PSN: 'PlayStation',
  NINTENDO: 'Nintendo',
  MULTI: 'Multi-platform',
}

export type ProductCardData = {
  slug: string
  title: string
  platform: Platform
  regionLock: RegionLock
  price: string
  compareAt: string | null
  discountPct: number | null
  releaseDate: Date | null
  locale: string
}

type RawProduct = {
  slug: string
  title: string
  platform: Platform
  regionLock: RegionLock
  basePriceUsd: { toString(): string }
  compareAtPriceUsd: { toString(): string } | null
  releaseDate: Date | null
}

export function toCardData(
  p: RawProduct,
  currency: Currency,
  rates: Record<Currency, number>,
  locale: string,
): ProductCardData {
  const base = Number(p.basePriceUsd.toString())
  const compare = p.compareAtPriceUsd ? Number(p.compareAtPriceUsd.toString()) : null
  return {
    slug: p.slug,
    title: p.title,
    platform: p.platform,
    regionLock: p.regionLock,
    price: displayPrice(base, currency, rates, locale),
    compareAt: compare ? displayPrice(compare, currency, rates, locale) : null,
    discountPct: compare ? Math.round((1 - base / compare) * 100) : null,
    releaseDate: p.releaseDate,
    locale,
  }
}

export async function ProductCard({ product }: { product: ProductCardData }) {
  const t = await getTranslations('common')
  const upcoming = product.releaseDate && product.releaseDate > new Date()

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-violet-500/50 hover:bg-zinc-900"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-violet-950 via-zinc-900 to-emerald-950">
        <span className="px-4 text-center text-lg font-bold text-zinc-300 opacity-60 transition group-hover:opacity-90">
          {product.title.split('—')[0].trim()}
        </span>
        {product.discountPct ? (
          <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-zinc-950">
            -{product.discountPct}%
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">{product.title}</h3>
        <p className="text-xs text-zinc-500">{PLATFORM_LABELS[product.platform]}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{product.price}</span>
            {product.compareAt && (
              <span className="text-xs text-zinc-500 line-through">{product.compareAt}</span>
            )}
          </div>
          <RegionBadge region={product.regionLock} />
        </div>
        {upcoming && (
          <p className="text-xs font-medium text-violet-400">
            {t('releases', {
              date: product.releaseDate!.toLocaleDateString(product.locale, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            })}
          </p>
        )}
      </div>
    </Link>
  )
}
