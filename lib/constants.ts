// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/bills',
  '/groups',
  '/friends',
  '/profile',
  '/settings',
  '/history',
]

// Public routes
export const PUBLIC_ROUTES = ['/auth/login', '/auth/sign-up', '/auth/error', '/auth/callback']

// App metadata
export const APP_NAME = 'Já Paguei'
export const APP_DESCRIPTION = 'Aplicação inteligente para divisão de despesas entre amigos e grupos'
export const APP_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000'
