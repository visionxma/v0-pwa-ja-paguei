'use client'

import { Bell, Plus, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  title?: string
  subtitle?: string
  userName?: string
}

export function Header({ title, subtitle, userName }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-background border-b border-border">
      {/* Left section - Title or Welcome */}
      <div className="flex items-center gap-4 pl-12 lg:pl-0">
        {title ? (
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo,</p>
            <p className="text-lg font-semibold text-foreground">{userName || 'Usuário'}</p>
          </div>
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Cadastro Rápido</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Criar novo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/bills/new" className="cursor-pointer">
                Nova Despesa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/groups/new" className="cursor-pointer">
                Novo Grupo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/friends" className="cursor-pointer">
                Adicionar Amigo
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          <span className="sr-only">Notificações</span>
        </Button>
      </div>
    </header>
  )
}
