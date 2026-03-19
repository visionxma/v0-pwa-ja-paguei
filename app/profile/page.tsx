'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Camera, Save, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [user, supabase])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' })
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setProfile((prev: any) => ({ ...prev, display_name: displayName }))
    }

    setSaving(false)
  }

  const initials = (profile?.display_name || user?.email?.split('@')[0] || 'U')
    .substring(0, 2)
    .toUpperCase()

  return (
    <AppShell title="Perfil" subtitle="Gerencie suas informações">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-3xl">{initials}</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/80 transition-colors">
                  <Camera className="h-4 w-4 text-secondary-foreground" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {profile?.display_name || user?.email?.split('@')[0] || 'Usuário'}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground justify-center sm:justify-start">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize suas informações de perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de exibição</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user?.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                {message && (
                  <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                    {message.text}
                  </p>
                )}

                <Button 
                  onClick={handleSave} 
                  disabled={saving || displayName === profile?.display_name}
                  className="w-full gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Despesas</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Grupos</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Amigos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
