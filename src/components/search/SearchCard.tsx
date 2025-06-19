'use client'

import { CollectionColor } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Search
} from 'lucide-react'
import Link from 'next/link'

interface SearchCardData {
  id: string
  front_text: string
  back_text: string
  collection_id: string
  collection_name: string
  color: CollectionColor
  created_at: string
  is_bookmarked: boolean
}

interface SearchCardProps {
  card: SearchCardData
  searchTerm: string
}

export default function SearchCard({ card, searchTerm }: SearchCardProps) {
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ar 
    })
  }

  // تظليل النص المطابق للبحث
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark 
          key={index} 
          className="bg-yellow-400/30 text-yellow-200 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <Link href={`/collections/${card.collection_id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          glass glass-${card.color} p-6 cursor-pointer 
          group relative overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl glass-${card.color} 
              flex items-center justify-center
            `}>
              <Search className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {card.collection_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="w-3 h-3 text-white/50" />
                <span className="text-xs text-white/50">بطاقة تعليمية</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {card.is_bookmarked && (
              <div className="text-yellow-400">
                <BookmarkCheck className="w-4 h-4" />
              </div>
            )}
            <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Front Text */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-xs text-white/60">السؤال</span>
            </div>
            <p className="text-white font-medium leading-relaxed">
              {highlightText(card.front_text, searchTerm)}
            </p>
          </div>

          {/* Back Text */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-white/60">الإجابة</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              {highlightText(card.back_text, searchTerm)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">
              {getTimeAgo(card.created_at)}
            </span>
          </div>
          
          <div className="text-xs text-white/50">
            مطابق للبحث
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