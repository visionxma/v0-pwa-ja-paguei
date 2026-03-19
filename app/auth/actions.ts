'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/error?error=' + error.message)
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (password !== confirmPassword) {
    redirect('/auth/error?error=Senhas não conferem')
  }

  // Build redirect URL
  let redirectUrl = 'http://localhost:3000/auth/callback'
  if (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL) {
    redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    redirectUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
  } else if (process.env.VERCEL_URL) {
    redirectUrl = `https://${process.env.VERCEL_URL}/auth/callback`
  }

  const data = {
    email: formData.get('email') as string,
    password: password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: formData.get('email')?.toString().split('@')[0] || 'Usuário',
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/error?error=' + error.message)
  }

  redirect('/auth/sign-up-success')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
