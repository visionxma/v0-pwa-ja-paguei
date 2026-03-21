'use client'

import { useSyncStatus } from '@/hooks/use-sync-status'
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SyncIndicator() {
  const { isSyncing, pendingCount, failedCount } = useSyncStatus()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500" title="Sincronizando...">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span className="text-[11px] font-medium hidden sm:block">Sincronizando</span>
      </div>
    )
  }

  if (failedCount > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 text-destructive" title={`${failedCount} operação(ões) falharam`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium hidden sm:block">{failedCount} erro{failedCount > 1 ? 's' : ''}</span>
      </div>
    )
  }

  if (!isOnline || pendingCount > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500" title={pendingCount > 0 ? `${pendingCount} item(ns) aguardando sync` : 'Sem conexão'}>
        <CloudOff className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium hidden sm:block">
          {pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : 'Offline'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-green-500/70" title="Tudo sincronizado">
      <Cloud className="w-3.5 h-3.5" />
    </div>
  )
}
