// src/app/folders/[id]/page.tsx - صفحة تفاصيل المجلد
'use client';

import EditWordModal from '@/components/EditWordModal';
import WordDetailsModal from '@/components/WordDetailsModal';
import { useApp } from '@/context/AppContext';
import { SortBy, ViewMode, Word } from '@/types/flashcard';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Edit3,
  FolderOpen,
  Grid,
  List,
  Plus,
  Search,
  Star,
  Target,
  Trash2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function FolderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;
  
  const { 
    folders, 
    folderStats, 
    updateWord, 
    deleteWord, 
    getWordsInFolder,
  } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // المجلد الحالي
  const currentFolder = useMemo(() => {
    return folders.find(f => f.id === folderId);
  }, [folders, folderId]);

  // إحصائيات المجلد
  const folderStat = useMemo(() => {
    return folderStats.find(f => f.id === folderId);
  }, [folderStats, folderId]);

  // كلمات المجلد
  const folderWords = useMemo(() => {
    return getWordsInFolder(folderId, false);
  }, [getWordsInFolder, folderId]);

  // الكلمات المفلترة والمرتبة
  const filteredAndSortedWords = useMemo(() => {
    let filtered = [...folderWords];

    // فلترة حسب البحث
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchLower) ||
        word.meaning.toLowerCase().includes(searchLower) ||
        (word.note && word.note.toLowerCase().includes(searchLower)) ||
        (word.tags && word.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [folderWords, searchTerm, sortBy]);

  // إحصائيات مفصلة للمجلد
  const detailedStats = useMemo(() => {
    if (!folderWords.length) {
      return {
        total: 0,
        mastered: 0,
        needReview: 0,
        learning: 0,
        byDifficulty: { 'سهل': 0, 'متوسط': 0, 'صعب': 0 },
        avgCorrectRate: 0,
        avgEaseFactor: 2.5,
        avgInterval: 1,
      };
    }

    const mastered = folderWords.filter(w => w.correctCount >= 3).length;
    const needReview = folderWords.filter(w => w.nextReview <= Date.now()).length;
    const learning = folderWords.length - mastered;

    const byDifficulty = {
      'سهل': folderWords.filter(w => w.difficulty === 'سهل').length,
      'متوسط': folderWords.filter(w => w.difficulty === 'متوسط').length,
      'صعب': folderWords.filter(w => w.difficulty === 'صعب').length,
    };

    const totalReviews = folderWords.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0);
    const correctReviews = folderWords.reduce((sum, w) => sum + w.correctCount, 0);
    const avgCorrectRate = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

    const avgEaseFactor = folderWords.reduce((sum, w) => sum + w.easeFactor, 0) / folderWords.length;
    const avgInterval = folderWords.reduce((sum, w) => sum + w.interval, 0) / folderWords.length;

    return {
      total: folderWords.length,
      mastered,
      needReview,
      learning,
      byDifficulty,
      avgCorrectRate,
      avgEaseFactor,
      avgInterval,
    };
  }, [folderWords]);

  // معالج بدء الدراسة
  const handleStartStudy = () => {
    router.push(`/study?folder=${folderId}`);
  };

  // معالج إضافة كلمة جديدة
  const handleAddWord = () => {
    // سيتم فتح نموذج إضافة الكلمة مع تحديد المجلد الحالي
    router.push(`/?addWord=true&folder=${folderId}`);
  };

  // معالج حذف كلمة
  const handleDeleteWord = (wordId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      deleteWord(wordId);
    }
  };

  if (!currentFolder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16">
          <FolderOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">المجلد غير موجود</h2>
          <p className="text-gray-400 mb-6">لم يتم العثور على المجلد المطلوب</p>
          <Link
            href="/folders"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
          >
            <ArrowRight size={18} />
            <span>العودة للمجلدات</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm mb-4">
          <Link href="/folders" className="text-gray-400 hover:text-gray-300 transition-colors">
            المجلدات
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white">{currentFolder.name}</span>
        </div>

        {/* Folder Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
              style={{ 
                backgroundColor: `${currentFolder.color}20`, 
                border: `2px solid ${currentFolder.color}40` 
              }}
            >
              {currentFolder.icon}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {currentFolder.name}
                </h1>
                {currentFolder.isDefault && (
                  <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full">
                    افتراضي
                  </span>
                )}
              </div>
              
              {currentFolder.description && (
                <p className="text-gray-400">{currentFolder.description}</p>
              )}
              
              <p className="text-sm text-gray-500 mt-1">
                {detailedStats.total} كلمة • {detailedStats.mastered} محفوظة • {detailedStats.needReview} تحتاج مراجعة
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddWord}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Plus size={18} />
              <span>إضافة كلمة</span>
            </button>

            {detailedStats.total > 0 && (
              <button
                onClick={handleStartStudy}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <Brain size={18} />
                <span>بدء الدراسة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {detailedStats.total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-400 mb-1">
              {detailedStats.total}
            </div>
            <div className="text-xs text-gray-400">إجمالي</div>
          </div>

          <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/30 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400 mb-1">
              {detailedStats.mastered}
            </div>
            <div className="text-xs text-gray-400">محفوظة</div>
          </div>

          <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-800/30 text-center">
            <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-400 mb-1">
              {detailedStats.needReview}
            </div>
            <div className="text-xs text-gray-400">للمراجعة</div>
          </div>

          <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800/30 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-400 mb-1">
              {detailedStats.avgCorrectRate.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">معدل النجاح</div>
          </div>

          <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-800/30 text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-yellow-400 mb-1">
              {detailedStats.avgEaseFactor.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">عامل السهولة</div>
          </div>

          <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-800/30 text-center">
            <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-cyan-400 mb-1">
              {Math.round(detailedStats.avgInterval)}
            </div>
            <div className="text-xs text-gray-400">متوسط الفترة</div>
          </div>
        </div>
      )}

      {/* Controls */}
      {detailedStats.total > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في كلمات المجلد..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="alphabetical">أبجدي</option>
              <option value="difficulty">الصعوبة</option>
              <option value="nextReview">موعد المراجعة</option>
            </select>

            {/* View Mode */}
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
      )}

      {/* Words Content */}
      {detailedStats.total === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">مجلد فارغ</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            هذا المجلد لا يحتوي على أي كلمات بعد. ابدأ بإضافة كلمات لبناء مكتبتك التعليمية.
          </p>
          <button
            onClick={handleAddWord}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
          >
            <Plus size={20} />
            <span>إضافة أول كلمة</span>
          </button>
        </div>
      ) : filteredAndSortedWords.length === 0 ? (
        <div className="text-center py-16">
          <Search size={64} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">لا توجد نتائج</h3>
          <p className="text-gray-400 mb-8">لم يتم العثور على كلمات مطابقة لبحثك</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            مسح البحث
          </button>
        </div>
      ) : (
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
              onEdit={() => setEditingWord(word)}
              onDelete={() => handleDeleteWord(word.id)}
              onView={() => setSelectedWord(word)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedWord && (
        <WordDetailsModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {editingWord && (
        <EditWordModal
          word={editingWord}
          categories={folders}
          onSave={(updatedWord) => {
            updateWord(updatedWord);
            setEditingWord(null);
          }}
          onCancel={() => setEditingWord(null)}
          onAddCategory={() => {}} // سيتم تنفيذه لاحقاً
        />
      )}
    </div>
  );
}

// Word Card Component
interface WordCardProps {
  word: Word;
  compact?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, compact = false, onEdit, onDelete, onView }) => {
  const isMastered = word.correctCount >= 3;
  const needsReview = word.nextReview <= Date.now();

  const difficultyColors = {
    'سهل': 'text-green-400 bg-green-900/30 border-green-800/50',
    'متوسط': 'text-yellow-400 bg-yellow-900/30 border-yellow-800/50',
    'صعب': 'text-red-400 bg-red-900/30 border-red-800/50'
  };

  if (compact) {
    return (
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer group"
        onClick={onView}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-white truncate">{word.word}</h3>
              {isMastered && <Star size={14} className="text-yellow-400 shrink-0" />}
            </div>
            
            <p className="text-gray-300 text-sm truncate mb-3">{word.meaning}</p>
            
            <div className="flex items-center space-x-4 text-xs">
              <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[word.difficulty]}`}>
                {word.difficulty}
              </span>
              
              {isMastered && <span className="text-green-400 text-xs">✓ محفوظة</span>}
              {needsReview && !isMastered && <span className="text-orange-400 text-xs">⏰ للمراجعة</span>}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="تحرير"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
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
      onClick={onView}
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
              onEdit();
            }}
            className="p-2 bg-gray-700/80 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="تحرير"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
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