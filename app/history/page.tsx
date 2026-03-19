'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HistoryPage() {
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

  const transactions = [
    // Placeholder - será preenchido com dados reais
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Histórico
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Todas as suas transações e pagamentos
            </p>
          </div>

          {/* Filters */}
          <Card className="p-4 border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" className="w-full">
                Tudo
              </Button>
              <Button variant="outline" className="w-full">
                Recebido
              </Button>
              <Button variant="outline" className="w-full">
                Pago
              </Button>
            </div>
          </Card>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                📭 Nenhuma transação encontrada
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Suas transações aparecerão aqui
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {tx.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className={`font-bold ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'in' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
