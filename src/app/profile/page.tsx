'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCollections } from '@/hooks/useCollections'
import { useAuth } from '@/lib/auth-provider'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Clock,
  Edit3,
  LogOut,
  Mail,
  Palette,
  Save,
  Settings,
  Shield,
  Target,
  TrendingUp,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserStats {
  totalCollections: number
  totalCards: number
  studyStreak: number
  averageAccuracy: number
  totalStudyTime: number
  joinedDate: string
}

function ProfilePageContent() {
  const { user, signOut } = useAuth()
  const { collections } = useCollections()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [stats, setStats] = useState<UserStats | null>(null)

  // حساب الإحصائيات
  useEffect(() => {
    if (user && collections) {
      const totalCards = collections.reduce((sum, c) => sum + (c.cards_count || 0), 0)
      
      const userStats: UserStats = {
        totalCollections: collections.length,
        totalCards,
        studyStreak: 7, // Mock data - يجب حسابها من قاعدة البيانات
        averageAccuracy: 85, // Mock data
        totalStudyTime: 1250, // Mock data in minutes
        joinedDate: user.created_at || new Date().toISOString()
      }
      
      setStats(userStats)
    }
  }, [user, collections])

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setEditedName(user.user_metadata.full_name)
    }
  }, [user])

  const handleSaveName = async () => {
    // TODO: Update user name in Supabase
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    return hours > 0 ? `${hours} ساعة` : `${minutes} دقيقة`
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-8 rounded-3xl text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            جاري التحميل...
          </h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-gradient mb-2">
            الملف الشخصي
          </h1>
          <p className="text-white/70">
            معلوماتك وإحصائياتك الشخصية
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong p-8 rounded-3xl space-y-6"
        >
          {/* Avatar and Basic Info */}
          <div className="text-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 mx-auto glass border-4 border-white/20">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-2xl font-bold">
                  {getInitials(user.user_metadata?.full_name || user.email || '')}
                </AvatarFallback>
              </Avatar>
              
              <button className="absolute bottom-0 right-1/2 translate-x-6 translate-y-2 w-8 h-8 glass-strong rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="glass-input text-center text-xl font-bold"
                    placeholder="اسمك الكامل"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleSaveName}
                      size="sm"
                      className="glass-button px-4"
                    >
                      <Save className="w-4 h-4 ml-1" />
                      حفظ
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedName(user.user_metadata?.full_name || '')
                      }}
                      variant="outline"
                      size="sm"
                      className="glass border-white/30 text-white px-4"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {user.user_metadata?.full_name || 'مستخدم'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:glass rounded transition-all duration-200"
                    >
                      <Edit3 className="w-4 h-4 text-white/60 hover:text-white" />
                    </button>
                  </div>
                  
                  <p className="text-white/70 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  
                  <p className="text-white/50 flex items-center justify-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    انضممت {formatDistanceToNow(new Date(stats.joinedDate), { addSuffix: true, locale: ar })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="glass p-6 rounded-3xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 glass-blue rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalCollections}
            </div>
            <div className="text-sm text-white/70">مجموعة</div>
          </div>

          <div className="glass p-6 rounded-3xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 glass-purple rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.totalCards}
            </div>
            <div className="text-sm text-white/70">بطاقة</div>
          </div>

          <div className="glass p-6 rounded-3xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 glass-green rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {stats.averageAccuracy}%
            </div>
            <div className="text-sm text-white/70">معدل الدقة</div>
          </div>

          <div className="glass p-6 rounded-3xl text-center">
            <div className="w-12 h-12 mx-auto mb-3 glass-orange rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {formatStudyTime(stats.totalStudyTime)}
            </div>
            <div className="text-sm text-white/70">وقت الدراسة</div>
          </div>
        </motion.div>

        {/* Study Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              سلسلة الدراسة
            </h3>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.studyStreak} 🔥
            </div>
          </div>
          
          <p className="text-white/70 text-sm mb-4">
            لقد درست لمدة {stats.studyStreak} أيام متتالية! استمر لتحافظ على السلسلة.
          </p>
          
          <div className="w-full h-2 glass rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.studyStreak % 7) * 14.28}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span>الهدف: 7 أيام</span>
            <span>{7 - (stats.studyStreak % 7)} أيام متبقية</span>
          </div>
        </motion.div>

        {/* Achievement Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-3xl"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            الإنجازات الأخيرة
          </h3>
          
          <div className="space-y-3">
            {[
              { icon: '🎯', title: 'أول مجموعة', desc: 'أنشأت مجموعتك الأولى' },
              { icon: '📚', title: 'قارئ نشط', desc: 'راجعت 50 بطاقة' },
              { icon: '🔥', title: 'المتسق', desc: 'درست لـ 7 أيام متتالية' },
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-3 glass rounded-2xl"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">
                    {achievement.title}
                  </h4>
                  <p className="text-white/60 text-xs">
                    {achievement.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Settings & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {[
            { icon: Settings, label: 'الإعدادات', action: () => {} },
            { icon: Bell, label: 'الإشعارات', action: () => {} },
            { icon: Palette, label: 'المظهر', action: () => {} },
            { icon: Shield, label: 'الخصوصية والأمان', action: () => {} },
          ].map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300 group"
            >
              <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-blue-400" />
              </div>
              
              <span className="flex-1 text-right text-white font-medium group-hover:text-gradient transition-all duration-300">
                {item.label}
              </span>
              
              <div className="text-white/40 group-hover:text-white/70 transition-colors">
                <Settings className="w-4 h-4" />
              </div>
            </motion.button>
          ))}

          {/* Sign Out Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300 group border border-red-400/30"
          >
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            
            <span className="flex-1 text-right text-red-400 font-medium">
              تسجيل الخروج
            </span>
            
            <div className="text-red-400/70 group-hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}