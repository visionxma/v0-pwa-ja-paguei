'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function BillsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Minhas Despesas
            </h1>
            <Link href="/bills/new">
              <Button className="bg-primary hover:bg-red-700">
                + Nova Despesa
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          <Card className="p-12 text-center border-dashed border-2">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              📭 Nenhuma despesa registrada ainda
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Crie sua primeira despesa clicando no botão acima
            </p>
            <Link href="/bills/new">
              <Button className="bg-primary hover:bg-red-700">
                Criar Primeira Despesa
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
