// src/components/CardsView.tsx
'use client';

import { FilterState, Word } from '@/types/flashcard';
import { Filter, Grid, List, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ModernWordCard from './ModernWordCard';

interface CardsViewProps {
  words: Word[];
  categories: string[];
  onWordClick: (word: Word) => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (id: number) => void;
}

export default function CardsView({ 
  words, 
  categories, 
  onWordClick, 
  onEditWord, 
  onDeleteWord 
}: CardsViewProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'الكل',
    difficulty: 'all',
    sortBy: 'newest'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // تصفية وترتيب الكلمات
  const filteredWords = useMemo(() => {
    const filtered = words.filter(word => {
      const searchMatch = word.word.toLowerCase().includes(filters.search.toLowerCase()) ||
                         word.meaning.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatch = filters.category === 'الكل' || word.category === filters.category;
      const difficultyMatch = filters.difficulty === 'all' || word.difficulty === filters.difficulty;
      
      return searchMatch && categoryMatch && difficultyMatch;
    });

    // ترتيب الكلمات
    switch (filters.sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'difficulty':
        const difficultyOrder = { 'سهل': 1, 'متوسط': 2, 'صعب': 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'nextReview':
        filtered.sort((a, b) => a.nextReview - b.nextReview);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      default: // newest
        filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [words, filters]);

  const stats = useMemo(() => {
    const total = filteredWords.length;
    const mastered = filteredWords.filter(w => w.correctCount >= 3).length;
    const needReview = filteredWords.filter(w => w.nextReview <= Date.now()).length;
    
    return { total, mastered, needReview };
  }, [filteredWords]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">البطاقات التعليمية</h2>
          <p className="text-gray-600">
            {stats.total} بطاقة • {stats.mastered} محفوظة • {stats.needReview} تحتاج مراجعة
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-all ${
              showFilters 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="البحث في الكلمات..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="الكل">جميع التصنيفات</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الصعوبة</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as FilterState['difficulty'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع المستويات</option>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="صعب">صعب</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="alphabetical">أبجدياً</option>
                <option value="difficulty">حسب الصعوبة</option>
                <option value="nextReview">حسب موعد المراجعة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid/List */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600">جرب تغيير معايير البحث أو الفلترة</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredWords.map(word => (
            <ModernWordCard
              key={word.id}
              word={word}
              onClick={() => onWordClick(word)}
              onEdit={() => onEditWord(word)}
              onDelete={() => onDeleteWord(word.id)}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </div>
  );
}