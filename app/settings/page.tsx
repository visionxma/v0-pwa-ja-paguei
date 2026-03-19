'use client'

import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    // Check dark mode preference
    if (typeof window !== 'undefined') {
      setDarkMode(
        localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    }
  }, [user, loading, router])

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled)
    localStorage.setItem('darkMode', String(enabled))
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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
            Configurações
          </h1>

          {/* Appearance Settings */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Aparência
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ativa o tema escuro da aplicação
                  </p>
                </div>
                <button
                  onClick={() => handleDarkModeToggle(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notificações
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Despesas adicionadas', description: 'Notifique quando uma despesa for adicionada' },
                { label: 'Pagamentos recebidos', description: 'Notifique quando você receber um pagamento' },
                { label: 'Convites de grupo', description: 'Notifique sobre convites para grupos' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Privacidade
            </h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                🔐 Mudar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Política de Privacidade
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⚖️ Termos de Serviço
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Zona de Perigo
            </h2>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
              🗑️ Deletar Conta
            </Button>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
