'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function translateError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'Signup requires a valid password': 'É necessário informar uma senha válida',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
    'Request rate limit reached': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
  }

  // Check for rate limit patterns
  if (message.includes('security purposes') || message.includes('rate limit') || message.includes('after') && message.includes('seconds')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente'
  }

  return translations[message] || message
}

export type AuthState = {
  error: string | null
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  redirect('/dashboard')
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (!email || !password || !confirmPassword) {
    return { error: 'Preencha todos os campos' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não conferem' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: email.split('@')[0] || 'Usuário',
      },
    },
  })

  if (error) {
    return { error: translateError(error.message) }
  }

  // Com auto-confirm ativo, o usuário já está logado após o signUp
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
