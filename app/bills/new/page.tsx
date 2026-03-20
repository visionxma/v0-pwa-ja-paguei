'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AttachmentUpload, type PendingFile } from '@/components/bills/attachment-upload'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { uploadAttachment, saveAttachmentRecord } from '@/lib/supabase/storage'
import { createBill, fetchGroups } from '@/lib/supabase/database'
import { Save, ArrowLeft, FileText, DollarSign, CalendarDays, Paperclip, Loader2, Tag, Repeat } from 'lucide-react'
import { toast } from 'sonner'

export default function NewBillPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<PendingFile[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [groups, setGroups] = useState<any[]>([])

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [groupId, setGroupId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('geral')
  const [recurrence, setRecurrence] = useState('unica')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!user) return
    fetchGroups(user.id).then(setGroups).catch(console.error)
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    if (!description.trim() || !amount) {
      toast.error('Preencha a descricao e o valor')
      return
    }

    setIsSubmitting(true)

    try {
      const bill = await createBill({
        user_id: user.id,
        description: description.trim(),
        amount: parseFloat(amount),
        group_id: groupId || null,
        due_date: dueDate || null,
        category,
        recurrence,
        notes: notes.trim() || undefined,
      })

      if (attachments.length > 0) {
        for (let i = 0; i < attachments.length; i++) {
          setUploadProgress(`Enviando ${i + 1}/${attachments.length}...`)
          const result = await uploadAttachment(attachments[i].file, user.id)
          await saveAttachmentRecord(bill.id, user.id, result)
        }
      }

      toast.success('Despesa criada com sucesso!')
      router.push('/bills')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar despesa')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl ios-stagger">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Nova Despesa</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Registre uma nova despesa</p>
        </div>

        <div className="ios-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Descricao</Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Ex: Jantar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Valor (R$)</Label>
                <div className="relative group">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Grupo</Label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full h-[46px] rounded-[14px] bg-muted/40 border-transparent px-3.5 text-[15px] ios-input focus:border-primary/30 focus:bg-background outline-none"
                >
                  <option value="">Pessoal</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Data de Vencimento</Label>
                <div className="relative group">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Categoria</Label>
                <div className="relative group">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-[46px] pl-10 rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background outline-none"
                  >
                    <option value="geral">Geral</option>
                    <option value="alimentacao">Alimentacao</option>
                    <option value="transporte">Transporte</option>
                    <option value="moradia">Moradia</option>
                    <option value="lazer">Lazer</option>
                    <option value="saude">Saude</option>
                    <option value="educacao">Educacao</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Recorrencia</Label>
              <div className="relative group">
                <Repeat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full h-[46px] pl-10 rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background outline-none"
                >
                  <option value="unica">Unica</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Observacoes</Label>
              <textarea
                placeholder="Observacoes opcionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-3 rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background outline-none resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="pt-2">
              <div className="flex items-center gap-2.5 mb-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <Label className="font-semibold text-[13px]">Anexos</Label>
                {attachments.length > 0 && (
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">
                    {attachments.length}
                  </span>
                )}
              </div>
              <AttachmentUpload files={attachments} onFilesChange={setAttachments} />
            </div>

            {uploadProgress && (
              <div className="flex items-center gap-2 text-[13px] text-primary ios-fade-in">
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress}
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isSubmitting}
                className="flex-1 h-[46px] bg-gradient-to-r from-primary to-primary/85 text-white font-semibold rounded-[14px] shadow-lg shadow-primary/20 text-[15px] gap-2 ios-press disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? (uploadProgress || 'Salvando...') : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}
                className="flex-1 h-[46px] rounded-[14px] text-[15px] font-medium ios-press border-border/70">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
