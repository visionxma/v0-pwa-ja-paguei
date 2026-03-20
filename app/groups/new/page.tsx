'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createGroup } from '@/lib/supabase/database'
import { Save, ArrowLeft, Tag, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NewGroupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!name.trim()) {
      toast.error('Informe o nome do grupo')
      return
    }

    setIsSubmitting(true)
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        created_by: user.id,
      })
      toast.success('Grupo criado com sucesso!')
      router.push('/groups')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar grupo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5 max-w-2xl ios-stagger">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Criar Novo Grupo</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Organize despesas por grupo</p>
        </div>

        <div className="ios-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Nome do Grupo</Label>
              <div className="relative group">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Ex: Viagem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-[46px] rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Descricao</Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <textarea
                  placeholder="Descricao opcional"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-[14px] bg-muted/40 border-transparent text-[15px] ios-input focus:border-primary/30 focus:bg-background outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={isSubmitting}
                className="flex-1 h-[46px] bg-gradient-to-r from-primary to-primary/85 text-white font-semibold rounded-[14px] shadow-lg shadow-primary/20 text-[15px] gap-2 ios-press disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Criando...' : 'Criar Grupo'}
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
