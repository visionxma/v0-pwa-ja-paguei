'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginClient } from '@/lib/supabase/auth-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const data = new FormData(e.currentTarget)
    const result = await loginClient(
      data.get('email') as string,
      data.get('password') as string,
    )

    if (result.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="app-root flex items-center justify-center bg-background px-5 relative overflow-hidden overflow-y-auto">
      {/* Soft blurred shapes */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px]" />

      <div className="w-full max-w-[400px] relative ios-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[68px] h-[68px] rounded-[22px] bg-gradient-to-br from-primary to-primary/70 mb-5 shadow-2xl shadow-primary/20">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[28px] font-bold text-foreground tracking-tight">Já Paguei</h1>
          <p className="text-muted-foreground mt-1.5 text-[14px]">Divida despesas com facilidade</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-destructive/6 border border-destructive/10 ios-scale-in">
            <div className="flex items-center gap-2.5 justify-center">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-[13px] text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="ios-card p-6 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  disabled={pending}
                  className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-foreground">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                  disabled={pending}
                  className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-[46px] bg-gradient-to-r from-primary to-primary/85 text-white font-semibold rounded-[14px] shadow-lg shadow-primary/20 text-[15px] gap-2 ios-press hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 mt-1"
            >
              {pending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {pending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        {/* Sign up */}
        <div className="ios-card p-4">
          <div className="text-center mb-3">
            <span className="text-[13px] text-muted-foreground">Não tem conta?</span>
          </div>
          <Link href="/auth/sign-up">
            <Button variant="outline" className="w-full h-[44px] rounded-[14px] gap-2 text-[14px] font-medium ios-press hover:bg-muted/50 border-border/70 transition-all duration-300">
              <UserPlus className="w-4 h-4" />
              Criar conta
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground/50 text-center mt-6">
          Ao entrar, você concorda com nossos{' '}
          <Link href="/terms" className="text-primary/70 hover:underline">termos</Link>
          {' '}e{' '}
          <Link href="/privacy" className="text-primary/70 hover:underline">privacidade</Link>
        </p>
      </div>
    </div>
  )
}
