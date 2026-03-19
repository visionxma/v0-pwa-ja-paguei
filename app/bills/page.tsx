'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Receipt, Calendar, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function BillsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadBills() {
      if (!user) return
      
      const query = supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query.eq('status', 'pendente')
      } else if (filter === 'paid') {
        query.eq('status', 'pago')
      }

      const { data } = await query
      setBills(data || [])
      setLoading(false)
    }

    loadBills()
  }, [user, supabase, filter])

  return (
    <AppShell title="Despesas" subtitle="Gerencie suas contas e pagamentos">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
            >
              Pendentes
            </Button>
            <Button
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
              size="sm"
            >
              Pagas
            </Button>
          </div>
          <Link href="/bills/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </Link>
        </div>

        {/* Bills list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma despesa encontrada</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {filter !== 'all' 
                  ? 'Não há despesas com esse filtro. Tente outro filtro ou crie uma nova despesa.'
                  : 'Comece registrando sua primeira despesa para acompanhar seus gastos.'}
              </p>
              <Link href="/bills/new">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeira despesa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vencimento</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-medium text-foreground">{bill.description}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground capitalize">{bill.category || 'Geral'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {bill.due_date ? new Date(bill.due_date).toLocaleDateString('pt-BR') : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-foreground">
                            R$ {Number(bill.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
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
                        <td className="py-4 px-4 text-center">
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
