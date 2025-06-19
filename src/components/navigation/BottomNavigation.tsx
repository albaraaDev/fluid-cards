'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Home,
  Plus,
  Search,
  User
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    name: 'الرئيسية',
    href: '/',
    icon: Home,
  },
  {
    name: 'البحث',
    href: '/search',
    icon: Search,
  },
  {
    name: 'إضافة',
    href: '/add',
    icon: Plus,
    isAction: true
  },
  {
    name: 'مجموعاتي',
    href: '/collections',
    icon: BookOpen,
  },
  {
    name: 'الملف الشخصي',
    href: '/profile',
    icon: User,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="glass-nav px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            if (item.isAction) {
              return (
                <Link key={item.name} href={item.href}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-14 h-14 glass-strong rounded-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-80" />
                    <Icon className="relative z-10 w-6 h-6 text-white" />
                    
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-30 blur-lg scale-110" />
                  </motion.button>
                </Link>
              )
            }

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
                >
                  <div className={`
                    relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'glass-strong' 
                      : 'hover:glass'
                    }
                  `}>
                    <Icon className={`
                      w-5 h-5 transition-colors duration-300
                      ${isActive 
                        ? 'text-blue-300' 
                        : 'text-white/70 hover:text-white'
                      }
                    `} />
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-400/30"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                  
                  <span className={`
                    text-xs mt-1 transition-colors duration-300 font-medium
                    ${isActive 
                      ? 'text-blue-200' 
                      : 'text-white/60'
                    }
                  `}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}