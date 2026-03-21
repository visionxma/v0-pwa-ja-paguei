'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { BottomNav } from './bottom-nav'
import { DollarSign } from 'lucide-react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="app-root flex flex-col items-center justify-center bg-background gap-5">
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/20 glow-pulse">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="app-root bg-background">
      <div className="flex flex-1 min-h-0">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />

          <main
            className="flex-1 overflow-y-auto ios-scroll"
            style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 md:pb-6">
              {children}
            </div>
          </main>

          <BottomNav />
        </div>
      </div>
    </div>
  )
}
