'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { fetchPreferences, updatePreferences, changePassword, deleteAccount } from '@/lib/supabase/database'
import { useTheme } from 'next-themes'
import { KeyRound, FileText, Scale, Trash2, Moon, Bell, MessageSquare, UserCheck, ChevronRight, X, Save, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function IOSToggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-all duration-300 shrink-0 ios-press ${
        on ? 'bg-primary' : 'bg-muted-foreground/20'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`inline-block h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform duration-300 ${
        on ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [prefs, setPrefs] = useState<any>(null)
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const darkMode = theme === 'dark'

  useEffect(() => {
    if (!user) return
    fetchPreferences(user.id).then(setPrefs).catch(console.error)
  }, [user])

  const handleDarkModeToggle = (enabled: boolean) => {
    setTheme(enabled ? 'dark' : 'light')
  }

  const handleNotifToggle = async (key: string, value: boolean) => {
    if (!user) return
    setSavingPrefs(true)
    try {
      await updatePreferences(user.id, { [key]: value })
      setPrefs((prev: any) => prev ? { ...prev, [key]: value } : prev)
      toast.success('Preferencia salva')
    } catch {
      toast.error('Erro ao salvar preferencia')
    } finally {
      setSavingPrefs(false)
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETAR') {
      toast.error('Digite DELETAR para confirmar')
      return
    }
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success('Conta desativada. Voce sera redirecionado.')
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao deletar conta')
    } finally {
      setDeleting(false)
    }
  }

  const notifItems = [
    { label: 'Despesas adicionadas', icon: Bell, color: 'bg-red-500', key: 'notify_group_new_bill' },
    { label: 'Pagamentos recebidos', icon: MessageSquare, color: 'bg-green-500', key: 'notify_group_bill_paid' },
    { label: 'Convites de grupo', icon: UserCheck, color: 'bg-blue-500', key: 'notify_group_new_member' },
  ]

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl ios-stagger">
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">Configuracoes</h1>

        {/* Appearance */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">Aparencia</p>
          <div className="ios-group">
            <div className="ios-group-item">
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-indigo-500 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-foreground">Modo Escuro</span>
              </div>
              <IOSToggle on={darkMode} onChange={handleDarkModeToggle} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">Notificacoes</p>
          <div className="ios-group">
            {notifItems.map((item) => {
              const Icon = item.icon
              const isOn = prefs ? prefs[item.key] !== false : true
              return (
                <div key={item.key} className="ios-group-item">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-[8px] ${item.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[15px] text-foreground">{item.label}</span>
                  </div>
                  <IOSToggle on={isOn} onChange={(v) => handleNotifToggle(item.key, v)} disabled={savingPrefs} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Privacy */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">Privacidade</p>
          <div className="ios-group">
            <button
              onClick={() => { setPasswordOpen(!passwordOpen); setDeleteOpen(false) }}
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                  <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword}
                    className="bg-primary text-white rounded-[12px] h-9 px-4 text-[13px] font-semibold gap-1.5 ios-press">
                    {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Alterar
                  </Button>
                  <Button variant="outline" onClick={() => { setPasswordOpen(false); setNewPassword(''); setConfirmPassword('') }}
                    className="rounded-[12px] h-9 px-4 text-[13px] ios-press">
                    <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            )}

            <a href="/privacy" className="ios-group-item w-full ios-press hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-gray-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-foreground">Politica de Privacidade</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </a>

            <a href="/terms" className="ios-group-item w-full ios-press hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-gray-500 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-foreground">Termos de Servico</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </a>
          </div>
        </div>

        {/* Danger */}
        <div>
          <p className="text-[12px] font-semibold text-destructive/70 uppercase tracking-[0.08em] mb-2 ml-4">Zona de Perigo</p>
          <div className="ios-group">
            <button
              onClick={() => { setDeleteOpen(!deleteOpen); setPasswordOpen(false) }}
              className="ios-group-item w-full ios-press hover:bg-destructive/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-destructive flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] text-destructive">Deletar Conta</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground/40 transition-transform ${deleteOpen ? 'rotate-90' : ''}`} />
            </button>

            {deleteOpen && (
              <div className="px-5 py-4 space-y-3 bg-destructive/[0.03]">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[13px] text-destructive">
                    Esta acao e irreversivel. Todos os seus dados serao perdidos permanentemente.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-destructive">
                    Digite <span className="font-bold">DELETAR</span> para confirmar
                  </Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETAR"
                    className="h-[42px] rounded-[12px] bg-background border-destructive/30 text-[15px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm !== 'DELETAR'}
                    className="bg-destructive text-white rounded-[12px] h-9 px-4 text-[13px] font-semibold gap-1.5 ios-press disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Deletar Permanentemente
                  </Button>
                  <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm('') }}
                    className="rounded-[12px] h-9 px-4 text-[13px] ios-press">
                    Cancelar
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
