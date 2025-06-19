'use client'

import { Collection } from '@/types'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react'

interface StatsOverviewProps {
  collections: Collection[]
}

export default function StatsOverview({ collections }: StatsOverviewProps) {
  const totalCards = collections.reduce((sum, collection) => sum + (collection.cards_count || 0), 0)
  const totalCollections = collections.length
  const studyStreak = 7 // Mock data
  const studyTime = 45 // Mock data in minutes

  const stats = [
    {
      icon: BookOpen,
      label: 'البطاقات',
      value: totalCards,
      suffix: '',
      color: 'blue'
    },
    {
      icon: Target,
      label: 'المجموعات',
      value: totalCollections,
      suffix: '',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      label: 'معدل النجاح',
      value: 87,
      suffix: '%',
      color: 'green'
    },
    {
      icon: Clock,
      label: 'وقت الدراسة',
      value: studyTime,
      suffix: 'د',
      color: 'orange'
    }
  ]

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
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            className={`
              glass glass-${stat.color} p-4 cursor-pointer
              group relative overflow-hidden
            `}
          >
            {/* Background Glow */}
            <div className={`
              absolute inset-0 bg-gradient-to-br 
              from-${stat.color}-400/10 to-${stat.color}-600/10 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `} />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg glass-${stat.color} 
                flex items-center justify-center mb-3
                group-hover:scale-110 transition-transform duration-300
              `}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-baseline gap-1"
                >
                  <span className="text-2xl font-bold text-white">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-sm text-white/70">
                      {stat.suffix}
                    </span>
                  )}
                </motion.div>
                
                <p className="text-xs text-white/60 font-medium">
                  {stat.label}
                </p>
              </div>

              {/* Progress indicator for some stats */}
              {stat.label === 'معدل النجاح' && (
                <div className="mt-3">
                  <div className="w-full h-1 glass rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        )
      })}
    </motion.div>
  )
}