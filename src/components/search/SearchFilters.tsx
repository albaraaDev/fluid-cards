'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CollectionColor } from '@/types'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Calendar,
  Check,
  Palette,
  RefreshCw
} from 'lucide-react'

interface SearchFilter {
  type: 'all' | 'collections' | 'cards'
  dateRange: 'all' | 'today' | 'week' | 'month'
  bookmarked: boolean
  colors: string[]
}

interface SearchFiltersProps {
  filters: SearchFilter
  onFiltersChange: (filters: SearchFilter) => void
}

const dateRangeOptions = [
  { value: 'all', label: 'كل الأوقات' },
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
]

const colorOptions: { value: CollectionColor; name: string; gradient: string }[] = [
  { value: 'blue', name: 'أزرق', gradient: 'from-blue-400 to-blue-600' },
  { value: 'purple', name: 'بنفسجي', gradient: 'from-purple-400 to-purple-600' },
  { value: 'green', name: 'أخضر', gradient: 'from-green-400 to-green-600' },
  { value: 'orange', name: 'برتقالي', gradient: 'from-orange-400 to-orange-600' },
  { value: 'red', name: 'أحمر', gradient: 'from-red-400 to-red-600' },
  { value: 'pink', name: 'وردي', gradient: 'from-pink-400 to-pink-600' },
  { value: 'indigo', name: 'نيلي', gradient: 'from-indigo-400 to-indigo-600' },
  { value: 'teal', name: 'أخضر مزرق', gradient: 'from-teal-400 to-teal-600' },
  { value: 'cyan', name: 'سماوي', gradient: 'from-cyan-400 to-cyan-600' },
  { value: 'emerald', name: 'زمردي', gradient: 'from-emerald-400 to-emerald-600' },
  { value: 'violet', name: 'بنفسجي فاتح', gradient: 'from-violet-400 to-violet-600' },
  { value: 'amber', name: 'عنبري', gradient: 'from-amber-400 to-amber-600' },
]

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilters = (updates: Partial<SearchFilter>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    
    updateFilters({ colors: newColors })
  }

  const resetFilters = () => {
    onFiltersChange({
      type: 'all',
      dateRange: 'all',
      bookmarked: false,
      colors: []
    })
  }

  const hasActiveFilters = filters.dateRange !== 'all' || 
                          filters.bookmarked || 
                          filters.colors.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong p-6 rounded-3xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-400" />
          فلترة النتائج
        </h3>
        
        {hasActiveFilters && (
          <Button
            onClick={resetFilters}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white glass px-3 py-1 text-xs"
          >
            <RefreshCw className="w-3 h-3 ml-1" />
            إعادة تعيين
          </Button>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label className="text-white font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          التاريخ
        </Label>
        
        <div className="grid grid-cols-2 gap-2">
          {dateRangeOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateFilters({ dateRange: option.value as any })}
              className={`
                px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${filters.dateRange === option.value 
                  ? 'glass-strong text-white ring-2 ring-blue-400/50' 
                  : 'glass text-white/70 hover:text-white hover:glass-strong'
                }
              `}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bookmarked Filter */}
      <div className="space-y-3">
        <Label className="text-white font-medium flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          المحتوى المفضل
        </Label>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateFilters({ bookmarked: !filters.bookmarked })}
          className={`
            w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-between
            ${filters.bookmarked 
              ? 'glass-strong text-white ring-2 ring-yellow-400/50' 
              : 'glass text-white/70 hover:text-white hover:glass-strong'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {filters.bookmarked ? (
              <Check className="w-4 h-4 text-yellow-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            البطاقات المحفوظة فقط
          </span>
          
          {filters.bookmarked && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          )}
        </motion.button>
      </div>

      {/* Color Filter */}
      <div className="space-y-3">
        <Label className="text-white font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          الألوان
        </Label>
        
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color, index) => (
            <motion.button
              key={color.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleColor(color.value)}
              className="relative group"
            >
              <div className={`
                w-10 h-10 rounded-xl bg-gradient-to-br ${color.gradient}
                flex items-center justify-center transition-all duration-300
                ${filters.colors.includes(color.value) 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
                  : 'hover:shadow-lg'
                }
              `}>
                {filters.colors.includes(color.value) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="glass px-2 py-1 rounded-lg">
                  <span className="text-xs text-white whitespace-nowrap">
                    {color.name}
                  </span>
                </div>
              </div>

              {/* Glow Effect */}
              {filters.colors.includes(color.value) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1.2 }}
                  className={`
                    absolute inset-0 rounded-xl bg-gradient-to-br ${color.gradient}
                    blur-lg -z-10
                  `}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {filters.colors.length > 0 && (
          <div className="text-xs text-white/60 text-center">
            {filters.colors.length} لون محدد
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl border border-blue-400/30"
        >
          <h4 className="text-blue-400 font-medium mb-2 text-sm">الفلاتر النشطة:</h4>
          <div className="space-y-1 text-xs text-white/70">
            {filters.dateRange !== 'all' && (
              <div>• التاريخ: {dateRangeOptions.find(o => o.value === filters.dateRange)?.label}</div>
            )}
            {filters.bookmarked && (
              <div>• البطاقات المحفوظة فقط</div>
            )}
            {filters.colors.length > 0 && (
              <div>• الألوان: {filters.colors.length} لون محدد</div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}