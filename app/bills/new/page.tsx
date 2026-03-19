'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewBillPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // TODO: Implement bill creation
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/bills')
    }, 1000)
  }

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
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nova Despesa
          </h1>

          {/* Form */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Descrição
                </Label>
                <Input
                  id="description"
                  placeholder="Ex: Jantar"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">
                    Valor (R$)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="group" className="text-gray-700 dark:text-gray-300">
                    Grupo
                  </Label>
                  <select className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2">
                    <option>Pessoal</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-1"
                  required
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                  Dividir entre
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selecione quem pagará
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
