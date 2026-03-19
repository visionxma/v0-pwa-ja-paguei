'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { UserPlus, Users, Check, X, Clock, Mail } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function FriendsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function loadFriends() {
      if (!user) return
      
      // Load accepted friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*, requester:profiles!friends_requester_id_fkey(*), receiver:profiles!friends_receiver_id_fkey(*)')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      // Load pending requests received
      const { data: pendingData } = await supabase
        .from('friends')
        .select('*, requester:profiles!friends_requester_id_fkey(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      setFriends(friendsData || [])
      setPendingRequests(pendingData || [])
      setLoading(false)
    }

    loadFriends()
  }, [user, supabase])

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !email) return

    setSending(true)
    setMessage(null)

    try {
      // Find user by email
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single()

      if (!targetUser) {
        setMessage({ type: 'error', text: 'Usuário não encontrado com esse email' })
        setSending(false)
        return
      }

      if (targetUser.user_id === user.id) {
        setMessage({ type: 'error', text: 'Você não pode adicionar a si mesmo' })
        setSending(false)
        return
      }

      // Create friend request
      const { error } = await supabase.from('friends').insert({
        requester_id: user.id,
        receiver_id: targetUser.user_id,
        status: 'pending'
      })

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'Solicitação já existe' })
        } else {
          setMessage({ type: 'error', text: 'Erro ao enviar solicitação' })
        }
      } else {
        setMessage({ type: 'success', text: 'Solicitação enviada com sucesso!' })
        setEmail('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao processar solicitação' })
    }

    setSending(false)
  }

  const handleAccept = async (friendId: string) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendId)
    setPendingRequests(prev => prev.filter(p => p.id !== friendId))
  }

  const handleReject = async (friendId: string) => {
    await supabase.from('friends').delete().eq('id', friendId)
    setPendingRequests(prev => prev.filter(p => p.id !== friendId))
  }

  return (
    <AppShell title="Amigos" subtitle="Gerencie suas conexões">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Add Friend Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Adicionar Amigo
            </CardTitle>
            <CardDescription>
              Envie uma solicitação de amizade pelo email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 gap-2 h-11"
                  disabled={sending}
                >
                  <Mail className="h-4 w-4" />
                  {sending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
              {message && (
                <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                  {message.text}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Solicitações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {request.requester?.display_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.requester?.display_name || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">{request.requester?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(request.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : friends.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum amigo ainda</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Adicione amigos pelo email para começar a dividir despesas juntos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Meus Amigos ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friends.map((friend) => {
                const friendUser = friend.requester_id === user?.id ? friend.receiver : friend.requester
                return (
                  <div key={friend.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {friendUser?.display_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{friendUser?.display_name || 'Usuário'}</p>
                      <p className="text-sm text-muted-foreground">{friendUser?.email}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
