'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Settings, ArrowRight } from 'lucide-react'

export default function GroupsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGroups() {
      if (!user) return
      
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id, role, groups(*)')
        .eq('user_id', user.id)

      const groupsData = memberships?.map(m => ({
        ...m.groups,
        role: m.role
      })) || []
      
      setGroups(groupsData)
      setLoading(false)
    }

    loadGroups()
  }, [user, supabase])

  return (
    <AppShell title="Grupos" subtitle="Gerencie seus grupos e membros">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Actions bar */}
        <div className="flex justify-end">
          <Link href="/groups/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Novo Grupo
            </Button>
          </Link>
        </div>

        {/* Groups list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum grupo ainda</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Crie um grupo para começar a dividir despesas com amigos, família ou colegas.
              </p>
              <Link href="/groups/new">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeiro grupo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="text-xs capitalize">{group.role}</CardDescription>
                      </div>
                    </div>
                    {group.role === 'admin' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {group.description || 'Sem descrição'}
                  </p>
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    Ver grupo <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
