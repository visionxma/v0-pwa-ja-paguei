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
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sua conta foi criada com sucesso.
          </p>

          {/* Actions */}
          <Link href="/dashboard">
            <Button className="w-full bg-primary hover:bg-red-700 text-white font-semibold">
              Ir para o Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
