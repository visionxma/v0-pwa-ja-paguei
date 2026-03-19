'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[v0] Service Worker registrado com sucesso:', registration)
        })
        .catch((error) => {
          console.error('[v0] Erro ao registrar Service Worker:', error)
        })
    }
  }, [])

  return null
}
