import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PROTECTED_ROUTES } from '@/lib/constants'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => { listener?.subscription.unsubscribe() }
  }, [supabase.auth])

  // Client-side route protection (active in Capacitor where middleware doesn't run)
  useEffect(() => {
    if (loading) return
    const isProtected = PROTECTED_ROUTES.some(r => pathname?.startsWith(r))
    if (isProtected && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, pathname, router])

  return { user, loading }
}
