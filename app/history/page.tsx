'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuth } from '@/hooks/use-auth'
import { fetchHistory } from '@/lib/supabase/database'
import { History, Loader2 } from 'lucide-react'

type FilterType = 'all' | 'paid' | 'pending'

const tabs: { label: string; value: FilterType }[] = [
  { label: 'Tudo', value: 'all' },
  { label: 'Pago', value: 'paid' },
  { label: 'Pendente', value: 'pending' },
]

export default function HistoryPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<FilterType>('all')
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchHistory(user.id, filter)
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, filter])

  return (
    <AppLayout>
      <div className="space-y-5 ios-stagger">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Historico</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Todas as suas transacoes</p>
        </div>

        {/* iOS Segmented Control */}
        <div className="ios-card p-1 flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 py-2 rounded-[12px] text-[13px] font-semibold transition-all duration-300 ios-press ${
                filter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ios-card p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="ios-card p-10 text-center ios-card-hover">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[16px] font-semibold text-foreground mb-1">Nenhuma transacao</p>
            <p className="text-[13px] text-muted-foreground">
              {filter === 'all'
                ? 'Suas transacoes aparecerao aqui'
                : filter === 'paid'
                ? 'Nenhuma despesa paga'
                : 'Nenhuma despesa pendente'}
            </p>
          </div>
        ) : (
          <div className="ios-group">
            {transactions.map((tx) => (
              <div key={tx.id} className="ios-group-item ios-press hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-[14px] ${tx.status === 'pago' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {tx.description}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {tx.groups?.name || 'Pessoal'}
                    {tx.due_date && ` • ${new Date(tx.due_date).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-[14px] ${tx.status === 'pago' ? 'text-emerald-600' : 'text-foreground'}`}>
                    R$ {Number(tx.amount).toFixed(2)}
                  </p>
                  <span className={`text-[11px] font-semibold ${tx.status === 'pago' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
