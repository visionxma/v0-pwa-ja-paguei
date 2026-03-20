'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentBills } from '@/components/dashboard/recent-bills'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useAuth } from '@/hooks/use-auth'
import { fetchDashboardStats } from '@/lib/supabase/database'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DarkVeil from '@/components/effects/DarkVeil/DarkVeil'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingPayments: 0,
    totalGroupsParticipating: 0,
  })

  useEffect(() => {
    if (!user) return
    fetchDashboardStats(user.id)
      .then(setStats)
      .catch(console.error)
  }, [user])

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <AppLayout>
      <div className="space-y-5 ios-stagger">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/85 to-primary/60 rounded-[24px] p-6 md:p-7 text-white shadow-xl shadow-primary/20 transform-gpu translate-z-0">
          <div className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay opacity-[0.85]">
            <DarkVeil
              hueShift={0}
              noiseIntensity={0.08}
              scanlineIntensity={0.25}
              speed={0.6}
              scanlineFrequency={0.02}
              warpAmount={0.8}
              resolutionScale={1}
            />
          </div>

          <div className="relative z-10">
            {/* Decorative (Preservando as originais que funcionam bem em mobile) */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/8 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute top-6 right-24 w-2 h-2 rounded-full bg-white/20 float-gentle pointer-events-none" />
            <div
              className="absolute bottom-10 right-16 w-1.5 h-1.5 rounded-full bg-white/10 float-gentle pointer-events-none"
              style={{ animationDelay: '1.5s' }}
            />

            <div className="relative">
              {/* Badge SUA CONTA coeso e igual ao desktop */}
              <div className="inline-flex items-center justify-center px-4 py-1.5 mb-3 rounded-[12px] md:rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                  SUA CONTA
                </span>
              </div>
              
              <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight leading-none mb-2 drop-shadow-sm">
                Ola, {displayName}
              </h1>
              <p className="text-white/85 text-[13.5px] md:text-[14px] max-w-sm leading-relaxed drop-shadow-sm">
                Gerencie despesas e divida contas com amigos.
              </p>
            </div>
          </div>
        </div>

        <QuickActions />
        <DashboardStats stats={stats} />
        <RecentBills />

        {/* CTA */}
        <div className="ios-card p-6 text-center ios-card-hover">
          <p className="text-muted-foreground text-[14px] mb-4">
            Comece criando uma nova despesa ou grupo
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/bills/new">
              <Button className="bg-gradient-to-r from-primary to-primary/85 text-white shadow-lg shadow-primary/20 rounded-[14px] h-10 px-5 text-[14px] font-semibold gap-2 ios-press hover:shadow-xl hover:shadow-primary/30 transition-all duration-500">
                Nova Despesa
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/groups/new">
              <Button variant="outline" className="rounded-[14px] h-10 px-5 text-[14px] font-medium ios-press hover:bg-muted/50 transition-all duration-300">
                Criar Grupo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
