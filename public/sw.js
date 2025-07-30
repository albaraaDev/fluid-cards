// Service Worker for Fluid Cards PWA
const CACHE_NAME = 'fluid-cards-v3';

// استراتيجية الكاش: Cache First للملفات الأساسية
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // كاش الصفحات الأساسية أولاً
        const essentialUrls = [
          '/',
          '/cards',
          '/study', 
          '/stats',
          '/tests',
          '/offline.html',
          '/manifest.json'
        ];
        
        console.log('✅ SW: Caching essential pages...');
        await cache.addAll(essentialUrls);
        
        console.log('✅ SW: Installation complete');
        return self.skipWaiting();
      } catch (error) {
        console.error('❌ SW: Installation failed:', error);
      }
    })()
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔧 SW: Activating...');
  
  event.waitUntil(
    (async () => {
      // مسح الكاش القديم
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('🗑️ SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
      
      console.log('✅ SW: Activation complete');
      return self.clients.claim();
    })()
  );
});

// Fetch event - الجزء المهم!
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل الطلبات غير GET
  if (request.method !== 'GET') {
    return;
  }

  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // تجاهل طلبات Hot Reload في التطوير
  if (url.pathname.includes('_next/webpack') || 
      url.pathname.includes('_next/static/chunks/webpack') ||
      url.searchParams.has('_next')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // 1. للصفحات الأساسية: Cache First
    if (isNavigationRequest(request)) {
      console.log('🔄 SW: Navigation request for:', url.pathname);
      
      // جرب الكاش أولاً
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('📦 SW: Serving navigation from cache');
        return cachedResponse;
      }
      
      // جرب الشبكة
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // كاش الاستجابة للمرة القادمة
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (networkError) {
        console.log('🌐 SW: Network failed for navigation, serving offline page');
      }
      
      // إذا فشل كل شيء، أرجع صفحة offline
      const offlineResponse = await cache.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
      
      // Fallback أخير
      return new Response(
        createOfflinePage(),
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 200
        }
      );
    }
    
    // 2. للملفات الثابتة: Cache First مع Network Fallback
    if (isStaticAsset(url)) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('📦 SW: Serving static asset from cache:', url.pathname);
        return cachedResponse;
      }
      
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (error) {
        console.log('❌ SW: Failed to fetch static asset:', url.pathname);
      }
    }
    
    // 3. للطلبات الأخرى: Network First مع Cache Fallback
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // كاش الاستجابات الناجحة
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.log('🌐 SW: Network failed, checking cache for:', url.pathname);
      
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // إذا لم يوجد في الكاش، أرجع خطأ مناسب
      throw error;
    }
    
  } catch (error) {
    console.error('❌ SW: Request failed completely:', error);
    
    // للملفات المهمة، حاول إرجاع صفحة offline
    if (isNavigationRequest(request)) {
      const offlineResponse = await cache.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
      
      return new Response(
        createOfflinePage(),
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 200
        }
      );
    }
    
    // للملفات الأخرى، أرجع 404
    return new Response('Not found', { status: 404 });
  }
}

// Helper functions
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.startsWith('/static/') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.jpg') ||
         url.pathname.includes('.svg') ||
         url.pathname.includes('.ico') ||
         url.pathname.includes('.woff') ||
         url.pathname.includes('.woff2');
}

function createOfflinePage() {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fluid Cards - غير متصل</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: white; min-height: 100vh; display: flex; align-items: center;
            justify-content: center; direction: rtl; text-align: center; padding: 2rem;
        }
        .container {
            background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
            border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); padding: 2rem; max-width: 500px;
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; color: #3b82f6; }
        p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9; }
        .button {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white;
            border: none; padding: 1rem 2rem; font-size: 1.1rem; font-weight: 600;
            border-radius: 16px; cursor: pointer; text-decoration: none;
            display: inline-block; min-width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="font-size: 4rem; margin-bottom: 1.5rem;">📚</div>
        <h1>Fluid Cards</h1>
        <p>أنت الآن في الوضع غير المتصل. يمكنك الاستمرار في استخدام التطبيق.</p>
        <button class="button" onclick="window.location.reload()">إعادة المحاولة</button>
    </div>
</body>
</html>`;
}

// Handle messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});