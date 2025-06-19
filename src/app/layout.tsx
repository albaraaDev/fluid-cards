import AppLayout from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-provider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fluid Cards - بطاقات تعليمية ذكية',
  description: 'تطبيق البطاقات التعليمية الذكي مع تصميم زجاجي عصري',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>

        {/* Toast Notifications */}
        <Toaster 
          position="top-center"
          expand={false}
          richColors
          closeButton
        />
      </body>
    </html>
  )
}