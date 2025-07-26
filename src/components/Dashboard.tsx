// src/components/Dashboard.tsx
'use client';

import { Word } from '@/types/flashcard';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import ModernWordCard from './ModernWordCard';

interface DashboardProps {
  words: Word[];
  onWordClick: (word: Word) => void;
  onEditWord: (word: Word) => void;
  onDeleteWord: (id: number) => void;
}

export default function Dashboard({ words, onWordClick, onEditWord, onDeleteWord }: DashboardProps) {
  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter(w => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter(w => w.nextReview <= Date.now()).length;
    const unmasteredWords = words.filter(w => w.correctCount < 3);
    
    // 3 كلمات عشوائية غير محفوظة
    const randomUnmastered = unmasteredWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
    
    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
      randomUnmastered
    };
  }, [words]);

  const statCards = [
    {
      title: 'إجمالي الكلمات',
      value: stats.totalWords,
      icon: BookOpen,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      title: 'كلمات محفوظة',
      value: stats.masteredWords,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500'
    },
    {
      title: 'تحتاج مراجعة',
      value: stats.wordsNeedingReview,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconColor: 'text-orange-500'
    },
    {
      title: 'نسبة الإتقان',
      value: `${stats.progress.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك</h2>
        <p className="text-gray-600">
          {stats.totalWords === 0 
            ? 'ابدأ رحلتك التعليمية بإضافة أول كلمة!'
            : stats.wordsNeedingReview > 0 
            ? `لديك ${stats.wordsNeedingReview} كلمات تحتاج لمراجعة`
            : 'أحسنت! جميع كلماتك محدثة'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${stat.bgColor} rounded-xl`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      {stats.totalWords > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">التقدم العام</h3>
            <span className="text-2xl font-bold text-purple-600">
              {stats.progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{stats.masteredWords} محفوظة</span>
            <span>{stats.totalWords} إجمالي</span>
          </div>
        </div>
      )}

      {/* Random Words Section */}
      {/* {stats.randomUnmastered.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">كلمات للمراجعة</h3>
            <span className="text-sm text-gray-500">اختيار عشوائي</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.randomUnmastered.map((word) => (
              <ModernWordCard
                key={word.id}
                word={word}
                onClick={() => onWordClick(word)}
                onEdit={() => onEditWord(word)}
                onDelete={() => onDeleteWord(word.id)}
                compact={true}
              />
            ))}
          </div>
        </div>
      )} */}

      {/* Empty State */}
      {stats.totalWords === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <BookOpen size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">ابدأ رحلتك التعليمية</h3>
          <p className="text-gray-600 mb-6">أضف أول كلمة واستمتع بتجربة التعلم الذكي</p>
          <div className="text-sm text-gray-500">
            استخدم زر + في الأسفل لإضافة كلمة جديدة
          </div>
        </div>
      )}
    </div>
  );
}