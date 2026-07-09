'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

function remaining(target: number) {
  const total = Math.max(0, target - Date.now())
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1000) % 60,
  }
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const t = useTranslations('product')
  const target = new Date(targetIso).getTime()
  // Render nothing until mounted so server and client HTML match.
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null)

  useEffect(() => {
    const tick = () => setTime(remaining(target))
    const raf = requestAnimationFrame(tick)
    const id = setInterval(tick, 1000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(id)
    }
  }, [target])

  if (!time) return <div className="h-[76px]" aria-hidden />

  const units = [
    [time.days, t('days')],
    [time.hours, t('hours')],
    [time.minutes, t('minutes')],
    [time.seconds, t('seconds')],
  ] as const

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-400">
        {t('countdown')}
      </p>
      <div className="flex gap-2">
        {units.map(([value, label]) => (
          <div
            key={label}
            className="flex w-16 flex-col items-center rounded-lg border border-violet-500/30 bg-violet-500/10 py-2"
          >
            <span className="text-xl font-black tabular-nums text-white">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
