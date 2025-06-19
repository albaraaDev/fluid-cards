'use client'

import NotificationCenter from '@/components/notifications/NotificationCenter'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-provider'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function WelcomeHeader() {
  const { user } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء الخير'
    return 'مساء الخير'
  }

  const getGreetingIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '☀️'
    if (hour < 17) return '🌤️'
    return '🌙'
  }

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'صديقي'
  }

  const getFirstName = () => {
    const fullName = getUserName()
    return fullName.split(' ')[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-1"
        >
          <span className="text-2xl">{getGreetingIcon()}</span>
          <h1 className="text-lg font-medium text-white/80">
            {getGreeting()}
          </h1>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gradient"
        >
          {getFirstName()}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/60 mt-1"
        >
          مستعد لجلسة تعلم جديدة؟
        </motion.p>
      </div>

      <div className="flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <NotificationCenter 
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="glass p-3 h-12 w-12"
            >
              <Settings className="w-5 h-5 text-white" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}