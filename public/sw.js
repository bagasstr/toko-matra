// Service Worker untuk optimasi cache dan performance
const CACHE_NAME = 'matrakosala-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const API_CACHE = 'api-v1.0.0'
const IMAGE_CACHE = 'images-v1.0.0'

// Resources untuk di-cache
const STATIC_RESOURCES = [
  '/',
  '/assets/Logo-TokoMatra.png',
  '/assets/matrakosala.svg',
  '/manifest.json',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_RESOURCES)
    })
  )
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== API_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle images with cache-first strategy
  if (request.destination === 'image' || url.pathname.includes('/api/images/')) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Handle static assets with cache-first strategy
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // Handle navigation with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME))
    return
  }
})

// Cache-first strategy untuk static assets dan images
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Cache-first strategy failed:', error)
    
    // Fallback untuk images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Error</text></svg>',
        {
          headers: { 'Content-Type': 'image/svg+xml' },
        }
      )
    }

    throw error
  }
}

// Network-first strategy untuk API dan dynamic content
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Network request failed, trying cache:', error)
    
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback response untuk navigation
    if (request.mode === 'navigate') {
      const fallbackResponse = await cache.match('/')
      if (fallbackResponse) {
        return fallbackResponse
      }
    }

    throw error
  }
}

// Background sync untuk offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic if needed
  console.log('Background sync triggered')
} 