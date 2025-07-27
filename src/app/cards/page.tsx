// src/app/cards/page.tsx - تحديث لدعم نظام المجلدات
'use client';

import EditWordModal from '@/components/EditWordModal';
import WordDetailsModal from '@/components/WordDetailsModal';
import { useApp } from '@/context/AppContext';
import { DifficultyFilter, FilterState, SortBy, ViewMode, Word } from '@/types/flashcard';
import {
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Grid,
  List,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export default function CardsPage() {
  const { 
    words, 
    folders, 
    updateWord, 
    deleteWord, 
    addFolder, 
  } = useApp();
  
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // حالة الفلترة المحدثة للمجلدات
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    folderId: 'all', // 🔄 تغيير من category إلى folderId
    difficulty: 'all',
    sortBy: 'newest',
    showMastered: true,
    showNeedReview: true,
  });

  // فلترة وترتيب الكلمات
  const filteredAndSortedWords = useMemo(() => {
    let filtered = [...words];

    // فلترة حسب البحث
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm) ||
        word.meaning.toLowerCase().includes(searchTerm) ||
        (word.note && word.note.toLowerCase().includes(searchTerm)) ||
        (word.tags && word.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // فلترة حسب المجلد
    if (filters.folderId !== 'all') {
      filtered = filtered.filter(word => word.folderId === filters.folderId);
    }

    // فلترة حسب الصعوبة
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(word => word.difficulty === filters.difficulty);
    }

    // فلترة حسب الحالة
    if (!filters.showMastered) {
      filtered = filtered.filter(word => word.correctCount < 3);
    }
    if (!filters.showNeedReview) {
      filtered = filtered.filter(word => word.nextReview > Date.now());
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'difficulty':
          const difficultyOrder = { 'سهل': 1, 'متوسط': 2, 'صعب': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'nextReview':
          return a.nextReview - b.nextReview;
        case 'folder':
          const folderA = folders.find(f => f.id === a.folderId)?.name || '';
          const folderB = folders.find(f => f.id === b.folderId)?.name || '';
          return folderA.localeCompare(folderB, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  }, [words, filters, folders]);

  // إحصائيات مفلترة
  const filteredStats = useMemo(() => {
    const total = filteredAndSortedWords.length;
    const mastered = filteredAndSortedWords.filter(w => w.correctCount >= 3).length;
    const needReview = filteredAndSortedWords.filter(w => w.nextReview <= Date.now()).length;
    
    return { total, mastered, needReview };
  }, [filteredAndSortedWords]);

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({
      search: '',
      folderId: 'all',
      difficulty: 'all',
      sortBy: 'newest',
      showMastered: true,
      showNeedReview: true,
    });
    setShowFilters(false);
  };

  // مكون بطاقة الكلمة المحدث
  const WordCard: React.FC<{ word: Word; compact?: boolean }> = ({ word, compact = false }) => {
    const isMastered = word.correctCount >= 3;
    const needsReview = word.nextReview <= Date.now();
    const folder = folders.find(f => f.id === word.folderId);

    const difficultyColors = {
      'سهل': 'text-green-400 bg-green-900/30 border-green-800/50',
      'متوسط': 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50',
      'صعب': 'text-red-400 bg-red-900/30 border-red-800/50'
    };

    if (compact) {
      return (
        <div 
          className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer group"
          onClick={() => setSelectedWord(word)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-white truncate">{word.word}</h3>
                {isMastered && <Star size={14} className="text-yellow-400 shrink-0" />}
              </div>
              
              <p className="text-gray-300 text-sm truncate mb-3">{word.meaning}</p>
              
              <div className="flex items-center space-x-4 text-xs">
                {/* المجلد */}
                {folder && (
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="text-gray-400">{folder.name}</span>
                  </div>
                )}
                
                {/* الصعوبة */}
                <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[word.difficulty]}`}>
                  {word.difficulty}
                </span>
                
                {/* الحالة */}
                {isMastered && <span className="text-green-400 text-xs">✓ محفوظة</span>}
                {needsReview && !isMastered && <span className="text-orange-400 text-xs">⏰ للمراجعة</span>}
              </div>
            </div>

            {/* قائمة الإجراءات */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingWord(word);
                }}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="تحرير"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
                    deleteWord(word.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 hover:scale-105 transition-all duration-200 cursor-pointer group relative"
        onClick={() => setSelectedWord(word)}
      >
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {isMastered ? (
            <div className="flex items-center space-x-1 text-green-400 bg-green-900/30 px-2 py-1 rounded-full text-xs">
              <CheckCircle size={12} />
              <span>محفوظة</span>
            </div>
          ) : needsReview ? (
            <div className="flex items-center space-x-1 text-orange-400 bg-orange-900/30 px-2 py-1 rounded-full text-xs">
              <Clock size={12} />
              <span>للمراجعة</span>
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="pt-8">
          <h3 className="text-xl font-bold text-white mb-3 truncate">{word.word}</h3>
          <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">{word.meaning}</p>
          
          {/* Tags */}
          {word.tags && word.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {word.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
              {word.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{word.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* المجلد */}
              {folder && (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${folder.color}40` }}
                  >
                    {folder.icon}
                  </div>
                  <span className="text-sm text-gray-400">{folder.name}</span>
                </div>
              )}
            </div>

            {/* الصعوبة */}
            <span className={`px-3 py-1 rounded-full text-sm border ${difficultyColors[word.difficulty]}`}>
              {word.difficulty}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingWord(word);
              }}
              className="p-2 bg-gray-700/80 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="تحرير"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
                  deleteWord(word.id);
                }
              }}
              className="p-2 bg-gray-700/80 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Note Preview */}
        {word.note && (
          <div className="mt-3 p-2 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 line-clamp-1">
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">البطاقات التعليمية</h1>
          <p className="text-gray-400">
            {filteredStats.total} بطاقة • {filteredStats.mastered} محفوظة • {filteredStats.needReview} تحتاج مراجعة
          </p>
        </div>

        {/* View & Filter Controls */}
        <div className="flex items-center space-x-2">
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl transition-all border touch-manipulation ${
              showFilters 
                ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' 
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">فلاتر البحث</h3>
            <button
              onClick={resetFilters}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              إعادة تعيين
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* البحث */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البحث</label>
              <div className="relative">
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="ابحث في الكلمات..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* المجلد */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المجلد</label>
              <select
                value={filters.folderId}
                onChange={(e) => setFilters(prev => ({ ...prev, folderId: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">جميع المجلدات</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* الصعوبة */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الصعوبة</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as DifficultyFilter }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">جميع المستويات</option>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="صعب">صعب</option>
              </select>
            </div>

            {/* الترتيب */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ترتيب حسب</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortBy }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="alphabetical">أبجدي</option>
                <option value="difficulty">الصعوبة</option>
                <option value="nextReview">موعد المراجعة</option>
                <option value="folder">المجلد</option>
              </select>
            </div>
          </div>

          {/* خيارات إضافية */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showMastered}
                onChange={(e) => setFilters(prev => ({ ...prev, showMastered: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">عرض الكلمات المحفوظة</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showNeedReview}
                onChange={(e) => setFilters(prev => ({ ...prev, showNeedReview: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">عرض الكلمات التي تحتاج مراجعة</span>
            </label>
          </div>
        </div>
      )}

      {/* Words Grid/List */}
      {filteredAndSortedWords.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedWords.map((word) => (
            <WordCard 
              key={word.id} 
              word={word} 
              compact={viewMode === 'list'} 
            />
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
          categories={folders} // 🔄 تمرير المجلدات بدلاً من التصنيفات
          onSave={(updatedWord) => {
            updateWord(updatedWord);
            setEditingWord(null);
          }}
          onCancel={() => setEditingWord(null)}
          onAddCategory={addFolder} // 🔄 استخدام addFolder
        />
      )}
    </div>
  );
}