'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { logoutClient } from '@/lib/supabase/auth-client'
import { useState } from 'react'

export function Header() {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            💰
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">
            Já Paguei
          </span>
        </Link>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
            Olá, {displayName}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm"
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Configurações
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => logoutClient().then(() => { window.location.href = '/auth/login' })}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
