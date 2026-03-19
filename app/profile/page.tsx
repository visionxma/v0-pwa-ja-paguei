'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
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

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meu Perfil
          </h1>

          {/* Profile Card */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Informações
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    Nome
                  </Label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </Label>
                  <p className="mt-1 text-gray-900 dark:text-white break-all">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              ✏️ Editar Perfil
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              🔐 Mudar Senha
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
