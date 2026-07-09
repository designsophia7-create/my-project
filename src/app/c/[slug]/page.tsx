import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({
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
  })
  if (!category) notFound()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">{category.name}</h1>
      {category.products.length === 0 ? (
        <p className="text-zinc-500">No products in this category yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {category.products.map((p) => (
            <ProductCard
              key={p.slug}
              product={{ ...p, basePriceUsd: p.basePriceUsd.toString(), compareAtPriceUsd: p.compareAtPriceUsd?.toString() ?? null }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
