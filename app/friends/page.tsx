'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { fetchFriends, addFriend, acceptFriend, removeFriend } from '@/lib/supabase/database'
import { UserPlus, Search, Check, X, Loader2, UserCheck, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function FriendsPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const loadFriends = () => {
    if (!user) return
    fetchFriends(user.id)
      .then(setFriends)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadFriends() }, [user])

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !email.trim()) return

    setAdding(true)
    try {
      await addFriend(user.id, email.trim().toLowerCase())
      toast.success('Convite de amizade enviado!')
      setEmail('')
      loadFriends()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao adicionar amigo')
    } finally {
      setAdding(false)
    }
  }

  const handleAccept = async (friendshipId: string) => {
    setActionId(friendshipId)
    try {
      await acceptFriend(friendshipId)
      setFriends((prev) => prev.map((f) => f.id === friendshipId ? { ...f, status: 'accepted' } : f))
      toast.success('Amizade aceita!')
    } catch {
      toast.error('Erro ao aceitar convite')
    } finally {
      setActionId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    const friendshipId = removeTarget
    setRemoveTarget(null)
    setActionId(friendshipId)
    try {
      await removeFriend(friendshipId)
      setFriends((prev) => prev.filter((f) => f.id !== friendshipId))
      toast.success('Amigo removido')
    } catch {
      toast.error('Erro ao remover amigo')
    } finally {
      setActionId(null)
    }
  }

  const accepted = friends.filter((f) => f.status === 'accepted')
  const pendingReceived = friends.filter((f) => f.status === 'pending' && !f.isRequester)
  const pendingSent = friends.filter((f) => f.status === 'pending' && f.isRequester)

  return (
    <AppLayout>
      <div className="space-y-5 ios-stagger">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Meus Amigos</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Adicione amigos para dividir despesas</p>
        </div>

        <div className="ios-card p-5">
          <p className="text-[13px] font-semibold text-foreground mb-3">Adicionar Novo Amigo</p>
          <form onSubmit={handleAddFriend} className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
              <Input
                type="email"
                placeholder="Email do seu amigo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={adding}
                className="pl-10 h-[44px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !email.trim()}
              className="bg-primary text-white rounded-[14px] h-[44px] px-4 text-[13px] font-semibold ios-press shadow-md shadow-primary/15 gap-1.5"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Adicionar
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="ios-card p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : friends.length === 0 ? (
          <div className="ios-card p-8 text-center ios-card-hover">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[16px] font-semibold text-foreground mb-1">Nenhum amigo adicionado</p>
            <p className="text-[13px] text-muted-foreground">Adicione amigos para dividir despesas</p>
          </div>
        ) : (
          <>
            {/* Pending received */}
            {pendingReceived.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">
                  Convites Recebidos
                </p>
                <div className="ios-group">
                  {pendingReceived.map((f) => (
                    <div key={f.id} className="ios-group-item">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 text-white flex items-center justify-center font-semibold text-[13px] shrink-0">
                          {(f.friend?.display_name || f.friend?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-foreground truncate">{f.friend?.display_name || 'Usuario'}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{f.friend?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAccept(f.id)}
                          disabled={actionId === f.id}
                          className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-600 transition-colors ios-press"
                        >
                          {actionId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setRemoveTarget(f.id)}
                          disabled={actionId === f.id}
                          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive/60 transition-colors ios-press"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted friends */}
            {accepted.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">
                  Amigos ({accepted.length})
                </p>
                <div className="ios-group">
                  {accepted.map((f) => (
                    <div key={f.id} className="ios-group-item">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-semibold text-[13px] shrink-0">
                          {(f.friend?.display_name || f.friend?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-foreground truncate">{f.friend?.display_name || 'Usuario'}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{f.friend?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4 text-emerald-500 mr-1" />
                        <button
                          onClick={() => setRemoveTarget(f.id)}
                          disabled={actionId === f.id}
                          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors ios-press"
                        >
                          {actionId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending sent */}
            {pendingSent.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2 ml-4">
                  Convites Enviados
                </p>
                <div className="ios-group">
                  {pendingSent.map((f) => (
                    <div key={f.id} className="ios-group-item">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/20 text-muted-foreground flex items-center justify-center font-semibold text-[13px] shrink-0">
                          {(f.friend?.display_name || f.friend?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-muted-foreground truncate">{f.friend?.display_name || 'Usuario'}</p>
                          <p className="text-[12px] text-muted-foreground/60 truncate">{f.friend?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/40 mr-1" />
                        <span className="text-[11px] text-muted-foreground/60 mr-1">Pendente</span>
                        <button
                          onClick={() => setRemoveTarget(f.id)}
                          disabled={actionId === f.id}
                          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive/60 transition-colors ios-press"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover amigo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza? Esta pessoa não estará mais na sua lista de amigos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-white rounded-[12px] hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
