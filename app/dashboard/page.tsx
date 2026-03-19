'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentBills } from '@/components/dashboard/recent-bills'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingPayments: 0,
    totalGroupsParticipating: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-red-700 rounded-lg p-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo!</h1>
            <p className="text-red-100">
              Aqui você gerencia suas despesas e divide contas com amigos
            </p>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Stats */}
          <DashboardStats stats={stats} />

          {/* Recent Bills */}
          <RecentBills />

          {/* Empty State Help */}
          <Card className="p-6 text-center border-dashed border-2">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece a usar criando uma nova despesa ou grupo
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button className="bg-primary hover:bg-red-700">
                Nova Despesa
              </Button>
              <Button variant="outline">
                Criar Grupo
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
