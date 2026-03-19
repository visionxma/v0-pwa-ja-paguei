'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Sun, Moon, Bell, Shield, Trash2, Lock, FileText, Scale } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    expenses: true,
    payments: true,
    invites: true,
    reminders: false,
  })

  return (
    <AppShell title="Configurações" subtitle="Personalize sua experiência">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a interface do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Modo Escuro</p>
                <p className="text-sm text-muted-foreground">Ativa o tema escuro da aplicação</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'expenses', label: 'Despesas adicionadas', description: 'Quando uma despesa for criada no grupo' },
              { key: 'payments', label: 'Pagamentos recebidos', description: 'Quando você receber um pagamento' },
              { key: 'invites', label: 'Convites de grupo', description: 'Quando for convidado para um grupo' },
              { key: 'reminders', label: 'Lembretes de vencimento', description: 'Antes de uma conta vencer' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacidade e Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <span>Alterar Senha</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Política de Privacidade</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <span>Termos de Serviço</span>
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>Ações irreversíveis para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
              <Trash2 className="h-5 w-5" />
              <span>Excluir minha conta permanentemente</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
