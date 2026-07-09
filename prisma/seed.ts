import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { encryptKey } from '../src/lib/keyvault'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

function demoKey(): string {
  const block = () =>
    Array.from({ length: 5 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')
  return `${block()}-${block()}-${block()}-${block()}-${block()}`
}

async function main() {
  const categories = await Promise.all(
    [
      { slug: 'new-releases', name: 'New Releases', type: 'NEW_RELEASE', sortOrder: 1 },
      { slug: 'pre-orders', name: 'Pre-Orders', type: 'PREORDER', sortOrder: 2 },
      { slug: 'subscriptions', name: 'Subscriptions', type: 'SUBSCRIPTION', sortOrder: 3 },
      { slug: 'gift-cards', name: 'Gift Cards', type: 'GIFT_CARD', sortOrder: 4 },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c as never,
      }),
    ),
  )
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  const products = [
    {
      categoryId: bySlug['new-releases'],
      slug: 'starfall-odyssey-xbox',
      title: 'Starfall Odyssey — Xbox Series X|S',
      description: 'Explore a hand-crafted galaxy in the year’s biggest open-world RPG.',
      platform: 'XBOX_SERIES',
      productType: 'GAME',
      regionLock: 'GLOBAL',
      basePriceUsd: '39.99',
      compareAtPriceUsd: '69.99',
      metadata: { genre: 'RPG', publisher: 'Nova Interactive' },
    },
    {
      categoryId: bySlug['new-releases'],
      slug: 'apex-velocity-xbox',
      title: 'Apex Velocity — Xbox Series X|S',
      description: 'Next-gen street racing with full ray tracing at 120 fps.',
      platform: 'XBOX_SERIES',
      productType: 'GAME',
      regionLock: 'US',
      basePriceUsd: '29.99',
      compareAtPriceUsd: '59.99',
      metadata: { genre: 'Racing', publisher: 'Redline Studios' },
    },
    {
      categoryId: bySlug['new-releases'],
      slug: 'iron-legion-xbox',
      title: 'Iron Legion — Xbox Series X|S',
      description: 'Squad-based tactical shooter. Includes Season 1 battle pass.',
      platform: 'XBOX_SERIES',
      productType: 'GAME',
      regionLock: 'EU',
      basePriceUsd: '34.99',
      compareAtPriceUsd: '69.99',
      metadata: { genre: 'Shooter', publisher: 'Bastion Games' },
    },
    {
      categoryId: bySlug['pre-orders'],
      slug: 'chronoshift-preorder-xbox',
      title: 'ChronoShift (Pre-Order) — Xbox Series X|S',
      description: 'Pre-order the time-bending action epic. Key delivered at global launch.',
      platform: 'XBOX_SERIES',
      productType: 'PREORDER',
      regionLock: 'GLOBAL',
      basePriceUsd: '54.99',
      compareAtPriceUsd: '69.99',
      releaseDate: new Date(Date.now() + 45 * 24 * 3600 * 1000),
      metadata: { genre: 'Action', publisher: 'Paradox Forge' },
    },
    {
      categoryId: bySlug['subscriptions'],
      slug: 'game-pass-ultimate-3m',
      title: 'Xbox Game Pass Ultimate — 3 Months',
      description: 'Hundreds of games on console, PC, and cloud. Digital code.',
      platform: 'MULTI',
      productType: 'SUBSCRIPTION',
      regionLock: 'GLOBAL',
      basePriceUsd: '32.99',
      compareAtPriceUsd: '44.99',
      metadata: { duration: '3 months' },
    },
    {
      categoryId: bySlug['gift-cards'],
      slug: 'xbox-gift-card-50',
      title: 'Xbox Gift Card — $50 (US)',
      description: 'Redeemable on US Microsoft Store accounts only.',
      platform: 'MULTI',
      productType: 'GIFT_CARD',
      regionLock: 'US',
      basePriceUsd: '46.99',
      compareAtPriceUsd: '50.00',
      metadata: { value: '$50' },
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as never,
    })
    const existing = await prisma.digitalKey.count({ where: { productId: product.id } })
    if (existing === 0 && p.productType !== 'PREORDER') {
      await prisma.digitalKey.createMany({
        data: Array.from({ length: 5 }, () => ({
          productId: product.id,
          encryptedKey: encryptKey(demoKey()),
        })),
      })
    }
  }

  console.log('Seed complete:', await prisma.product.count(), 'products,', await prisma.digitalKey.count(), 'keys in vault')
}

main().finally(() => prisma.$disconnect())
