const CACHE_NAME = 'ja-paguei-v1'
const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/auth/login',
  '/auth/sign-up',
  '/offline.html',
]

// Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting() // Força a ativação imediata da nova versão
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
})

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Assume o controle imediatamente de todas as abas abertas
      self.clients.claim()
    ])
  )
})

// Fetch Event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)
  
  // Estrategia Network-First para a home, dashboard e rotas de app
  // Isso garante que se houver internet, ele pegue a versao nova do deploy (GitHub)
  const isAppRoute = URLS_TO_CACHE.some(route => url.pathname === route || url.pathname.startsWith(route + '/'))

  if (isAppRoute) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return response
        })
        .catch(() => {
          return caches.match(event.request)
        })
    )
    return
  }

  // Cache-First para outros assets (JS, CSS, Imagens) que o Next.js ja controla com hashes
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: 'notification',
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification('Já Paguei', options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
