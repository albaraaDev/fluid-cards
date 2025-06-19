'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CollectionCard from '@/components/collections/CollectionCard'
import QuickActions from '@/components/home/QuickActions'
import StatsOverview from '@/components/home/StatsOverview'
import WelcomeHeader from '@/components/home/WelcomeHeader'
import { Button } from '@/components/ui/button'
import { useCollections } from '@/hooks/useCollections'
import { motion } from 'framer-motion'
import { Grid, List, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type SortOption = 'recent' | 'name' | 'cards'
type ViewMode = 'grid' | 'list'

function HomePageContent() {
  const { collections, loading } = useCollections()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const sortCollections = (collections: typeof collections, sortBy: SortOption) => {  
    return [...collections].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ar')
        case 'cards':
          return (b.cards_count || 0) - (a.cards_count || 0)
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })
  }

  const sortedCollections = sortCollections(collections, sortBy)

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
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
            
            {/* Floating circles */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 mx-auto border-2 border-blue-400/30 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 w-16 h-16 mx-auto border-2 border-purple-400/20 rounded-full"
            />
          </div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-white mb-2"
          >
            جاري تحميل مجموعاتك...
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/70"
          >
            يرجى الانتظار قليلاً
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* Stats Overview */}
        <StatsOverview collections={collections} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Collections Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-white">مجموعاتي</h2>
          
          <div className="flex items-center gap-2">
            {/* Sort Button */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="glass-input px-3 py-2 text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-400"
            >
              <option value="recent">الأحدث</option>
              <option value="name">الاسم</option>
              <option value="cards">عدد البطاقات</option>
            </select>

            {/* View Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="glass p-2 h-10 w-10"
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4 text-white" />
              ) : (
                <Grid className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Collections Grid/List */}
        {sortedCollections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ابدأ رحلتك التعليمية
            </h3>
            <p className="text-white/70 mb-6">
              أنشئ مجموعتك الأولى من البطاقات التعليمية
            </p>
            <Link href="/collections/new">
              <Button className="glass-button">
                إنشاء مجموعة جديدة
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 gap-4' 
                : 'space-y-4'
              }
            `}
          >
            {sortedCollections.map((collection) => (
              <motion.div key={collection.id} variants={itemVariants}>
                <CollectionCard 
                  collection={collection} 
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Add Collection Button */}
        {sortedCollections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/collections/new">
              <Button className="w-full glass-strong py-4 text-lg font-medium">
                <Plus className="w-5 h-5 ml-2" />
                إضافة مجموعة جديدة
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  )
}