'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CollectionCard from '@/components/collections/CollectionCard'
import RecentSearches from '@/components/search/RecentSearches'
import SearchCard from '@/components/search/SearchCard'
import SearchFilters from '@/components/search/SearchFilters'
import SearchSuggestions from '@/components/search/SearchSuggestions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCards } from '@/hooks/useCards'
import { useCollections } from '@/hooks/useCollections'
import { motion } from 'framer-motion'
import {
  Bookmark,
  BookOpen,
  Calendar,
  FileText,
  Filter,
  Hash,
  Search,
  TrendingUp,
  X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface SearchResult {
  type: 'collection' | 'card'
  id: string
  title: string
  content?: string
  collection_id?: string
  collection_name?: string
  color?: string
  icon?: string
  created_at: string
  is_bookmarked?: boolean
}

type SearchFilter = {
  type: 'all' | 'collections' | 'cards'
  dateRange: 'all' | 'today' | 'week' | 'month'
  bookmarked: boolean
  colors: string[]
}

function SearchPageContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'cards'>('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    dateRange: 'all',
    bookmarked: false,
    colors: []
  })

  const { collections, searchCollections } = useCollections()
  const { searchCards } = useCards()

  // تحديث البحث عند تغيير المصطلح
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters])

  // تحميل البحثات الأخيرة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    try {
      const searchResults: SearchResult[] = []

      // البحث في المجموعات
      if (filters.type === 'all' || filters.type === 'collections') {
        const collectionResults = await searchCollections(term)
        searchResults.push(...collectionResults.map(collection => ({
          type: 'collection' as const,
          id: collection.id,
          title: collection.name,
          content: collection.description,
          color: collection.color,
          icon: collection.icon,
          created_at: collection.created_at
        })))
      }

      // البحث في البطاقات
      if (filters.type === 'all' || filters.type === 'cards') {
        const cardResults = await searchCards(term)
        searchResults.push(...cardResults.map(card => ({
          type: 'card' as const,
          id: card.id,
          title: card.front_text,
          content: card.back_text,
          collection_id: card.collection_id,
          collection_name: collections.find(c => c.id === card.collection_id)?.name,
          color: card.color,
          created_at: card.created_at,
          is_bookmarked: card.is_bookmarked
        })))
      }

      // تطبيق الفلاتر
      let filteredResults = searchResults

      // فلتر حسب التاريخ
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const filterDate = new Date()
        
        switch (filters.dateRange) {
          case 'today':
            filterDate.setDate(now.getDate() - 1)
            break
          case 'week':
            filterDate.setDate(now.getDate() - 7)
            break
          case 'month':
            filterDate.setMonth(now.getMonth() - 1)
            break
        }
        
        filteredResults = filteredResults.filter(result => 
          new Date(result.created_at) >= filterDate
        )
      }

      // فلتر حسب المفضلة (للبطاقات فقط)
      if (filters.bookmarked) {
        filteredResults = filteredResults.filter(result => 
          result.type === 'collection' || result.is_bookmarked
        )
      }

      // فلتر حسب الألوان
      if (filters.colors.length > 0) {
        filteredResults = filteredResults.filter(result => 
          result.color && filters.colors.includes(result.color)
        )
      }

      setResults(filteredResults)

      // حفظ البحث في التاريخ
      if (term.trim()) {
        const updatedSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10)
        setRecentSearches(updatedSearches)
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
      }

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // تصفية النتائج حسب التبويب النشط
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results
    return results.filter(result => result.type === activeTab.slice(0, -1))
  }, [results, activeTab])

  // إحصائيات النتائج
  const stats = useMemo(() => {
    const collections = results.filter(r => r.type === 'collection').length
    const cards = results.filter(r => r.type === 'card').length
    return { collections, cards, total: collections + cards }
  }, [results])

  const clearSearch = () => {
    setSearchTerm('')
    setResults([])
  }

  const handleRecentSearch = (term: string) => {
    setSearchTerm(term)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 glass-strong rounded-3xl flex items-center justify-center">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-2">
            البحث الذكي
          </h1>
          <p className="text-white/70">
            ابحث في مجموعاتك وبطاقاتك بسهولة
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <Input
              placeholder="ابحث في المجموعات والبطاقات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pr-12 pl-12 py-4 text-lg rounded-2xl"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={`glass px-4 py-2 ${showFilters ? 'glass-strong' : ''}`}
            >
              <Filter className="w-4 h-4 ml-2" />
              فلترة النتائج
            </Button>

            {searchTerm && (
              <div className="text-sm text-white/60">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    جاري البحث...
                  </div>
                ) : (
                  `${stats.total} نتيجة`
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Search Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </motion.div>
        )}

        {/* Content Area */}
        {!searchTerm ? (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <RecentSearches
                searches={recentSearches}
                onSearchSelect={handleRecentSearch}
                onClear={clearRecentSearches}
              />
            )}

            {/* Search Suggestions */}
            <SearchSuggestions
              collections={collections}
              onSuggestionSelect={setSearchTerm}
            />

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-3xl"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                إحصائيات سريعة
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {collections.length}
                  </div>
                  <div className="text-sm text-white/70">مجموعة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {collections.reduce((sum, c) => sum + (c.cards_count || 0), 0)}
                  </div>
                  <div className="text-sm text-white/70">بطاقة</div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Tabs */}
            <div className="flex gap-2 p-1 glass rounded-2xl">
              {[
                { key: 'all', label: 'الكل', count: stats.total },
                { key: 'collections', label: 'المجموعات', count: stats.collections },
                { key: 'cards', label: 'البطاقات', count: stats.cards }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${activeTab === tab.key 
                      ? 'glass-strong text-white' 
                      : 'text-white/70 hover:text-white hover:glass'
                    }
                  `}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass p-6 rounded-3xl animate-pulse">
                      <div className="h-4 bg-white/20 rounded mb-2" />
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="glass-card text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-white/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    لم يتم العثور على نتائج
                  </h3>
                  <p className="text-white/70 mb-6">
                    جرب البحث بكلمات مختلفة أو قم بتعديل الفلاتر
                  </p>
                  <Button 
                    onClick={() => setShowFilters(true)}
                    className="glass-button"
                  >
                    تعديل الفلاتر
                  </Button>
                </div>
              ) : (
                filteredResults.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {result.type === 'collection' ? (
                      <CollectionCard 
                        collection={{
                          id: result.id,
                          name: result.title,
                          description: result.content,
                          color: result.color as any,
                          icon: result.icon!,
                          created_at: result.created_at,
                          updated_at: result.created_at,
                          user_id: '',
                          cards_count: 0
                        }}
                        viewMode="list"
                      />
                    ) : (
                      <SearchCard 
                        card={{
                          id: result.id,
                          front_text: result.title,
                          back_text: result.content!,
                          collection_id: result.collection_id!,
                          collection_name: result.collection_name!,
                          color: result.color as any,
                          created_at: result.created_at,
                          is_bookmarked: result.is_bookmarked!
                        }}
                        searchTerm={searchTerm}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchPageContent />
    </ProtectedRoute>
  )
}