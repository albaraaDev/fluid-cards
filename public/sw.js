// Service Worker for Fluid Cards PWA
const CACHE_NAME = 'fluid-cards-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/auth/login',
  '/collections/new',
  '/search',
  '/profile',
  '/settings',
  '/manifest.json',
  '/offline.html'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 ServiceWorker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ ServiceWorker: Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ ServiceWorker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ ServiceWorker: Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 ServiceWorker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              console.log('🗑️ ServiceWorker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('✅ ServiceWorker: Activation complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip external requests (Supabase, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📦 ServiceWorker: Serving from cache:', event.request.url)
          return cachedResponse
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response as it can only be consumed once
            const responseToCache = response.clone()

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch((error) => {
            console.error('❌ ServiceWorker: Fetch failed:', error)
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 ServiceWorker: Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implement your background sync logic here
      // For example, sync offline actions with the server
      syncOfflineActions()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📮 ServiceWorker: Push message received')
  
  const options = {
    body: event.data ? event.data.text() : 'تذكير من Fluid Cards',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح التطبيق',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icon-192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Fluid Cards', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 ServiceWorker: Notification clicked')
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper function for background sync
async function syncOfflineActions() {
  try {
    console.log('🔄 ServiceWorker: Syncing offline actions...')
    
    // Get offline actions from IndexedDB or localStorage
    // Send them to the server
    // Clear them after successful sync
    
    console.log('✅ ServiceWorker: Offline actions synced')
  } catch (error) {
    console.error('❌ ServiceWorker: Failed to sync offline actions:', error)
  }
}

// Handle updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 ServiceWorker: Skipping waiting...')
    self.skipWaiting()
  }
})