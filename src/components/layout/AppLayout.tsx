'use client'

import BottomNavigation from '@/components/navigation/BottomNavigation'
import { useAuth } from '@/lib/auth-provider'
import { usePathname } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // الصفحات التي لا تحتاج للمصادقة
  const publicPages = ['/auth/login', '/auth/register', '/auth/callback', '/auth/forgot-password']
  const isPublicPage = publicPages.includes(pathname)

  // إذا كانت صفحة عامة، لا نعرض التنقل السفلي
  if (isPublicPage) {
    return (
      <div className="min-h-screen">
        {/* Background Pattern للصفحات العامة */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-delayed" />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl floating" />
        </div>

        <main className="relative bg-black/40">
          {children}
        </main>
      </div>
    )
  }

  // إذا كان المستخدم لم يسجل دخوله وليست صفحة عامة، اعرض صفحة تسجيل الدخول
  if (!loading && !user) {
    return (
      <div className="min-h-screen">
        {/* Background Pattern */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-delayed" />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl floating" />
        </div>
        
        {/* توجيه المستخدم لتسجيل الدخول */}
        {children}
      </div>
    )
  }

  // Layout للمستخدمين المسجلين
  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-delayed" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl floating" />
      </div>

      {/* Main Content */}
      <main className="relative min-h-screen pb-20">
        {children}
      </main>

      {/* Bottom Navigation للمستخدمين المسجلين فقط */}
      {user && <BottomNavigation />}
    </div>
  )
}