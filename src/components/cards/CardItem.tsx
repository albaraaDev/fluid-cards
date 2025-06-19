'use client'

import { useCards } from '@/hooks/useCards'
import { Card, CollectionColor } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  Edit3,
  Eye,
  EyeOff,
  MoreVertical,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { useState } from 'react'

interface CardItemProps {
  card: Card
  collectionColor: CollectionColor
}

export default function CardItem({ card, collectionColor }: CardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { toggleBookmark, deleteCard } = useCards()

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ar 
    })
  }

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleBookmark(card.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
      await deleteCard(card.id)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <motion.div
      className="relative"
      whileHover={{ y: -2 }}
      onHoverStart={() => setShowMenu(true)}
      onHoverEnd={() => setShowMenu(false)}
    >
      <div 
        className={`
          glass glass-${card.color || collectionColor} p-6 rounded-3xl cursor-pointer
          group relative overflow-hidden min-h-[160px]
        `}
        onClick={handleFlip}
      >
        {/* Card Content */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              // Front Side
              <motion.div
                key="front"
                initial={{ rotateY: 0 }}
                exit={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full" />
                      <span className="text-xs text-white/60">الوجه الأمامي</span>
                    </div>
                    <p className="text-white font-medium text-lg leading-relaxed">
                      {card.front_text}
                    </p>
                  </div>

                  {/* Flip Indicator */}
                  <motion.div
                    animate={{ rotate: isFlipped ? 180 : 0 }}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Show/Hide Indicator */}
                <div className="flex items-center justify-center pt-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">اضغط لرؤية الإجابة</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Back Side
              <motion.div
                key="back"
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -90 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-xs text-white/60">الوجه الخلفي</span>
                    </div>
                    <p className="text-white font-medium text-lg leading-relaxed">
                      {card.back_text}
                    </p>
                    
                    {card.notes && (
                      <div className="mt-4 p-3 glass rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          <span className="text-xs text-white/60">ملاحظات</span>
                        </div>
                        <p className="text-white/80 text-sm">
                          {card.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Flip Indicator */}
                  <motion.div
                    animate={{ rotate: isFlipped ? 180 : 0 }}
                    className="text-white/40 hover:text-white/70 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Show/Hide Indicator */}
                <div className="flex items-center justify-center pt-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm">اضغط لإخفاء الإجابة</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleBookmark}
              className={`
                p-2 rounded-lg transition-all duration-300
                ${card.is_bookmarked 
                  ? 'text-yellow-400 glass-strong' 
                  : 'text-white/60 hover:text-yellow-400 hover:glass'
                }
              `}
            >
              {card.is_bookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </motion.button>

            {/* Time */}
            <span className="text-xs text-white/50">
              {getTimeAgo(card.updated_at)}
            </span>
          </div>

          {/* Actions Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:glass transition-all duration-300"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:glass transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  )
}