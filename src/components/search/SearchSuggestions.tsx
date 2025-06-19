'use client'

import { Collection } from '@/types'
import { motion } from 'framer-motion'
import { Bookmark, Hash, Lightbulb, TrendingUp } from 'lucide-react'

interface SearchSuggestionsProps {
  collections: Collection[]
  onSuggestionSelect: (suggestion: string) => void
}

export default function SearchSuggestions({ 
  collections, 
  onSuggestionSelect 
}: SearchSuggestionsProps) {
  // إنشاء اقتراحات ذكية بناءً على المجموعات الموجودة
  const generateSuggestions = () => {
    const suggestions = []
    
    // أسماء المجموعات
    const topCollections = collections
      .sort((a, b) => (b.cards_count || 0) - (a.cards_count || 0))
      .slice(0, 3)
      .map(c => ({ text: c.name, type: 'collection', icon: c.icon }))
    
    suggestions.push(...topCollections)

    // كلمات شائعة للبحث
    const commonSearchTerms = [
      { text: 'الكلمات المحفوظة', type: 'filter', icon: '⭐' },
      { text: 'البطاقات الجديدة', type: 'filter', icon: '🆕' },
      { text: 'مراجعة سريعة', type: 'action', icon: '⚡' },
    ]
    
    suggestions.push(...commonSearchTerms)

    return suggestions.slice(0, 6)
  }

  const suggestions = generateSuggestions()

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'collection': return 'from-blue-400 to-blue-600'
      case 'filter': return 'from-purple-400 to-purple-600'
      case 'action': return 'from-green-400 to-green-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case 'collection': return 'مجموعة'
      case 'filter': return 'فلتر'
      case 'action': return 'إجراء'
      default: return 'اقتراح'
    }
  }

  if (suggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Popular Suggestions */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          اقتراحات للبحث
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={`${suggestion.type}-${suggestion.text}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionSelect(suggestion.text)}
              className="flex items-center gap-4 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300 group"
            >
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${getSuggestionColor(suggestion.type)}
                flex items-center justify-center text-xl flex-shrink-0
              `}>
                {suggestion.icon}
              </div>
              
              <div className="flex-1 text-right">
                <h4 className="text-white font-medium group-hover:text-gradient transition-all duration-300">
                  {suggestion.text}
                </h4>
                <p className="text-white/60 text-sm">
                  {getSuggestionLabel(suggestion.type)}
                </p>
              </div>
              
              <div className="text-white/40 group-hover:text-white/70 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass p-6 rounded-3xl space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Hash className="w-5 h-5 text-green-400" />
          بحث سريع
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { text: 'جميع البطاقات', query: '*', icon: '📚' },
            { text: 'المفضلة', query: 'مفضلة', icon: '⭐' },
            { text: 'الأحدث', query: 'جديد', icon: '🆕' },
            { text: 'للمراجعة', query: 'مراجعة', icon: '🎯' },
          ].map((action, index) => (
            <motion.button
              key={action.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSuggestionSelect(action.query)}
              className="flex flex-col items-center gap-2 p-4 glass hover:glass-strong rounded-2xl transition-all duration-300"
            >
              <div className="text-2xl">{action.icon}</div>
              <span className="text-white text-sm font-medium">
                {action.text}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-4 rounded-2xl"
      >
        <h4 className="text-white font-medium mb-2 text-sm">💡 نصائح البحث</h4>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• ابحث في أسماء المجموعات أو محتوى البطاقات</li>
          <li>• استخدم الفلاتر لتضييق نطاق البحث</li>
          <li>• يمكنك البحث بكلمات جزئية</li>
          <li>• البحث يدعم العربية والإنجليزية</li>
        </ul>
      </motion.div>
    </motion.div>
  )
}