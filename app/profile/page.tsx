'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { updateProfile, changePassword } from '@/lib/supabase/database'
import { Pencil, KeyRound, ChevronRight, X, Save, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario'

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false)
  const [newName, setNewName] = useState(displayName)
  const [savingProfile, setSavingProfile] = useState(false)

  // Change password state
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!user || !newName.trim()) return
    setSavingProfile(true)
    try {
      await updateProfile(user.id, { display_name: newName.trim() })
      toast.success('Perfil atualizado! Recarregue para ver a mudanca.')
      setEditOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas nao conferem')
      return
    }
    setSavingPassword(true)
    try {
      await changePassword(newPassword)
      toast.success('Senha alterada com sucesso!')
      setPasswordOpen(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao alterar senha')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl ios-stagger">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">Meu Perfil</h1>

        {/* Avatar card */}
        <div className="ios-card p-6 flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-bold text-[28px] shrink-0 shadow-xl shadow-primary/15">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-foreground leading-tight">{displayName}</p>
            <p className="text-[14px] text-muted-foreground mt-0.5">{user?.email}</p>
            <p className="text-[12px] text-muted-foreground/60 mt-1">
              Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">Informacoes</p>
          <div className="ios-group">
            <div className="ios-group-item">
              <span className="text-[13px] text-muted-foreground">Nome</span>
              <span className="text-[15px] text-foreground font-medium">{displayName}</span>
            </div>
            <div className="ios-group-item">
              <span className="text-[13px] text-muted-foreground">Email</span>
              <span className="text-[15px] text-foreground font-medium truncate max-w-[200px]">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">Acoes</p>
          <div className="ios-group">
            <button
              onClick={() => { setEditOpen(!editOpen); setPasswordOpen(false) }}
              className="ios-group-item w-full ios-press hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-blue-500 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-foreground">Editar Perfil</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform ${editOpen ? 'rotate-90' : ''}`} />
            </button>

            {editOpen && (
              <div className="px-5 py-4 space-y-3 bg-muted/20">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Nome de Exibicao</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-[42px] rounded-[12px] bg-background border-border/50 text-[15px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !newName.trim()}
                    className="bg-primary text-white rounded-[12px] h-9 px-4 text-[13px] font-semibold gap-1.5 ios-press"
                  >
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-[12px] h-9 px-4 text-[13px] ios-press">
                    <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            )}

            <button
              onClick={() => { setPasswordOpen(!passwordOpen); setEditOpen(false) }}
              className="ios-group-item w-full ios-press hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-orange-500 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-foreground">Mudar Senha</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform ${passwordOpen ? 'rotate-90' : ''}`} />
            </button>

            {passwordOpen && (
              <div className="px-5 py-4 space-y-3 bg-muted/20">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimo 6 caracteres"
                      className="h-[42px] rounded-[12px] bg-background border-border/50 text-[15px] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium">Confirmar Senha</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="h-[42px] rounded-[12px] bg-background border-border/50 text-[15px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={savingPassword || !newPassword}
                    className="bg-primary text-white rounded-[12px] h-9 px-4 text-[13px] font-semibold gap-1.5 ios-press"
                  >
                    {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Alterar Senha
                  </Button>
                  <Button variant="outline" onClick={() => { setPasswordOpen(false); setNewPassword(''); setConfirmPassword('') }} className="rounded-[12px] h-9 px-4 text-[13px] ios-press">
                    <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
