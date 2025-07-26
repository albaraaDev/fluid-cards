// src/components/WordDetailsModal.tsx
'use client';

import { Word } from '@/types/flashcard';
import { BookOpen, Calendar, Clock, Target, TrendingUp, X } from 'lucide-react';
import React from 'react';

interface WordDetailsModalProps {
  word: Word;
  onClose: () => void;
}

export default function WordDetailsModal({ word, onClose }: WordDetailsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'متوسط': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'صعب': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const difficultyStyle = getDifficultyColor(word.difficulty);
  const successRate = word.correctCount + word.incorrectCount > 0 
    ? Math.round((word.correctCount / (word.correctCount + word.incorrectCount)) * 100)
    : 0;
  const isMastered = word.correctCount >= 3;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextReviewStatus = () => {
    const now = Date.now();
    const timeDiff = word.nextReview - now;
    
    if (timeDiff <= 0) {
      return { text: 'الآن', color: 'text-orange-600', bg: 'bg-orange-100' };
    }
    
    const days = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    if (days === 1) {
      return { text: 'غداً', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else if (days < 7) {
      return { text: `خلال ${days} أيام`, color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      const weeks = Math.ceil(days / 7);
      return { text: `خلال ${weeks} أسبوع`, color: 'text-purple-600', bg: 'bg-purple-100' };
    }
  };

  const nextReviewStatus = getNextReviewStatus();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${difficultyStyle.dot}`} />
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {word.category}
              </span>
              {isMastered && (
                <span className="bg-green-400/30 px-3 py-1 rounded-full text-sm font-medium">
                  محفوظة ⭐
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{word.word}</h2>
            <p className="text-blue-100 text-lg">{word.meaning}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Note Section */}
          {word.note && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">مثال أو ملاحظة</span>
              </div>
              <p className="text-gray-800 italic">&quot;{word.note}&quot;</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Success Rate */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">معدل النجاح</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{successRate}%</div>
              <div className="text-xs text-green-600">
                {word.correctCount} صحيح من {word.correctCount + word.incorrectCount}
              </div>
            </div>

            {/* Difficulty */}
            <div className={`${difficultyStyle.bg} rounded-2xl p-4 border`}>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={16} className={difficultyStyle.text} />
                <span className={`text-sm font-medium ${difficultyStyle.text}`}>مستوى الصعوبة</span>
              </div>
              <div className={`text-2xl font-bold ${difficultyStyle.text}`}>{word.difficulty}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">الجدول الزمني</h3>
            
            <div className="space-y-3">
              {/* Last Review */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">آخر مراجعة</div>
                  <div className="text-xs text-gray-600">{formatDate(word.lastReviewed)}</div>
                </div>
              </div>

              {/* Next Review */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className={`p-2 ${nextReviewStatus.bg} rounded-lg`}>
                  <Clock size={16} className={nextReviewStatus.color} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">المراجعة القادمة</div>
                  <div className={`text-xs font-medium ${nextReviewStatus.color}`}>
                    {nextReviewStatus.text}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">تقدم الحفظ</span>
              <span className="text-sm text-gray-500">{word.correctCount}/3</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((word.correctCount / 3) * 100, 100)}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              {isMastered 
                ? 'تم حفظ هذه الكلمة بنجاح! 🎉' 
                : `تحتاج إلى ${3 - word.correctCount} إجابات صحيحة أخرى`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}