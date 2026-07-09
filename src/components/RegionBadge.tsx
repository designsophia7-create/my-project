import type { RegionLock } from '@/generated/prisma/enums'

const REGION_STYLES: Record<RegionLock, { label: string; classes: string }> = {
  GLOBAL: { label: 'GLOBAL', classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' },
  US: { label: 'US ONLY', classes: 'bg-red-500/15 text-red-400 ring-red-500/30' },
  EU: { label: 'EU ONLY', classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' },
  UK: { label: 'UK ONLY', classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' },
  ROW: { label: 'REST OF WORLD', classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' },
}

export function RegionBadge({ region }: { region: RegionLock }) {
  const { label, classes } = REGION_STYLES[region]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${classes}`}>
      {label}
    </span>
  )
}
