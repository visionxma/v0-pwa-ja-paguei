const CACHE_VERSION = 'v2'
const CACHE_STATIC = `ja-paguei-static-${CACHE_VERSION}`
const CACHE_PAGES = `ja-paguei-pages-${CACHE_VERSION}`
const CACHE_API = `ja-paguei-api-${CACHE_VERSION}`

const APP_ROUTES = [
  '/',
  '/dashboard',
  '/bills',
  '/bills/new',
  '/groups',
  '/groups/new',
  '/friends',
  '/history',
  '/profile',
  '/settings',
  '/auth/login',
  '/auth/sign-up',
  '/offline',
]

// Install — pre-cache all app pages
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_PAGES).then((cache) =>
      cache.addAll(APP_ROUTES).catch(() => {})
    )
  )
})

// Activate — remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_STATIC && k !== CACHE_PAGES && k !== CACHE_API)
            .map((k) => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  )
})

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Supabase API calls — Network first, fallback to cache (shows last known data)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirstWithCache(request, CACHE_API))
    return
  }

  // Next.js static assets (_next/static) — Cache first, always reliable
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_STATIC))
    return
  }

  // App pages — Network first, fallback to cached page, then offline page
  const isAppPage = !url.pathname.includes('.') || url.pathname.endsWith('/')
  if (isAppPage) {
    event.respondWith(networkFirstWithCache(request, CACHE_PAGES))
    return
  }

  // Other static files (icons, images) — Cache first
  event.respondWith(cacheFirstWithNetwork(request, CACHE_STATIC))
})

async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    // Fallback offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline')
      if (offlinePage) return offlinePage
    }
    return new Response('Sem conexão', { status: 503, statusText: 'Offline' })
  }
}

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Sem conexão', { status: 503, statusText: 'Offline' })
  }
}

// Background Sync — dispara quando o dispositivo volta a ter internet
self.addEventListener('sync', (event) => {
  if (event.tag === 'ja-paguei-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach(client => client.postMessage({ type: 'SW_SYNC' }))
      })
    )
  }
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow('/dashboard')
    })
  )
})
