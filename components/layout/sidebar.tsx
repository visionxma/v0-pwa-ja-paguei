'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  UserPlus, 
  Settings, 
  History,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/auth/actions'
import { useState } from 'react'

interface SidebarProps {
  user?: {
    email?: string
    display_name?: string
  } | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bills', label: 'Despesas', icon: Receipt },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/friends', label: 'Amigos', icon: UserPlus },
  { href: '/history', label: 'Histórico', icon: History },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">JP</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg text-sidebar-foreground truncate">Já Paguei</span>
              <span className="text-xs text-sidebar-foreground/60">Divisor de Despesas</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent",
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-full flex-shrink-0">
              <span className="text-primary font-semibold text-sm">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
                <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</span>
              </div>
            )}
          </div>
          
          <form action={logout} className="mt-4">
            <Button 
              type="submit"
              variant="ghost" 
              className={cn(
                "w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && <span>Sair</span>}
            </Button>
          </form>
        </div>

        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 bg-sidebar border border-sidebar-border rounded-full text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  )
}
