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
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {statItems.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="ios-card ios-card-hover p-3 sm:p-5 group">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.06em] leading-tight">{stat.label}</p>
                <p className="text-[15px] sm:text-[22px] font-bold text-foreground tracking-tight leading-none">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[14px] flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
