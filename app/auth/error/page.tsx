'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Erro na autenticação'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg border-red-100 dark:border-red-900">
        <div className="p-8 text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
            <span className="text-3xl">✕</span>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro de Autenticação
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 break-words">
            {error}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-red-700 text-white font-semibold">
                Tentar Novamente
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-red-50 dark:hover:bg-gray-700">
                Criar Nova Conta
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
