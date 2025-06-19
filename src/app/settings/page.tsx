'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-provider'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Download,
  Globe,
  HelpCircle,
  Info,
  Moon,
  RefreshCw,
  Shield,
  Sun,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SettingItem {
  id: string
  title: string
  description: string
  icon: any
  type: 'toggle' | 'action' | 'link'
  value?: boolean
  action?: () => void
  href?: string
  variant?: 'default' | 'warning' | 'danger'
}

function SettingsPageContent() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [sounds, setSounds] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)

  const settingsGroups = [
    {
      title: 'التخصيص',
      icon: '🎨',
      settings: [
        {
          id: 'notifications',
          title: 'الإشعارات',
          description: 'تلقي تذكيرات للمراجعة والدراسة',
          icon: Bell,
          type: 'toggle',
          value: notifications,
          action: () => setNotifications(!notifications)
        },
        {
          id: 'dark-mode',
          title: 'الوضع المظلم',
          description: 'تفعيل المظهر المظلم للتطبيق',
          icon: darkMode ? Moon : Sun,
          type: 'toggle',
          value: darkMode,
          action: () => setDarkMode(!darkMode)
        },
        {
          id: 'sounds',
          title: 'الأصوات',
          description: 'تشغيل الأصوات والتأثيرات الصوتية',
          icon: sounds ? Volume2 : VolumeX,
          type: 'toggle',
          value: sounds,
          action: () => setSounds(!sounds)
        }
      ]
    },
    {
      title: 'البيانات والنسخ الاحتياطي',
      icon: '💾',
      settings: [
        {
          id: 'auto-backup',
          title: 'النسخ الاحتياطي التلقائي',
          description: 'حفظ بياناتك تلقائياً في السحابة',
          icon: autoBackup ? CheckCircle : RefreshCw,
          type: 'toggle',
          value: autoBackup,
          action: () => setAutoBackup(!autoBackup)
        },
        {
          id: 'export-data',
          title: 'تصدير البيانات',
          description: 'تحميل نسخة من جميع مجموعاتك وبطاقاتك',
          icon: Download,
          type: 'action',
          action: () => alert('سيتم تنفيذ هذه الميزة قريباً')
        },
        {
          id: 'clear-cache',
          title: 'مسح التخزين المؤقت',
          description: 'حذف الملفات المؤقتة لتحسين الأداء',
          icon: RefreshCw,
          type: 'action',
          action: () => alert('تم مسح التخزين المؤقت'),
          variant: 'warning'
        }
      ]
    },
    {
      title: 'الأمان والخصوصية',
      icon: '🔒',
      settings: [
        {
          id: 'privacy',
          title: 'إعدادات الخصوصية',
          description: 'إدارة خصوصية بياناتك ومشاركتها',
          icon: Shield,
          type: 'link',
          href: '/privacy'
        },
        {
          id: 'delete-account',
          title: 'حذف الحساب',
          description: 'حذف حسابك وجميع بياناتك نهائياً',
          icon: Trash2,
          type: 'action',
          action: () => alert('تتطلب هذه العملية تأكيد إضافي'),
          variant: 'danger'
        }
      ]
    },
    {
      title: 'المساعدة والدعم',
      icon: '❓',
      settings: [
        {
          id: 'help',
          title: 'مركز المساعدة',
          description: 'العثور على إجابات للأسئلة الشائعة',
          icon: HelpCircle,
          type: 'link',
          href: '/help'
        },
        {
          id: 'about',
          title: 'حول التطبيق',
          description: 'معلومات عن الإصدار والمطورين',
          icon: Info,
          type: 'link',
          href: '/about'
        }
      ]
    }
  ] as const

  const handleSettingAction = (setting: SettingItem) => {
    if (setting.type === 'toggle' && setting.action) {
      setting.action()
    } else if (setting.type === 'action' && setting.action) {
      setting.action()
    }
  }

  const getSettingVariantStyle = (variant?: string) => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-400/30 hover:border-yellow-400/50'
      case 'danger':
        return 'border-red-400/30 hover:border-red-400/50'
      default:
        return 'border-white/10 hover:border-white/20'
    }
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button
                variant="ghost"
                size="sm"
                className="glass p-3 h-12 w-12"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
              <p className="text-white/70 text-sm">تخصيص تجربة التطبيق</p>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 glass-strong rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">
                {user?.user_metadata?.full_name || 'مستخدم'}
              </h3>
              <p className="text-white/70 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-green-400">متصل</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + groupIndex * 0.1 }}
            className="space-y-4"
          >
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{group.icon}</span>
              <h2 className="text-lg font-semibold text-white">{group.title}</h2>
            </div>

            {/* Settings Items */}
            <div className="space-y-3">
              {group.settings.map((setting, settingIndex) => {
                const IconComponent = setting.icon

                return (
                  <motion.div
                    key={setting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + groupIndex * 0.1 + settingIndex * 0.05 }}
                    className={`
                      glass p-4 rounded-2xl border transition-all duration-300
                      ${getSettingVariantStyle(setting.variant)}
                      ${setting.type !== 'link' ? 'cursor-pointer hover:glass-strong' : ''}
                    `}
                    onClick={() => setting.type !== 'link' && handleSettingAction(setting)}
                  >
                    {setting.type === 'link' ? (
                      <Link href={setting.href || '#'} className="block">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-10 h-10 glass rounded-xl flex items-center justify-center
                              ${setting.variant === 'danger' ? 'text-red-400' :
                                setting.variant === 'warning' ? 'text-yellow-400' :
                                'text-blue-400'
                              }
                            `}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{setting.title}</h3>
                              <p className="text-white/60 text-sm">{setting.description}</p>
                            </div>
                          </div>
                          
                          <div className="text-white/40">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 glass rounded-xl flex items-center justify-center
                            ${setting.variant === 'danger' ? 'text-red-400' :
                              setting.variant === 'warning' ? 'text-yellow-400' :
                              'text-blue-400'
                            }
                          `}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{setting.title}</h3>
                            <p className="text-white/60 text-sm">{setting.description}</p>
                          </div>
                        </div>
                        
                        {setting.type === 'toggle' && (
                          <div className={`
                            w-12 h-6 rounded-full relative transition-all duration-300
                            ${setting.value ? 'bg-blue-500' : 'bg-white/20'}
                          `}>
                            <div className={`
                              w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300
                              ${setting.value ? 'translate-x-6' : 'translate-x-0.5'}
                            `} />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-4"
        >
          <p className="text-white/50 text-sm">
            Fluid Cards v1.0.0
          </p>
          <p className="text-white/40 text-xs mt-1">
            تم التطوير بـ ❤️ في المملكة العربية السعودية
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}