// src/components/WordDetailsModal.tsx
'use client';

import { Word } from '@/types/flashcard';
import { BookOpen, Clock, Target, TrendingUp, X } from 'lucide-react';
import React from 'react';

interface WordDetailsModalProps {
  word: Word;
  onClose: () => void;
}

export default function WordDetailsModal({ word, onClose }: WordDetailsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return { bg: 'bg-green-900/30', text: 'text-green-400', dot: 'bg-green-500', border: 'border-green-800/50' };
      case 'متوسط': return { bg: 'bg-yellow-900/30', text: 'text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-800/50' };
      case 'صعب': return { bg: 'bg-red-900/30', text: 'text-red-400', dot: 'bg-red-500', border: 'border-red-800/50' };
      default: return { bg: 'bg-gray-900/30', text: 'text-gray-400', dot: 'bg-gray-500', border: 'border-gray-800/50' };
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
      return { text: 'الآن', color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-800/50' };
    }
    
    const days = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    if (days === 1) {
      return { text: 'غداً', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-800/50' };
    } else if (days < 7) {
      return { text: `خلال ${days} أيام`, color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-800/50' };
    } else {
      const weeks = Math.ceil(days / 7);
      return { text: `خلال ${weeks} أسبوع`, color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-800/50' };
    }
  };

  const nextReviewStatus = getNextReviewStatus();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold mb-2">{word.word}</h2>
            <p className="text-blue-100 text-lg">{word.meaning}</p>
            
            <div className="flex items-center space-x-4 mt-4">
              <div className={`flex items-center space-x-2 ${difficultyStyle.bg} px-3 py-1 rounded-full border ${difficultyStyle.border}`}>
                <div className={`w-2 h-2 rounded-full ${difficultyStyle.dot}`} />
                <span className={`text-sm font-medium ${difficultyStyle.text}`}>
                  {word.difficulty}
                </span>
              </div>
              
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-100">
                  {word.category}
                </span>
              </div>
              
              {isMastered && (
                <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <span className="text-sm font-medium text-green-300">
                    محفوظة ✨
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Note */}
          {word.note && (
            <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <BookOpen size={16} className="me-2" />
                مثال:
              </h4>
              <p className="text-gray-300" dir='ltr'>{word.note}</p>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600">
            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
              <TrendingUp size={16} className="me-2" />
              إحصائيات الأداء
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-900/30 rounded-xl border border-green-800/50">
                <div className="text-2xl font-bold text-green-400">{word.correctCount}</div>
                <div className="text-xs text-gray-400">إجابات صحيحة</div>
              </div>
              
              <div className="text-center p-3 bg-red-900/30 rounded-xl border border-red-800/50">
                <div className="text-2xl font-bold text-red-400">{word.incorrectCount}</div>
                <div className="text-xs text-gray-400">إجابات خاطئة</div>
              </div>
              
              <div className="text-center p-3 bg-blue-900/30 rounded-xl border border-blue-800/50">
                <div className="text-2xl font-bold text-blue-400">{successRate}%</div>
                <div className="text-xs text-gray-400">معدل النجاح</div>
              </div>
              
              <div className="text-center p-3 bg-purple-900/30 rounded-xl border border-purple-800/50">
                <div className="text-2xl font-bold text-purple-400">
                  {word.correctCount + word.incorrectCount}
                </div>
                <div className="text-xs text-gray-400">إجمالي المحاولات</div>
              </div>
            </div>
          </div>

          {/* Review Timeline */}
          <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600">
            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
              <Clock size={16} className="me-2" />
              جدول المراجعة
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-xl">
                <span className="text-gray-300 text-sm">آخر مراجعة</span>
                <span className="text-gray-400 text-sm">{formatDate(word.lastReviewed)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-xl">
                <span className="text-gray-300 text-sm">المراجعة التالية</span>
                <span className={`text-sm px-2 py-1 rounded-lg ${nextReviewStatus.bg} ${nextReviewStatus.color} border ${nextReviewStatus.border}`}>
                  {nextReviewStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600">
            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
              <Target size={16} className="me-2" />
              التقدم نحو الإتقان
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-300">
                <span>التقدم الحالي</span>
                <span>{word.correctCount}/3 محاولات صحيحة</span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isMastered 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}
                  style={{ width: `${Math.min((word.correctCount / 3) * 100, 100)}%` }}
                />
              </div>
              
              <div className="text-center">
                {isMastered ? (
                  <span className="text-green-400 font-medium text-sm">
                    🎉 تم إتقان هذه الكلمة!
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">
                    تحتاج {3 - word.correctCount} إجابات صحيحة أخرى للإتقان
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Learning Tips */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-4 border border-blue-800/30">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 نصيحة للتعلم</h4>
            <p className="text-blue-200 text-sm">
              {successRate >= 80 
                ? "أداء ممتاز! استمر في المراجعة المنتظمة للحفاظ على مستواك."
                : successRate >= 60
                ? "أداء جيد! ركز على الأمثلة والاستخدامات المختلفة لهذه الكلمة."
                : "تحتاج لمزيد من المراجعة. حاول كتابة جمل جديدة باستخدام هذه الكلمة."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}