// src/app/layout.tsx
import AppHeader from '@/components/AppHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { AppProvider } from '@/context/AppContext';
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
});

// const APP_VERSION = "2.0.0";

export const metadata: Metadata = {
  title: {
    default: 'Fluid Cards - بطاقات تعليمية ذكية',
    template: '%s | Fluid Cards',
  },
  description:
    'تطبيق بطاقات تعليمية ذكي مع تصميم زجاجي عصري. ادرس وراجع بطريقة تفاعلية وممتعة.',
  keywords: [
    'بطاقات تعليمية',
    'مراجعة',
    'دراسة',
    'تعليم',
    'فلاش كاردز',
    'مذاكرة',
  ],
  authors: [{ name: 'Fluid Cards Team' }],
  creator: 'Fluid Cards',
  publisher: 'Fluid Cards',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
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
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body
        className={`bg-slate-900 text-white antialiased overflow-x-hidden ${cairo.className} font-sans antialiased`}
      >
        <AppProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
            {/* Header */}
            <AppHeader />

            {/* Main Content */}
            <main className="py-10 min-h-screen">{children}</main>

            {/* Bottom Navigation */}
            <BottomNavigation />
          </div>
        </AppProvider>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    // إلغاء تسجيل SW القديم
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                      await registration.unregister();
                    }
                    
                    // تسجيل SW جديد
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('✅ SW registered successfully:', registration);
                    
                    // التحديث التلقائي
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New SW available, reloading...');
                            window.location.reload();
                          }
                        });
                      }
                    });
                  } catch (error) {
                    console.error('❌ SW registration failed:', error);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
