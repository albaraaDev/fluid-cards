'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AddCardDialog from '@/components/cards/AddCardDialog'
import CardItem from '@/components/cards/CardItem'
import DeleteCollectionDialog from '@/components/collections/DeleteCollectionDialog'
import EditCollectionDialog from '@/components/collections/EditCollectionDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCards } from '@/hooks/useCards'
import { useCollections } from '@/hooks/useCollections'
import { Collection } from '@/types'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bookmark,
  Edit3,
  Filter,
  MoreVertical,
  Play,
  Plus,
  Search,
  Shuffle,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function CollectionPageContent() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string
  
  const [collection, setCollection] = useState<Collection | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCards, setFilteredCards] = useState<any[]>([])
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  
  const { getCollection } = useCollections()
  const { cards, loading, searchCards } = useCards(collectionId)

  // جلب بيانات المجموعة
  useEffect(() => {
    const fetchCollection = async () => {
      const { data, error } = await getCollection(collectionId)
      if (error) {
        router.push('/')
        return
      }
      setCollection(data)
    }

    if (collectionId) {
      fetchCollection()
    }
  }, [collectionId, getCollection, router])

  // تطبيق البحث والفلترة
  useEffect(() => {
    let filtered = cards

    // تطبيق البحث
    if (searchTerm.trim()) {
      filtered = cards.filter(card => 
        card.front_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.notes && card.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // تطبيق فلتر المفضلة
    if (showBookmarkedOnly) {
      filtered = filtered.filter(card => card.is_bookmarked)
    }

    setFilteredCards(filtered)
  }, [cards, searchTerm, showBookmarkedOnly])

  if (!collection && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-8 rounded-3xl text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            المجموعة غير موجودة
          </h2>
          <p className="text-white/70 mb-6">
            لم يتم العثور على هذه المجموعة
          </p>
          <Link href="/">
            <Button className="glass-button">
              العودة للرئيسية
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (loading || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-8 rounded-3xl text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto glass rounded-full flex items-center justify-center"
            >
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            جاري التحميل...
          </h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="glass p-3 h-12 w-12"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white truncate">
                {collection.name}
              </h1>
              <p className="text-white/70 text-sm">
                {filteredCards.length} من {cards.length} بطاقة
              </p>
            </div>
          </div>

          {/* Collection Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="glass p-3 h-12 w-12"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </Button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-2 w-48 glass-strong rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={() => setIsEditOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 text-white hover:glass rounded-xl transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                تعديل المجموعة
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:glass rounded-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                حذف المجموعة
              </button>
            </div>
          </div>
        </motion.div>

        {/* Collection Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass glass-${collection.color} p-6 rounded-3xl`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`
              w-16 h-16 rounded-2xl glass-${collection.color} 
              flex items-center justify-center text-3xl
            `}>
              {collection.icon}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-bold text-white">
              {collection.name}
            </h2>
            
            {collection.description && (
              <p className="text-white/80">
                {collection.description}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Button className="glass-button py-3 text-sm">
              <Play className="w-4 h-4 ml-1" />
              مراجعة
            </Button>
            <Button className="glass-button py-3 text-sm">
              <Shuffle className="w-4 h-4 ml-1" />
              عشوائي
            </Button>
            <Button 
              className="glass-button py-3 text-sm"
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            >
              <Bookmark className={`w-4 h-4 ml-1 ${showBookmarkedOnly ? 'text-yellow-400' : ''}`} />
              مفضلة
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <Input
              placeholder="البحث في البطاقات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pr-12 py-3"
            />
          </div>
          
          <Button
            onClick={() => setIsAddCardOpen(true)}
            className="glass-strong p-3 h-12 w-12"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </motion.div>

        {/* Cards List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredCards.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                {cards.length === 0 ? (
                  <Plus className="w-8 h-8 text-white/60" />
                ) : (
                  <Search className="w-8 h-8 text-white/60" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {cards.length === 0 
                  ? 'لا توجد بطاقات بعد'
                  : 'لم يتم العثور على نتائج'
                }
              </h3>
              <p className="text-white/70 mb-6">
                {cards.length === 0 
                  ? 'ابدأ بإضافة بطاقتك الأولى'
                  : 'جرب البحث بكلمات مختلفة'
                }
              </p>
              {cards.length === 0 && (
                <Button 
                  onClick={() => setIsAddCardOpen(true)}
                  className="glass-button"
                >
                  إضافة بطاقة جديدة
                </Button>
              )}
            </div>
          ) : (
            filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardItem card={card} collectionColor={collection.color} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <AddCardDialog
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        collectionId={collectionId}
        collectionColor={collection.color}
      />

      <EditCollectionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        collection={collection}
        onUpdate={(updatedCollection) => {
          setCollection(updatedCollection)
          setIsEditOpen(false)
        }}
      />

      <DeleteCollectionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        collection={collection}
        onDelete={() => {
          router.push('/')
        }}
      />
    </div>
  )
}

export default function CollectionPage() {
  return (
    <ProtectedRoute>
      <CollectionPageContent />
    </ProtectedRoute>
  )
}