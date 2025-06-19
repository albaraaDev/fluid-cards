'use client'

import { Collection } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'

interface CollectionCardProps {
  collection: Collection
  viewMode: 'grid' | 'list'
}

export default function CollectionCard({ collection, viewMode }: CollectionCardProps) {
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ar 
    })
  }

  const cardVariants = {
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: 0.98
    }
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/collections/${collection.id}`}>
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          className={`
            glass glass-${collection.color} p-4 cursor-pointer 
            group relative overflow-hidden
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl glass-${collection.color} 
                flex items-center justify-center text-xl
                group-hover:scale-110 transition-transform duration-300
              `}>
                {collection.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {collection.name}
                </h3>
                <p className="text-sm text-white/70 truncate">
                  {collection.description}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {collection.cards_count} بطاقة
                  </span>
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {getTimeAgo(collection.updated_at)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/collections/${collection.id}`}>
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        className={`
          glass glass-${collection.color} p-6 cursor-pointer 
          group relative overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-12 h-12 rounded-xl glass-${collection.color} 
            flex items-center justify-center text-2xl
            group-hover:scale-110 transition-transform duration-300
          `}>
            {collection.icon}
          </div>
          
          <button className="p-1 rounded-lg hover:glass transition-all duration-200">
            <MoreVertical className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white text-lg group-hover:text-gradient transition-all duration-300">
            {collection.name}
          </h3>
          
          {collection.description && (
            <p className="text-sm text-white/70 line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1 text-white/60">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">
              {collection.cards_count} بطاقة
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-white/60">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">
              {getTimeAgo(collection.updated_at)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60">التقدم</span>
            <span className="text-xs text-white/60">75%</span>
          </div>
          <div className="w-full h-2 glass rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />

        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </Link>
  )
}