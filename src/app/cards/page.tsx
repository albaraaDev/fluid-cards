// src/app/cards/page.tsx
'use client';

import EditWordModal from '@/components/EditWordModal';
import WordDetailsModal from '@/components/WordDetailsModal';
import { useApp } from '@/context/AppContext';
import { DifficultyFilter, SortBy, ViewMode, Word } from '@/types/flashcard';
import {
  ChevronDown,
  Edit,
  Filter,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export default function CardsPage() {
  const { words, categories, updateWord, deleteWord, addCategory } = useApp();

  const [pageTimestamp] = useState(() => Date.now());

  // UI State
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // فلترة وترتيب الكلمات
  const filteredAndSortedWords = useMemo(() => {
    const filtered = words.filter((word) => {
      const matchesSearch =
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'الكل' || word.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word, 'ar');
        case 'difficulty':
          const difficultyOrder = { سهل: 1, متوسط: 2, صعب: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'nextReview':
          return a.nextReview - b.nextReview;
        case 'category':
          return a.category.localeCompare(b.category, 'ar');
        case 'oldest':
          return a.id - b.id;
        default: // newest
          return b.id - a.id;
      }
    });

    return filtered;
  }, [words, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

  // إحصائيات مفلترة
  const filteredStats = useMemo(() => {
    const total = filteredAndSortedWords.length;
    const mastered = filteredAndSortedWords.filter(
      (w) => w.correctCount >= 3
    ).length;
    const needReview = filteredAndSortedWords.filter(
      (w) => w.nextReview <= Date.now()
    ).length;

    return { total, mastered, needReview };
  }, [filteredAndSortedWords]);

  // معالج حذف كلمة
  const handleDeleteWord = (wordId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      deleteWord(wordId);
    }
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('الكل');
    setSelectedDifficulty('all');
    setSortBy('newest');
  };

  // مكون البطاقة
  const WordCard: React.FC<{ word: Word; compact?: boolean }> = ({
    word,
    compact = false,
  }) => {
    const isMastered = word.repetition >= 3 && word.interval >= 21;
    const needsReview = word.nextReview <= pageTimestamp;

    return (
      <div
        onClick={() => setSelectedWord(word)}
        className={`
          bg-gray-800 rounded-2xl border border-gray-700 cursor-pointer group
          transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-gray-600
          ${compact ? 'p-4' : 'p-6'}
          ${isMastered ? 'ring-2 ring-green-500/20 bg-green-900/10' : ''}
          ${needsReview ? 'ring-2 ring-orange-500/20 bg-orange-900/10' : ''}
          touch-manipulation
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
              {word.word}
            </h3>
            <p className="text-gray-400 text-sm lg:text-base line-clamp-2 h-12">
              {word.meaning}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingWord(word);
              }}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-all touch-manipulation"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWord(word.id);
              }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all touch-manipulation"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Difficulty Badge */}
          <span
            className={`
            text-xs lg:text-sm px-3 py-1 rounded-full font-medium
            ${
              word.difficulty === 'سهل'
                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                : word.difficulty === 'متوسط'
                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                : 'bg-red-900/30 text-red-400 border border-red-800/50'
            }
          `}
          >
            {word.difficulty}
          </span>

          {/* Status & Category */}
          <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
            {isMastered && <span className="text-green-400">✓ محفوظة</span>}
            {needsReview && !isMastered && (
              <span className="text-orange-400">⏰ للمراجعة</span>
            )}
            <span>•</span>
            <span>{word.category}</span>
          </div>
        </div>

        {/* Note Preview */}
        {word.note && (
          <div className="mt-3 p-2 bg-gray-700/50 rounded-lg">
            <p
              className="text-xs lg:text-sm text-gray-400 line-clamp-1"
              dir="ltr"
            >
              📝 {word.note}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex  lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            البطاقات التعليمية
          </h1>
          <p className="text-gray-400">
            {filteredStats.total} بطاقة • {filteredStats.mastered} محفوظة •{' '}
            {filteredStats.needReview} تحتاج مراجعة
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 justify-end">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gray-700 text-blue-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              } touch-manipulation`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-blue-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              } touch-manipulation`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex mb-8 gap-4 items-center">
        {/* Search Bar */}
        <div className="relative grow">
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="البحث في الكلمات والمعاني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl py-4 px-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg touch-manipulation"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1 touch-manipulation"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`size-[62px] rounded-xl transition-all border touch-manipulation grid place-content-center ${
            showFilters
              ? 'bg-blue-900/30 text-blue-400 border-blue-800/50'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-300'
          }`}
        >
          <SlidersHorizontal size={22} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">الفلاتر</h3>
            <button
              onClick={resetFilters}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors touch-manipulation"
            >
              إعادة تعيين
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                التصنيف
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                >
                  <option value="الكل">جميع التصنيفات</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مستوى الصعوبة
              </label>
              <div className="relative">
                <select
                  value={selectedDifficulty}
                  onChange={(e) =>
                    setSelectedDifficulty(e.target.value as DifficultyFilter)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                </select>
                <ChevronDown
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الترتيب
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                  <option value="alphabetical">أبجدياً</option>
                  <option value="difficulty">حسب الصعوبة</option>
                  <option value="nextReview">موعد المراجعة</option>
                </select>
                <ChevronDown
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid/List */}
      {filteredAndSortedWords.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedWords.map((word) => (
            <WordCard key={word.id} word={word} compact={viewMode === 'list'} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 lg:py-24">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-800 rounded-full mx-auto mb-6 lg:mb-8 flex items-center justify-center border border-gray-700">
            <Search size={32} className="text-gray-400 lg:w-12 lg:h-12" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
            لا توجد بطاقات مطابقة
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            جرب تعديل البحث أو الفلاتر للعثور على البطاقات التي تبحث عنها
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
          >
            <Filter size={18} />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>
      )}

      {/* Word Details Modal */}
      {selectedWord && (
        <WordDetailsModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <EditWordModal
          word={editingWord}
          categories={categories}
          onSave={(updatedWord) => {
            updateWord(updatedWord);
            setEditingWord(null);
          }}
          onCancel={() => setEditingWord(null)}
          onAddCategory={addCategory}
        />
      )}
    </div>
  );
}
