import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'My account' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, createdAt: true },
  })

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-white">My account</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm">
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Email</dt>
            <dd className="text-zinc-200">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Name</dt>
            <dd className="text-zinc-200">{user?.name ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Member since</dt>
            <dd className="text-zinc-200">{user?.createdAt.toLocaleDateString('en-US')}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-500">
        Your orders and game keys will appear here once checkout goes live (Phase 3).
      </div>
    </div>
  )
}
