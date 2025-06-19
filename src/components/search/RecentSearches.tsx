'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clock, Search, Trash2, X } from 'lucide-react'

interface RecentSearchesProps {
  searches: string[]
  onSearchSelect: (search: string) => void
  onClear: () => void
}

export default function RecentSearches({ 
  searches, 
  onSearchSelect, 
  onClear 
}: RecentSearchesProps) {
  if (searches.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-3xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          البحثات الأخيرة
        </h3>
        
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-red-400 glass px-3 py-1 text-xs"
        >
          <Trash2 className="w-3 h-3 ml-1" />
          مسح الكل
        </Button>
      </div>

      {/* Recent Searches List */}
      <div className="space-y-2">
        {searches.map((search, index) => (
          <motion.button
            key={search}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSearchSelect(search)}
            className="w-full flex items-center justify-between p-3 glass hover:glass-strong rounded-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 glass rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-4 h-4 text-purple-400" />
              </div>
              
              <span className="text-white font-medium truncate">
                {search}
              </span>
            </div>
            
            <div className="text-white/40 group-hover:text-white/70 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-xs text-white/50">
          اضغط على أي بحث للبحث مرة أخرى
        </p>
      </div>
    </motion.div>
  )
}