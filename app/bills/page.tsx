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
import { fetchBills, updateBillStatus, deleteBill } from '@/lib/supabase/database'
import Link from 'next/link'
import { Plus, Receipt, Check, Trash2, Undo2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function BillsPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const loadBills = () => {
    if (!user) return
    fetchBills(user.id)
      .then(setBills)
      .catch(() => toast.error('Erro ao carregar despesas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBills() }, [user])

  const handleToggleStatus = async (billId: string, current: string) => {
    setActionId(billId)
    try {
      const newStatus = current === 'pago' ? 'pendente' : 'pago'
      await updateBillStatus(billId, newStatus)
      setBills((prev) => prev.map((b) => b.id === billId ? { ...b, status: newStatus } : b))
      toast.success(newStatus === 'pago' ? 'Despesa marcada como paga!' : 'Despesa reaberta')
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const billId = deleteTarget
    setDeleteTarget(null)
    setActionId(billId)
    try {
      await deleteBill(billId)
      setBills((prev) => prev.filter((b) => b.id !== billId))
      toast.success('Despesa excluída')
    } catch {
      toast.error('Erro ao excluir despesa')
    } finally {
      setActionId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5 ios-stagger">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">Minhas Despesas</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Gerencie todas as suas despesas</p>
          </div>
          <Link href="/bills/new">
            <Button className="bg-gradient-to-r from-primary to-primary/85 text-white shadow-lg shadow-primary/20 rounded-[14px] h-10 px-4 text-[13px] font-semibold gap-1.5 ios-press">
              <Plus className="w-4 h-4" />
              Nova
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="ios-card p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </div>
        ) : bills.length === 0 ? (
          <div className="ios-card p-10 text-center ios-card-hover">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[16px] font-semibold text-foreground mb-1">Nenhuma despesa registrada</p>
            <p className="text-[13px] text-muted-foreground mb-6">Crie sua primeira despesa clicando no botão acima</p>
            <Link href="/bills/new">
              <Button className="bg-primary text-white rounded-[14px] h-10 px-5 text-[14px] font-semibold ios-press shadow-md shadow-primary/15">
                Criar Primeira Despesa
              </Button>
            </Link>
          </div>
        ) : (
          <div className="ios-group">
            {bills.map((bill) => (
              <div key={bill.id} className="ios-group-item hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-[14px] ${bill.status === 'pago' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {bill.description}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {bill.groups?.name || 'Pessoal'}
                    {bill.due_date && ` • ${new Date(bill.due_date).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="font-bold text-[14px] text-foreground">R$ {Number(bill.amount).toFixed(2)}</p>
                    <span className={`text-[11px] font-semibold ${bill.status === 'pago' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {bill.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(bill.id, bill.status)}
                    disabled={actionId === bill.id}
                    className={`p-2 rounded-xl transition-colors ios-press ${
                      bill.status === 'pago' ? 'hover:bg-amber-500/10 text-amber-600' : 'hover:bg-emerald-500/10 text-emerald-600'
                    }`}
                    title={bill.status === 'pago' ? 'Reabrir' : 'Marcar como pago'}
                  >
                    {actionId === bill.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : bill.status === 'pago' ? (
                      <Undo2 className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(bill.id)}
                    disabled={actionId === bill.id}
                    className="p-2 rounded-xl hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors ios-press"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A despesa será removida permanentemente.
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
