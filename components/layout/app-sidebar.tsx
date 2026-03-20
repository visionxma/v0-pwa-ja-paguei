'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { logout } from '@/app/auth/actions'
import {
  LayoutDashboard,
  Receipt,
  Users,
  UserPlus,
  History,
  User,
  Settings,
  LogOut,
  DollarSign,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Despesas', icon: Receipt },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/friends', label: 'Amigos', icon: UserPlus },
  { href: '/history', label: 'Historico', icon: History },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/settings', label: 'Configuracoes', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email || ''

  return (
    <aside className="hidden md:flex md:flex-col md:w-[260px] bg-sidebar text-sidebar-foreground relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.05] pointer-events-none" />

      {/* Logo */}
      <div className="relative px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-500">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-[17px] text-sidebar-foreground tracking-tight">Ja Paguei</span>
            <p className="text-[11px] text-sidebar-foreground/35 font-medium tracking-wide">DIVISOR DE DESPESAS</p>
          </div>
        </Link>
      </div>

      <div className="mx-5 h-px bg-sidebar-border/50" />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto ios-scroll">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${index * 35}ms` }}
              className={`ios-slide-left flex items-center gap-3 px-3 py-[10px] rounded-[12px] text-[14px] font-medium transition-all duration-300 relative ios-press ${
                isActive
                  ? 'bg-gradient-to-r from-primary/90 to-primary/75 text-white shadow-lg shadow-primary/20'
                  : 'text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/60" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mx-5 h-px bg-sidebar-border/50" />

      {/* User */}
      <div className="relative p-4">
        <div className="flex items-center gap-3 p-2.5 rounded-[14px] bg-sidebar-accent/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-semibold text-[13px] shrink-0 shadow-md shadow-primary/15">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">{displayName}</p>
            <p className="text-[11px] text-sidebar-foreground/35 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2.5 w-full mt-2 px-3 py-2 rounded-[12px] text-[13px] text-sidebar-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 ios-press"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
