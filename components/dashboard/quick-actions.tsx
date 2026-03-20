'use client'

import Link from 'next/link'
import { Receipt, Users, UserPlus, List } from 'lucide-react'

const actions = [
  { href: '/bills/new', label: 'Nova Despesa', icon: Receipt, bg: 'bg-primary/8', color: 'text-primary' },
  { href: '/groups/new', label: 'Criar Grupo', icon: Users, bg: 'bg-emerald-500/8', color: 'text-emerald-600 dark:text-emerald-400' },
  { href: '/friends', label: 'Adicionar Amigo', icon: UserPlus, bg: 'bg-violet-500/8', color: 'text-violet-600 dark:text-violet-400' },
  { href: '/bills', label: 'Ver Despesas', icon: List, bg: 'bg-amber-500/8', color: 'text-amber-600 dark:text-amber-400' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <div className="ios-card ios-card-hover p-4 cursor-pointer ios-press">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${action.bg} ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[12px] sm:text-[13px] font-semibold text-foreground leading-tight">
                  {action.label}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
