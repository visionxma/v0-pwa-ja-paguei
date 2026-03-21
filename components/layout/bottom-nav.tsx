'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Users, UserPlus, Plus } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/bills', label: 'Despesas', icon: Receipt },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/friends', label: 'Amigos', icon: UserPlus },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30">
      <div className="ios-glass-thick border-t border-border/30">
        <div className="h-[52px] flex items-center justify-around px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-300 ios-press ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-primary/8" />
                )}
                <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                  <Icon
                    className={`w-[22px] h-[22px] transition-all duration-300 ${
                      isActive ? 'stroke-[2.2]' : 'stroke-[1.5]'
                    }`}
                  />
                </div>
                <span
                  className={`relative text-[10px] mt-0.5 transition-all duration-300 ${
                    isActive ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
        {/* Bottom safe area */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>

      {/* FAB — positioned above bottom nav + safe area */}
      <Link
        href="/bills/new"
        aria-label="Nova despesa"
        className="fixed right-5 w-[52px] h-[52px] bg-gradient-to-br from-primary to-primary/75 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 transition-all duration-500 ios-press glow-pulse z-30"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-6 h-6" />
      </Link>
    </nav>
  )
}
