'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Bookmark,
  Clock,
  Play,
  Search,
  Shuffle
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    icon: Play,
    label: 'مراجعة سريعة',
    description: 'ابدأ مراجعة البطاقات',
    href: '/study/quick',
    color: 'green',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    icon: Shuffle,
    label: 'مراجعة عشوائية',
    description: 'بطاقات مختلطة',
    href: '/study/random',
    color: 'purple',
    gradient: 'from-purple-400 to-violet-500'
  },
  {
    icon: Bookmark,
    label: 'البطاقات المحفوظة',
    description: 'راجع المحفوظات',
    href: '/bookmarks',
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    icon: BarChart3,
    label: 'الإحصائيات',
    description: 'تتبع تقدمك',
    href: '/stats',
    color: 'blue',
    gradient: 'from-blue-400 to-cyan-500'
  }
]

export default function QuickActions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-white">الإجراءات السريعة</h2>
        <div className="flex items-center gap-1 text-white/60">
          <Clock className="w-4 h-4" />
          <span className="text-sm">توفير الوقت</span>
        </div>
      </motion.div>

      {/* Quick Study Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-strong p-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                🎯 هدف اليوم
              </h3>
              <p className="text-sm text-white/70 mb-4">
                راجع 20 بطاقة لتحقيق هدفك اليومي
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">التقدم</span>
                    <span className="text-xs text-white/60">15/20</span>
                  </div>
                  <div className="w-full h-2 glass rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <Link href="/study/continue">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button text-sm"
                >
                  <Play className="w-4 h-4 ml-2" />
                  متابعة المراجعة
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer opacity-50" />
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <motion.div key={action.label} variants={itemVariants}>
              <Link href={action.href}>
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    glass glass-${action.color} p-4 cursor-pointer
                    group relative overflow-hidden h-full
                  `}
                >
                  {/* Icon with Gradient Background */}
                  <div className="relative mb-3">
                    <div className={`
                      w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient}
                      flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Glow Effect */}
                    <div className={`
                      absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient}
                      opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg
                    `} />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm group-hover:text-gradient transition-all duration-300">
                      {action.label}
                    </h3>
                    <p className="text-xs text-white/60 leading-tight">
                      {action.description}
                    </p>
                  </div>

                  {/* Hover Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300"
                    whileHover={{
                      boxShadow: `0 0 20px ${action.color === 'green' ? 'rgba(34, 197, 94, 0.3)' : 
                                             action.color === 'purple' ? 'rgba(147, 51, 234, 0.3)' :
                                             action.color === 'amber' ? 'rgba(245, 158, 11, 0.3)' :
                                             'rgba(59, 130, 246, 0.3)'}`
                    }}
                  />

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}