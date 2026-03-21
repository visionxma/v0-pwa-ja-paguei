'use client'

import { useEffect, useState } from 'react'
import { subscribeSyncState, type SyncState } from '@/lib/offline/sync'

export function useSyncStatus(): SyncState {
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastSyncAt: null,
  })

  useEffect(() => {
    return subscribeSyncState(setState)
  }, [])

  return state
}
