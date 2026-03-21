'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { logoutClient } from '@/lib/supabase/auth-client'
import { useState } from 'react'
import { DollarSign, LogOut, User, Settings, Menu, X, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  Users,
  UserPlus,
  History,
} from 'lucide-react'
import { SyncIndicator } from '@/components/sync-indicator'

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Despesas', icon: Receipt },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/friends', label: 'Amigos', icon: UserPlus },
  { href: '/history', label: 'Histórico', icon: History },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function AppHeader() {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <>
      <header className="sticky top-0 z-40 ios-glass-thick border-b border-border/40">
        <div className="px-4 md:px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl hover:bg-foreground/5 transition-colors ios-press"
            >
              <Menu className="w-[22px] h-[22px] text-foreground" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[16px] text-foreground">Já Paguei</span>
            </Link>

            <span className="hidden md:block text-[14px] text-muted-foreground">
              Bem-vindo, <span className="font-semibold text-foreground">{displayName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SyncIndicator />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-semibold text-[12px] shadow-md shadow-primary/15 hover:shadow-primary/30 transition-all duration-500 ios-press"
              >
                {displayName.charAt(0).toUpperCase()}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2.5 w-56 ios-glass-thick rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-border/30 py-1.5 z-50 ios-scale-in overflow-hidden">
                    <div className="px-4 py-2.5 mb-1">
                      <p className="text-[14px] font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="mx-3 h-px bg-border/50" />
                    <Link
                      href="/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 mx-1.5 mt-1.5 px-3 py-2 text-[14px] text-foreground hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">Meu Perfil</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 mx-1.5 px-3 py-2 text-[14px] text-foreground hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">Configurações</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                    </Link>
                    <div className="mx-3 my-1.5 h-px bg-border/50" />
                    <button
                      onClick={() => logoutClient().then(() => { window.location.href = '/auth/login' })}
                      className="flex items-center gap-3 mx-1.5 mb-1 px-3 py-2 text-[14px] text-destructive hover:bg-destructive/5 rounded-xl transition-colors w-[calc(100%-12px)]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 md:hidden ios-fade-in"
            style={{ animationDuration: '0.3s' }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-sidebar text-sidebar-foreground z-50 md:hidden flex flex-col shadow-2xl shadow-black/30 ios-slide-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.05] pointer-events-none" />

            <div className="relative px-5 pt-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-[16px] text-sidebar-foreground">Já Paguei</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors ios-press"
              >
                <X className="w-5 h-5 text-sidebar-foreground/50" />
              </button>
            </div>

            <div className="mx-5 h-px bg-sidebar-border/50" />

            <nav className="relative flex-1 py-3 px-3 space-y-0.5 overflow-y-auto ios-scroll ios-stagger">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-[10px] rounded-[12px] text-[14px] font-medium transition-all duration-300 ios-press ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/90 to-primary/75 text-white shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                  </Link>
                )
              })}
            </nav>

            <div className="mx-5 h-px bg-sidebar-border/50" />

            <div className="relative p-4">
              <div className="flex items-center gap-3 p-2.5 rounded-[14px] bg-sidebar-accent/40">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-semibold text-[12px] shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{displayName}</p>
                  <p className="text-[11px] text-sidebar-foreground/35 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => logoutClient().then(() => { window.location.href = '/auth/login' })}
                className="flex items-center gap-2.5 w-full mt-2 px-3 py-2 rounded-[12px] text-[13px] text-sidebar-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 ios-press"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
