
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Fluid Cards - بطاقات تعليمية ذكية',
    template: '%s | Fluid Cards'
  },
  description: 'تطبيق بطاقات تعليمية ذكي مع تصميم زجاجي عصري. ادرس وراجع بطريقة تفاعلية وممتعة.',
  keywords: ['بطاقات تعليمية', 'مراجعة', 'دراسة', 'تعليم', 'فلاش كاردز', 'مذاكرة'],
  authors: [{ name: 'Fluid Cards Team' }],
  creator: 'Fluid Cards',
  publisher: 'Fluid Cards',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: '/',
    title: 'Fluid Cards - بطاقات تعليمية ذكية',
    description: 'تطبيق بطاقات تعليمية ذكي مع تصميم زجاجي عصري',
    siteName: 'Fluid Cards',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fluid Cards - بطاقات تعليمية ذكية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fluid Cards - بطاقات تعليمية ذكية',
    description: 'تطبيق بطاقات تعليمية ذكي مع تصميم زجاجي عصري',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#1e40af',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fluid Cards',
    startupImage: [
      {
        url: '/apple-startup-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-startup-828x1792.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'msapplication-TileColor': '#1e40af',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Fluid Cards" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fluid Cards" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Preload critical resources */}
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//supabase.co" />
        
        {/* Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#1e40af" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${cairo.className} font-sans antialiased`}>
        {/* Background Pattern */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-delayed" />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl floating" />
        </div>

        {/* Main App */}
        <div className="relative min-h-screen bg-black/40">
              {children}
        </div>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ ServiceWorker registration successful');
                    })
                    .catch(function(error) {
                      console.log('❌ ServiceWorker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />

        {/* Analytics and Performance Monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('📊 LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('📊 FID:', entry.processingStart - entry.startTime);
                    }
                  }
                });
                
                observer.observe({entryTypes: ['largest-contentful-paint', 'first-input']});
              }
            `,
          }}
        />
      </body>
    </html>
  )
}