'use client'

import { Card } from '@/components/ui/card'

interface DashboardStatsProps {
  stats: {
    totalExpenses: number
    pendingPayments: number
    totalGroupsParticipating: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      label: 'Total de Despesas',
      value: `R$ ${stats.totalExpenses.toFixed(2)}`,
      icon: '💰',
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-300',
    },
    {
      label: 'Pendente',
      value: `R$ ${stats.pendingPayments.toFixed(2)}`,
      icon: '⏳',
      color: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-300',
    },
    {
      label: 'Grupos',
      value: stats.totalGroupsParticipating,
      icon: '👥',
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
