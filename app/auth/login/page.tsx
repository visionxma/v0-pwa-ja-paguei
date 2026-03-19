import { login } from '@/app/auth/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg border-red-100 dark:border-red-900">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
              <span className="text-white text-xl font-bold">💰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Já Paguei
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Divida despesas com facilidade
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="border-gray-300 dark:border-gray-600"
              />
            </div>

            <Button
              formAction={login}
              className="w-full bg-primary hover:bg-red-700 text-white font-semibold py-2"
            >
              Entrar
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Não tem conta?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <Link href="/auth/sign-up">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-red-50 dark:hover:bg-gray-700">
              Criar conta
            </Button>
          </Link>

          {/* Footer */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            Ao entrar, você concorda com nossos{' '}
            <Link href="/terms" className="text-primary hover:underline">
              termos
            </Link>
            {' '}e{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              privacidade
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
