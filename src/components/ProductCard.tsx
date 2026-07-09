import Link from 'next/link'
import { RegionBadge } from './RegionBadge'
import { formatPriceUsd } from '@/lib/format'
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
  basePriceUsd: string
  compareAtPriceUsd: string | null
  releaseDate: Date | null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.compareAtPriceUsd &&
    Math.round((1 - Number(product.basePriceUsd) / Number(product.compareAtPriceUsd)) * 100)

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-violet-500/50 hover:bg-zinc-900"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-violet-950 via-zinc-900 to-emerald-950">
        <span className="px-4 text-center text-lg font-bold text-zinc-300 opacity-60 transition group-hover:opacity-90">
          {product.title.split('—')[0].trim()}
        </span>
        {discount ? (
          <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-zinc-950">
            -{discount}%
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-zinc-100">{product.title}</h3>
        </div>
        <p className="text-xs text-zinc-500">{PLATFORM_LABELS[product.platform]}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{formatPriceUsd(product.basePriceUsd)}</span>
            {product.compareAtPriceUsd && (
              <span className="text-xs text-zinc-500 line-through">
                {formatPriceUsd(product.compareAtPriceUsd)}
              </span>
            )}
          </div>
          <RegionBadge region={product.regionLock} />
        </div>
        {product.releaseDate && product.releaseDate > new Date() && (
          <p className="text-xs font-medium text-violet-400">
            Releases {product.releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    </Link>
  )
}
