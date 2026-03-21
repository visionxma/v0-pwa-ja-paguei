import { createClient } from './client'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
  'User already registered': 'Este email já está cadastrado',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'Signup requires a valid password': 'É necessário informar uma senha válida',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
  'Request rate limit reached': 'Muitas tentativas. Aguarde alguns minutos e tente novamente',
}

function translateError(message: string): string {
  if (message.includes('security purposes') || message.includes('rate limit') || (message.includes('after') && message.includes('seconds'))) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente'
  }
  return ERROR_MAP[message] ?? message
}

export async function loginClient(email: string, password: string): Promise<{ error: string | null }> {
  if (!email || !password) return { error: 'Preencha todos os campos' }
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? translateError(error.message) : null }
}

export async function signupClient(
  email: string,
  password: string,
  confirmPassword: string
): Promise<{ error: string | null }> {
  if (!email || !password || !confirmPassword) return { error: 'Preencha todos os campos' }
  if (password.length < 6) return { error: 'A senha deve ter pelo menos 6 caracteres' }
  if (password !== confirmPassword) return { error: 'As senhas não conferem' }

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: email.split('@')[0] || 'Usuário' },
      emailRedirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  })
  return { error: error ? translateError(error.message) : null }
}

export async function logoutClient(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}
