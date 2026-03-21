'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inbox, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fetchRecentBills } from '@/lib/supabase/database'

export function RecentBills() {
  const { user } = useAuth()
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchRecentBills(user.id, 5)
      .then(setBills)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="ios-card p-7 text-center">
        <div className="flex gap-1 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (bills.length === 0) {
    return (
      <div className="ios-card p-7 text-center">
        <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold text-[15px] mb-0.5">Nenhuma despesa recente</p>
        <p className="text-[13px] text-muted-foreground">Crie sua primeira despesa para começar</p>
      </div>
    )
  }

  return (
    <div className="ios-card overflow-hidden">
      <div className="px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">Despesas Recentes</h2>
        <Link href="/bills" className="text-primary text-[13px] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
          Ver Tudo
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div>
        {bills.map((bill) => (
          <div key={bill.id} className="ios-group-item hover:bg-muted/30 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-[14px] text-foreground">{bill.description}</p>
              <p className="text-[12px] text-muted-foreground">
                {bill.groups?.name || 'Pessoal'}
                {bill.due_date && ` • ${new Date(bill.due_date).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[14px] text-foreground">R$ {Number(bill.amount).toFixed(2)}</p>
              <span className={`text-[11px] font-semibold ${bill.status === 'pago' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {bill.status === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
