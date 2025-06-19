'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Check,
  Clock,
  Target,
  TrendingUp,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Notification {
  id: string
  type: 'reminder' | 'achievement' | 'tip' | 'update'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock notifications - في التطبيق الحقيقي، ستأتي من API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'وقت المراجعة! 📚',
    message: 'لديك 15 بطاقة جاهزة للمراجعة في مجموعة "اللغة الإنجليزية"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    action: {
      label: 'ابدأ المراجعة',
      href: '/study?collection=1&mode=normal'
    }
  },
  {
    id: '2',
    type: 'achievement',
    title: 'إنجاز جديد! 🏆',
    message: 'تهانينا! لقد حققت سلسلة دراسة لمدة 7 أيام متتالية',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    action: {
      label: 'عرض الإنجازات',
      href: '/achievements'
    }
  },
  {
    id: '3',
    type: 'tip',
    title: 'نصيحة دراسية 💡',
    message: 'جرب استخدام الملاحظات في البطاقات لتحسين ذاكرتك',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true
  },
  {
    id: '4',
    type: 'update',
    title: 'ميزة جديدة! ✨',
    message: 'تم إضافة نظام البحث المتقدم لتسهيل العثور على البطاقات',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    action: {
      label: 'جرب البحث',
      href: '/search'
    }
  }
]

export default function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return Clock
      case 'achievement':
        return Award
      case 'tip':
        return Target
      case 'update':
        return TrendingUp
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return 'blue'
      case 'achievement':
        return 'yellow'
      case 'tip':
        return 'green'
      case 'update':
        return 'purple'
      default:
        return 'blue'
    }
  }

  return (
    <>
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onOpenChange(true)}
        className="glass p-3 h-12 w-12 relative"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white/20 flex items-center justify-center"
          >
            <span className="text-xs text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </Button>

      {/* Notification Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-strong border-0 max-w-md mx-auto max-h-[80vh] overflow-hidden">
          <DialogHeader className="text-right">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-xl font-bold">
                الإشعارات
              </DialogTitle>
              
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  تحديد الكل كمقروء
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  لا توجد إشعارات
                </h3>
                <p className="text-white/70">
                  ستظهر الإشعارات الجديدة هنا
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const IconComponent = getNotificationIcon(notification.type)
                  const color = getNotificationColor(notification.type)

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        glass p-4 rounded-2xl relative group
                        ${!notification.read ? 'ring-2 ring-blue-400/30' : ''}
                      `}
                    >
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute top-3 left-3 w-2 h-2 bg-blue-400 rounded-full" />
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:glass rounded"
                      >
                        <X className="w-4 h-4 text-white/60 hover:text-white" />
                      </button>

                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`
                          w-10 h-10 glass-${color} rounded-xl flex items-center justify-center flex-shrink-0
                        `}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-white text-sm">
                              {notification.title}
                            </h4>
                          </div>
                          
                          <p className="text-white/80 text-sm leading-relaxed mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50">
                              {formatDistanceToNow(notification.timestamp, { 
                                addSuffix: true, 
                                locale: ar 
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:glass rounded transition-all duration-200"
                                >
                                  <Check className="w-4 h-4 text-green-400" />
                                </button>
                              )}

                              {notification.action && (
                                <Button
                                  size="sm"
                                  className="glass-button px-3 py-1 text-xs"
                                  onClick={() => {
                                    if (notification.action?.onClick) {
                                      notification.action.onClick()
                                    } else if (notification.action?.href) {
                                      window.location.href = notification.action.href
                                    }
                                    markAsRead(notification.id)
                                  }}
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                سيتم حذف الإشعارات تلقائياً بعد 30 يوماً
              </p>
            </div>
          )}

          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 2px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 2px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </>
  )
}