'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function QuickActions() {
  const actions = [
    {
      href: '/bills/new',
      label: 'Nova Despesa',
      icon: '💸',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    },
    {
      href: '/groups/new',
      label: 'Criar Grupo',
      icon: '👥',
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    },
    {
      href: '/friends',
      label: 'Adicionar Amigo',
      icon: '👫',
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    },
    {
      href: '/bills',
      label: 'Ver Todas as Despesas',
      icon: '📋',
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="h-full p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {action.label}
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
