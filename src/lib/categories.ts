// Category display names come from nav translations when the slug is one of
// the four standard sections; custom categories fall back to their DB name.
export const CATEGORY_NAV_KEYS = {
  'new-releases': 'newReleases',
  'pre-orders': 'preOrders',
  subscriptions: 'subscriptions',
  'gift-cards': 'giftCards',
} as const

export function categoryNavKey(slug: string) {
  return (CATEGORY_NAV_KEYS as Record<string, string>)[slug] as
    | (typeof CATEGORY_NAV_KEYS)[keyof typeof CATEGORY_NAV_KEYS]
    | undefined
}
