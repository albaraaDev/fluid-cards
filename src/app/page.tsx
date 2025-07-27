// src/app/page.tsx
'use client';

import EditWordModal from '@/components/EditWordModal';
import WordDetailsModal from '@/components/WordDetailsModal';
import { useApp } from '@/context/AppContext';
import { Word } from '@/types/flashcard';
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Edit,
  Target,
  Trash2,
  TrendingUp,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

export default function HomePage() {
  const { words, stats, updateWord, deleteWord, categories, addCategory } = useApp();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // الكلمات العشوائية للمراجعة
  const randomUnmasteredWords = useMemo(() => {
    const unmastered = words.filter(w => w.correctCount < 3);
    return unmastered
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  }, [words]);

  // إحصائيات بطاقات الحالة
  const statCards = [
    {
      title: 'إجمالي الكلمات',
      value: stats.totalWords,
      icon: BookOpen,
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-800/50',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
    },
    {
      title: 'كلمات محفوظة',
      value: stats.masteredWords,
      icon: CheckCircle,
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-800/50',
      textColor: 'text-green-400',
      iconColor: 'text-green-400',
    },
    {
      title: 'تحتاج مراجعة',
      value: stats.wordsNeedingReview,
      icon: Clock,
      bgColor: 'bg-orange-900/30',
      borderColor: 'border-orange-800/50',
      textColor: 'text-orange-400',
      iconColor: 'text-orange-400',
    },
    {
      title: 'معدل التقدم',
      value: `${stats.progress.toFixed(0)}%`,
      icon: TrendingUp,
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-800/50',
      textColor: 'text-purple-400',
      iconColor: 'text-purple-400',
    },
  ];

  // معالج حذف كلمة
  const handleDeleteWord = (wordId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      deleteWord(wordId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Welcome Section */}
      <div className="mb-8 lg:mb-12">
        <div className="text-center lg:text-right">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            أهلاً بك في رحلة التعلم! 🚀
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 mb-6">
            {stats.totalWords === 0 
              ? 'ابدأ رحلتك التعليمية بإضافة أول كلمة!'
              : stats.wordsNeedingReview > 0 
              ? `لديك ${stats.wordsNeedingReview} كلمات تحتاج لمراجعة`
              : 'أحسنت! جميع كلماتك محدثة'
            }
          </p>

          {/* Quick Action Buttons للآيباد */}
          {stats.totalWords > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              {stats.wordsNeedingReview > 0 && (
                <Link
                  href="/study"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
                >
                  <Brain size={20} />
                  <span>ابدأ المراجعة الآن</span>
                </Link>
              )}
              
              <Link
                href="/cards"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <BookOpen size={20} />
                <span>تصفح البطاقات</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`${stat.bgColor} rounded-2xl lg:rounded-3xl p-4 lg:p-6 border ${stat.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer touch-manipulation`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 lg:p-3 ${stat.bgColor} rounded-xl lg:rounded-2xl border ${stat.borderColor}`}>
                  <Icon size={20} className={`lg:w-6 lg:h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`text-2xl lg:text-3xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm lg:text-base text-gray-400">
                {stat.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar للآيباد */}
      {stats.totalWords > 0 && (
        <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700 mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="text-purple-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">التقدم العام</h3>
            </div>
            <span className="text-3xl lg:text-4xl font-bold text-purple-400">
              {stats.progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 lg:h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm lg:text-base text-gray-400">
            <span>{stats.masteredWords} محفوظة</span>
            <span>{stats.totalWords} إجمالي</span>
          </div>
        </div>
      )}

      {/* Random Words للمراجعة */}
      {randomUnmasteredWords.length > 0 && (
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Zap className="text-yellow-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">كلمات للمراجعة</h3>
            </div>
            <Link 
              href="/cards"
              className="text-blue-400 hover:text-blue-300 text-sm lg:text-base font-medium transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {randomUnmasteredWords.map((word) => (
              <div
                key={word.id}
                className="bg-gray-800 rounded-2xl p-4 lg:p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer group touch-manipulation"
                onClick={() => setSelectedWord(word)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg lg:text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {word.word}
                    </h4>
                    <p className="text-gray-400 text-sm lg:text-base line-clamp-2">
                      {word.meaning}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
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

                <div className="flex items-center justify-between">
                  <span className={`
                    text-xs lg:text-sm px-2 py-1 rounded-full
                    ${word.difficulty === 'سهل' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
                      word.difficulty === 'متوسط' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
                      'bg-red-900/30 text-red-400 border border-red-800/50'
                    }
                  `}>
                    {word.difficulty}
                  </span>
                  
                  <span className="text-xs lg:text-sm text-gray-500">
                    {word.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalWords === 0 && (
        <div className="text-center py-16 lg:py-24">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 lg:mb-8 flex items-center justify-center">
            <Award size={32} className="text-white lg:w-12 lg:h-12" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            ابدأ رحلتك التعليمية!
          </h3>
          <p className="text-gray-400 mb-8 text-lg lg:text-xl max-w-md mx-auto leading-relaxed">
            أضف كلماتك الأولى وابدأ في بناء مفرداتك بطريقة ذكية ومنظمة
          </p>
          
          <Link
            href="/cards"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
          >
            <BookOpen size={20} />
            <span>استكشف البطاقات</span>
          </Link>
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