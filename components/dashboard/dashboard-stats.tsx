'use client'

import { DollarSign, Clock, Users } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalExpenses: number
    pendingPayments: number
    totalGroupsParticipating: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    { label: 'Total Despesas', value: `R$ ${stats.totalExpenses.toFixed(2)}`, icon: DollarSign, bg: 'bg-primary/8', color: 'text-primary' },
    { label: 'Pendente', value: `R$ ${stats.pendingPayments.toFixed(2)}`, icon: Clock, bg: 'bg-amber-500/8', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Grupos', value: String(stats.totalGroupsParticipating), icon: Users, bg: 'bg-blue-500/8', color: 'text-blue-600 dark:text-blue-400' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {statItems.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="ios-card ios-card-hover p-5 group">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.08em]">{stat.label}</p>
                <p className="text-[22px] font-bold text-foreground tracking-tight leading-none">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
