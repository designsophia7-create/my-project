import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RegionBadge } from '@/components/RegionBadge'
import { formatPriceUsd } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { keys: { where: { status: 'AVAILABLE' } } } },
    },
  })
  if (!product || !product.isActive) notFound()

  const inStock = product._count.keys > 0
  const isPreorder = product.productType === 'PREORDER'

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
      <div className="flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-950 via-zinc-900 to-emerald-950 ring-1 ring-zinc-800">
        <span className="px-6 text-center text-2xl font-bold text-zinc-300 opacity-70">
          {product.title.split('—')[0].trim()}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-violet-400">{product.category.name}</p>
        <h1 className="text-2xl font-bold text-white">{product.title}</h1>
        <div className="flex items-center gap-3">
          <RegionBadge region={product.regionLock} />
          {isPreorder && (
            <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/30">
              PRE-ORDER
            </span>
          )}
        </div>

        {product.regionLock !== 'GLOBAL' && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            ⚠ This key activates only in the region shown above. Automatic checks against your
            location arrive in Phase 2 — make sure your account region matches before buying.
          </div>
        )}

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">{formatPriceUsd(product.basePriceUsd.toString())}</span>
          {product.compareAtPriceUsd && (
            <span className="text-lg text-zinc-500 line-through">
              {formatPriceUsd(product.compareAtPriceUsd.toString())}
            </span>
          )}
        </div>

        {product.releaseDate && product.releaseDate > new Date() && (
          <p className="text-sm font-medium text-violet-400">
            Releases{' '}
            {product.releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{' '}
            — key delivered automatically at launch.
          </p>
        )}

        <p className="text-sm leading-relaxed text-zinc-400">{product.description}</p>

        <button
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-zinc-700 py-3 font-semibold text-zinc-400"
          title="Checkout launches in Phase 3"
        >
          {isPreorder ? 'Pre-order — coming soon' : inStock ? 'Buy now — coming soon' : 'Out of stock'}
        </button>
        <p className="text-xs text-zinc-600">
          {isPreorder
            ? 'Pre-order fulfillment is stocked at launch.'
            : `${product._count.keys} key(s) in stock · instant email delivery after payment`}
        </p>
      </div>
    </div>
  )
}
