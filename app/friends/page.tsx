'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FriendsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement add friend logic
    setEmail('')
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
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Amigos
          </h1>

          {/* Add Friend Form */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar Novo Amigo
            </h2>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email do seu amigo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button className="bg-primary hover:bg-red-700">
                Adicionar
              </Button>
            </form>
          </Card>

          {/* Friends List */}
          <Card className="p-8 text-center border-dashed border-2">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              👫 Nenhum amigo adicionado ainda
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Adicione amigos para começar a dividir despesas
            </p>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
