import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const categories = await prisma.category.findMany({
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
  })

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-r from-violet-950 via-zinc-900 to-emerald-950 p-10 ring-1 ring-zinc-800">
        <h1 className="max-w-2xl text-4xl font-black leading-tight text-white">
          Digital game keys, delivered <span className="text-violet-400">the second you pay</span>.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Unbeatable Xbox Series prices, gift cards, and subscriptions — shipped instantly to your
          inbox, anywhere in the world.
        </p>
      </section>

      {categories
        .filter((c) => c.products.length > 0)
        .map((category) => (
          <section key={category.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{category.name}</h2>
              <Link href={`/c/${category.slug}`} className="text-sm text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={{ ...p, basePriceUsd: p.basePriceUsd.toString(), compareAtPriceUsd: p.compareAtPriceUsd?.toString() ?? null }}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
