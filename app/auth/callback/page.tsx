'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DollarSign } from 'lucide-react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
      router.replace('/auth/error?error=' + encodeURIComponent('Link de confirmação inválido ou expirado.'))
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace('/auth/error?error=' + encodeURIComponent('Não foi possível confirmar sua conta. Tente fazer login ou criar uma nova conta.'))
      } else {
        router.replace(next)
      }
    })
  }, [router, searchParams])

  return null
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="inline-flex items-center justify-center w-[68px] h-[68px] rounded-[22px] bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/20">
        <DollarSign className="w-8 h-8 text-white" />
      </div>
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      <p className="text-[14px] text-muted-foreground">Confirmando sua conta...</p>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
