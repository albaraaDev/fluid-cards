// src/components/WordDetailsModal.tsx
'use client';

import { Word } from '@/types/flashcard';
import { BookOpen, Brain, Calendar, Clock, X } from 'lucide-react';
import React from 'react';

interface WordDetailsModalProps {
  word: Word;
  onClose: () => void;
}

export default function WordDetailsModal({
  word,
  onClose,
}: WordDetailsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل':
        return {
          bg: 'bg-green-900/30',
          text: 'text-green-400',
          dot: 'bg-green-500',
          border: 'border-green-800/50',
        };
      case 'متوسط':
        return {
          bg: 'bg-yellow-900/30',
          text: 'text-yellow-400',
          dot: 'bg-yellow-500',
          border: 'border-yellow-800/50',
        };
      case 'صعب':
        return {
          bg: 'bg-red-900/30',
          text: 'text-red-400',
          dot: 'bg-red-500',
          border: 'border-red-800/50',
        };
      default:
        return {
          bg: 'bg-gray-900/30',
          text: 'text-gray-400',
          dot: 'bg-gray-500',
          border: 'border-gray-800/50',
        };
    }
  };

  const difficultyStyle = getDifficultyColor(word.difficulty);
  const successRate =
    word.correctCount + word.incorrectCount > 0
      ? Math.round(
          (word.correctCount / (word.correctCount + word.incorrectCount)) * 100
        )
      : 0;
  // const isMastered = word.correctCount >= 3;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextReviewStatus = () => {
    const now = Date.now();
    const timeDiff = word.nextReview - now;

    if (timeDiff <= 0) {
      return {
        text: 'الآن',
        color: 'text-orange-400',
        bg: 'bg-orange-900/30',
        border: 'border-orange-800/50',
      };
    }

    const days = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    if (days === 1) {
      return {
        text: 'غداً',
        color: 'text-blue-400',
        bg: 'bg-blue-900/30',
        border: 'border-blue-800/50',
      };
    } else if (days < 7) {
      return {
        text: `خلال ${days} أيام`,
        color: 'text-green-400',
        bg: 'bg-green-900/30',
        border: 'border-green-800/50',
      };
    } else if (days < 30) {
      const weeks = Math.ceil(days / 7);
      return {
        text: `خلال ${weeks} أسبوع`,
        color: 'text-purple-400',
        bg: 'bg-purple-900/30',
        border: 'border-purple-800/50',
      };
    } else {
      const months = Math.ceil(days / 30);
      return {
        text: `خلال ${months} شهر`,
        color: 'text-indigo-400',
        bg: 'bg-indigo-900/30',
        border: 'border-indigo-800/50',
      };
    }
  };

  const nextReviewStatus = getNextReviewStatus();

  // تحديد مستوى الإتقان بناءً على SM-2
  const getMasteryLevel = () => {
    if (word.repetition === 0)
      return { level: 'جديدة', color: 'text-gray-400', icon: '🆕' };
    if (word.repetition < 3)
      return { level: 'قيد التعلم', color: 'text-blue-400', icon: '📚' };
    if (word.repetition < 6)
      return { level: 'مألوفة', color: 'text-yellow-400', icon: '🤔' };
    if (word.repetition < 10)
      return { level: 'محفوظة جيداً', color: 'text-green-400', icon: '✅' };
    return { level: 'متقنة تماماً', color: 'text-purple-400', icon: '🏆' };
  };

  const masteryLevel = getMasteryLevel();

  // تقييم عامل السهولة
  const getEaseFactorStatus = () => {
    const ef = word.easeFactor;
    if (ef >= 2.5) return { status: 'ممتاز', color: 'text-green-400' };
    if (ef >= 2.0) return { status: 'جيد', color: 'text-yellow-400' };
    if (ef >= 1.5) return { status: 'صعب', color: 'text-orange-400' };
    return { status: 'صعب جداً', color: 'text-red-400' };
  };

  const easeFactorStatus = getEaseFactorStatus();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 lg:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation"
          >
            <X size={24} />
          </button>

          <div className="flex gap-4 items-start">
            <div className="pr-12 grow">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {word.word}
              </h1>
              <p className="text-blue-100 text-lg lg:text-xl mb-4">
                {word.meaning}
              </p>
            </div>
            {/* Last Quality Rating */}
            {word.quality !== undefined && (
              <div className="bg-yellow-900/20 rounded-2xl p-4 border border-yellow-800/30 max-sm:hidden">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm text-gray-400">آخر تقييم: </span>
                    <span className="text-yellow-400 font-bold">
                      {word.quality}/5
                    </span>
                  </div>
                  <div className="text-2xl">
                    {word.quality >= 4 ? '😊' : word.quality >= 3 ? '😐' : '🤔'}
                  </div>
                </div>
              </div>
            )}
          </div>
          {word.note && (
            <div
              className="bg-blue-800/30 rounded-2xl p-4 border border-blue-600/30"
              dir="ltr"
            >
              <p className="text-blue-100 italic">💡 {word.note}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-6 max-h-[calc(90vh-300px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`${difficultyStyle.bg} rounded-2xl p-4 border ${difficultyStyle.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الصعوبة</span>
                <div
                  className={`w-3 h-3 rounded-full ${difficultyStyle.dot}`}
                />
              </div>
              <div className={`text-lg font-bold ${difficultyStyle.text}`}>
                {word.difficulty}
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">التصنيف</span>
                <BookOpen size={16} className="text-gray-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {word.category}
              </div>
            </div>
          </div>

          {/* Last Quality Rating */}
          {word.quality !== undefined && (
            <div className="bg-yellow-900/20 rounded-2xl p-4 border border-yellow-800/30 sm:hidden mt-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm text-gray-400">آخر تقييم: </span>
                  <span className="text-yellow-400 font-bold">
                    {word.quality}/5
                  </span>
                </div>
                <div className="text-2xl">
                  {word.quality >= 4 ? '😊' : word.quality >= 3 ? '😐' : '🤔'}
                </div>
              </div>
            </div>
          )}

          {/* SM-2 Algorithm Stats */}
          <div className="bg-purple-900/20 rounded-2xl p-6 border border-purple-800/30">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="text-purple-400" size={20} />
              <h3 className="text-lg font-bold text-white">
                ذكاء التكرار المتباعد
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {word.repetition}
                </div>
                <div className="text-sm text-gray-400">مرات التكرار</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {word.interval}
                </div>
                <div className="text-sm text-gray-400">الفترة (أيام)</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-400">عامل السهولة: </span>
                <span className={`font-bold ${easeFactorStatus.color}`}>
                  {word.easeFactor.toFixed(2)} ({easeFactorStatus.status})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-lg">{masteryLevel.icon}</span>
                <span className={`font-semibold ${masteryLevel.color}`}>
                  {masteryLevel.level}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/20 rounded-2xl p-4 text-center border border-green-800/30">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {word.correctCount}
              </div>
              <div className="text-sm text-gray-400">إجابات صحيحة</div>
            </div>

            <div className="bg-red-900/20 rounded-2xl p-4 text-center border border-red-800/30">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {word.incorrectCount}
              </div>
              <div className="text-sm text-gray-400">إجابات خاطئة</div>
            </div>

            <div className="bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-800/30">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {successRate}%
              </div>
              <div className="text-sm text-gray-400">معدل النجاح</div>
            </div>
          </div>

          {/* Review Schedule */}
          <div className="space-y-4">
            <div
              className={`${nextReviewStatus.bg} rounded-2xl p-4 border ${nextReviewStatus.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">المراجعة القادمة</span>
                <Clock size={16} className={nextReviewStatus.color} />
              </div>
              <div
                className={`text-lg font-bold ${nextReviewStatus.color} mb-1`}
              >
                {nextReviewStatus.text}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(word.nextReview)}
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">آخر مراجعة</span>
                <Calendar size={16} className="text-gray-400" />
              </div>
              <div className="text-sm text-white">
                {formatDate(word.lastReviewed)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
