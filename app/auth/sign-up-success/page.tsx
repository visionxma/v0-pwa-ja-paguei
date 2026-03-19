import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg border-red-100 dark:border-red-900">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <span className="text-3xl">✓</span>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Conta Criada!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Verifique seu email para confirmar sua conta.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Um link de confirmação foi enviado para você. Clique no link para ativar sua conta.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-red-700 text-white font-semibold">
                Voltar para Login
              </Button>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Não recebeu o email?{' '}
              <button className="text-primary hover:underline font-semibold">
                Reenviar
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
