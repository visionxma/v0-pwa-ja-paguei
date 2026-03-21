'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { fetchGroups, deleteGroup } from '@/lib/supabase/database'
import Link from 'next/link'
import { Plus, Users, Trash2, Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function GroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchGroups(user.id)
      .then(setGroups)
      .catch(() => toast.error('Erro ao carregar grupos'))
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const groupId = deleteTarget
    setDeleteTarget(null)
    setDeletingId(groupId)
    try {
      await deleteGroup(groupId)
      setGroups((prev) => prev.filter((g) => g.id !== groupId))
      toast.success('Grupo excluído')
    } catch {
      toast.error('Erro ao excluir grupo')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5 ios-stagger">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">Meus Grupos</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Organize despesas por grupo</p>
          </div>
          <Link href="/groups/new">
            <Button className="bg-gradient-to-r from-primary to-primary/85 text-white shadow-lg shadow-primary/20 rounded-[14px] h-10 px-4 text-[13px] font-semibold gap-1.5 ios-press">
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="ios-card p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : groups.length === 0 ? (
          <div className="ios-card p-10 text-center ios-card-hover">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[16px] font-semibold text-foreground mb-1">Nenhum grupo criado</p>
            <p className="text-[13px] text-muted-foreground mb-6">Crie um grupo para dividir despesas entre amigos</p>
            <Link href="/groups/new">
              <Button className="bg-primary text-white rounded-[14px] h-10 px-5 text-[14px] font-semibold ios-press shadow-md shadow-primary/15">
                Criar Primeiro Grupo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="ios-group">
            {groups.map((group) => (
              <div key={group.id} className="ios-group-item hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[14px] text-foreground">{group.name}</p>
                    {group.role === 'admin' && (
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  {group.description && (
                    <p className="text-[12px] text-muted-foreground truncate">{group.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {group.role === 'admin' && (
                  <button
                    onClick={() => setDeleteTarget(group.id)}
                    disabled={deletingId === group.id}
                    className="p-2 rounded-xl hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors ios-press"
                    title="Excluir grupo"
                  >
                    {deletingId === group.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O grupo e todos os seus dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white rounded-[12px] hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
