'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { Receipt, Users, TrendingUp, Clock, Plus, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalBills: 0,
    pendingBills: 0,
    totalGroups: 0,
    totalFriends: 0,
  })
  const [recentBills, setRecentBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      
      try {
        // Load bills count
        const { count: billsCount } = await supabase
          .from('bills')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Load pending bills count
        const { count: pendingCount } = await supabase
          .from('bills')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'pendente')

        // Load groups count
        const { count: groupsCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Load friends count
        const { count: friendsCount } = await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted')

        // Load recent bills
        const { data: bills } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalBills: billsCount || 0,
          pendingBills: pendingCount || 0,
          totalGroups: groupsCount || 0,
          totalFriends: friendsCount || 0,
        })
        setRecentBills(bills || [])
      } catch (error) {
        console.log('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  const statCards = [
    { label: 'Total de Despesas', value: stats.totalBills, icon: Receipt, color: 'text-primary' },
    { label: 'Pendentes', value: stats.pendingBills, icon: Clock, color: 'text-amber-500' },
    { label: 'Meus Grupos', value: stats.totalGroups, icon: Users, color: 'text-blue-500' },
    { label: 'Amigos', value: stats.totalFriends, icon: TrendingUp, color: 'text-green-500' },
  ]

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {loading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/bills/new">
            <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary-foreground/20 rounded-full">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Nova Despesa</h3>
                  <p className="text-primary-foreground/80 text-sm">Registre uma conta</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/groups/new">
            <Card className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-secondary-foreground/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Novo Grupo</h3>
                  <p className="text-secondary-foreground/80 text-sm">Crie um grupo</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/friends">
            <Card className="bg-card hover:bg-muted transition-colors cursor-pointer h-full border-2 border-dashed">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-muted rounded-full text-muted-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Adicionar Amigo</h3>
                  <p className="text-muted-foreground text-sm">Convide amigos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Bills Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Despesas Recentes</CardTitle>
              <CardDescription>Suas últimas despesas registradas</CardDescription>
            </div>
            <Link href="/bills">
              <Button variant="ghost" size="sm" className="gap-2">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentBills.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma despesa registrada ainda</p>
                <Link href="/bills/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira despesa
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vencimento</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">{bill.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-muted-foreground capitalize">{bill.category || 'Geral'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {bill.due_date ? new Date(bill.due_date).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-foreground">
                            R$ {Number(bill.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bill.status === 'pago' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : bill.status === 'vencido'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {bill.status === 'pago' ? 'Pago' : bill.status === 'vencido' ? 'Vencido' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
