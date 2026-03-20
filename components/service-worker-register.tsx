'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar Service Worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] registrado:', registration)
          
          // Verificar atualizações do GitHub/Deploy a cada 1 hora ou quando a aba focar
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60);
          
          window.addEventListener('focus', () => {
            registration.update();
          });
        })
        .catch((error) => {
          console.error('[PWA] erro:', error)
        })

      // Escutar por mudancas de versao (quando o novo SW assume o controle)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [])

  return null
}
