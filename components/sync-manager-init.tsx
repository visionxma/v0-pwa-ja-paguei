'use client'

import { useEffect } from 'react'
import { initSyncManager } from '@/lib/offline/sync'

/** Inicializa o sync manager uma vez, client-side */
export function SyncManagerInit() {
  useEffect(() => {
    initSyncManager()
  }, [])

  return null
}
