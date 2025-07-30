// src/components/study/SessionPreview.tsx
'use client';

import { StudyFilters, StudyMode, Word } from '@/types/flashcard';
import {
  AlertCircle,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useMemo } from 'react';

interface SessionPreviewProps {
  words: Word[];
  mode: StudyMode;
  filters: StudyFilters;
  className?: string;
}

const SessionPreview: React.FC<SessionPreviewProps> = ({
  words,
  mode,
  className = '',
}) => {
  // Calculate session statistics
  const sessionStats = useMemo(() => {
    if (words.length === 0) {
      return {
        totalWords: 0,
        needReview: 0,
        mastered: 0,
        averageEaseFactor: 0,
        estimatedTime: 0,
        difficultyBreakdown: { سهل: 0, متوسط: 0, صعب: 0 },
        categoryBreakdown: {},
        hardestWords: [],
        easiestWords: [],
      };
    }

    const needReview = words.filter((w) => w.nextReview <= Date.now()).length;
    const mastered = words.filter((w) => w.correctCount >= 3).length;
    const averageEaseFactor =
      words.reduce((sum, w) => sum + w.easeFactor, 0) / words.length;

    // Estimate time based on mode
    let timePerWord;
    switch (mode) {
      case 'speed':
        timePerWord = 0.5;
        break; // 30 seconds per word
      case 'reading':
        timePerWord = 0.2;
        break; // 12 seconds per word
      case 'challenge':
        timePerWord = 1.5;
        break; // 90 seconds per word
      case 'reverse':
        timePerWord = 1.2;
        break; // 72 seconds per word
      default:
        timePerWord = 1; // 60 seconds per word
    }
    const estimatedTime = Math.round(words.length * timePerWord);

    // Difficulty breakdown
    const difficultyBreakdown = words.reduce((acc, word) => {
      acc[word.difficulty] = (acc[word.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category breakdown
    const categoryBreakdown = words.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find hardest and easiest words
    const sortedByEase = [...words].sort((a, b) => a.easeFactor - b.easeFactor);
    const hardestWords = sortedByEase.slice(0, 3);
    const easiestWords = sortedByEase.slice(-3).reverse();

    return {
      totalWords: words.length,
      needReview,
      mastered,
      averageEaseFactor,
      estimatedTime,
      difficultyBreakdown,
      categoryBreakdown,
      hardestWords,
      easiestWords,
    };
  }, [words, mode]);

  if (words.length === 0) {
    return (
      <div
        className={`bg-orange-900/20 rounded-2xl p-6 border border-orange-800/30 ${className}`}
      >
        <div className="text-center">
          <AlertCircle className="text-orange-400 mx-auto mb-4" size={32} />
          <h3 className="text-lg font-semibold text-orange-400 mb-2">
            لا توجد كلمات للدراسة
          </h3>
          <p className="text-orange-300 text-sm">
            يرجى تعديل الفلاتر أو إضافة المزيد من الكلمات
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">معاينة الجلسة</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>~{sessionStats.estimatedTime} دقيقة</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-blue-900/20 rounded-xl p-4 text-center border border-blue-800/30">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {sessionStats.totalWords}
          </div>
          <div className="text-xs text-gray-400">إجمالي الكلمات</div>
        </div>

        <div className="bg-orange-900/20 rounded-xl p-4 text-center border border-orange-800/30">
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {sessionStats.needReview}
          </div>
          <div className="text-xs text-gray-400">تحتاج مراجعة</div>
        </div>

        <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-800/30">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {sessionStats.mastered}
          </div>
          <div className="text-xs text-gray-400">محفوظة</div>
        </div>

        <div className="bg-purple-900/20 rounded-xl p-4 text-center border border-purple-800/30">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {sessionStats.averageEaseFactor.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">عامل السهولة</div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-gray-400" size={16} />
          <h4 className="text-white font-medium">توزيع المستويات</h4>
        </div>

        <div className="space-y-2">
          {Object.entries(sessionStats.difficultyBreakdown).map(
            ([difficulty, count]) => {
              const percentage = (count / sessionStats.totalWords) * 100;
              const colors = {
                سهل: { bg: 'bg-green-500', text: 'text-green-400' },
                متوسط: { bg: 'bg-yellow-500', text: 'text-yellow-400' },
                صعب: { bg: 'bg-red-500', text: 'text-red-400' },
              };
              const color = colors[difficulty as keyof typeof colors];

              return (
                <div key={difficulty} className="flex items-center space-x-3">
                  <div className="w-16 text-sm text-gray-400">{difficulty}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`${color.bg} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div
                    className={`text-sm ${color.text} font-medium w-12 text-right`}
                  >
                    {count}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(sessionStats.categoryBreakdown).length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="text-gray-400" size={16} />
            <h4 className="text-white font-medium">التصنيفات</h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(sessionStats.categoryBreakdown).map(
              ([category, count]) => (
                <div
                  key={category}
                  className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600/50"
                >
                  <span className="text-gray-300 text-sm">{category}</span>
                  <span className="text-blue-400 text-sm font-medium">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Challenge Preview */}
      {sessionStats.hardestWords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Target className="text-gray-400" size={16} />
            <h4 className="text-white font-medium">أصعب الكلمات</h4>
          </div>

          <div className="grid gap-2 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-1">
            {sessionStats.hardestWords.slice(0, 3).map((word, index) => (
              <div
                key={word.id}
                className="flex items-center justify-between bg-red-900/20 rounded-lg p-3 border border-red-800/30"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 font-bold text-sm">
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium">{word.word}</span>
                </div>
                <div className="text-red-400 text-sm">
                  {word.easeFactor.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex lg:flex-col gap-4 max-md:flex-col">
        {/* Session Tips */}
        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30 grow">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="text-blue-400" size={16} />
            <h4 className="text-blue-400 font-medium">نصائح للجلسة</h4>
          </div>

          <div className="space-y-2 text-sm text-blue-300">
            {mode === 'speed' && (
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-1">⚡</span>
                <span>استعد للإجابة السريعة - لديك 10 ثواني لكل كلمة</span>
              </div>
            )}

            {mode === 'challenge' && (
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 mt-1">🏆</span>
                <span>حاول الحفاظ على سلسلة إجابات صحيحة طويلة</span>
              </div>
            )}

            {mode === 'reverse' && (
              <div className="flex items-start space-x-2">
                <span className="text-green-400 mt-1">🔄</span>
                <span>ستبدأ بالمعنى وعليك تذكر الكلمة - أصعب من المعتاد</span>
              </div>
            )}

            {mode === 'reading' && (
              <div className="flex items-start space-x-2">
                <span className="text-indigo-400 mt-1">📚</span>
                <span>مراجعة سريعة لتقوية الذاكرة البصرية</span>
              </div>
            )}

            {sessionStats.averageEaseFactor < 2.0 && (
              <div className="flex items-start space-x-2">
                <span className="text-orange-400 mt-1">💪</span>
                <span>هذه الكلمات صعبة - خذ وقتك في التفكير</span>
              </div>
            )}

            {sessionStats.needReview / sessionStats.totalWords > 0.8 && (
              <div className="flex items-start space-x-2">
                <span className="text-red-400 mt-1">🔥</span>
                <span>معظم الكلمات تحتاج مراجعة - ركز جيداً</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Prediction */}
        {sessionStats.totalWords > 0 && (
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/30 grow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <TrendingUp className="text-green-400" size={16} />
                <h4 className="text-green-400 font-medium">المتوقع</h4>
              </div>
              <div className="text-green-400 text-sm">
                بناءً على أدائك السابق
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-400 mb-1">
                  {Math.round(65 + sessionStats.averageEaseFactor * 10)}%
                </div>
                <div className="text-xs text-gray-400">معدل نجاح متوقع</div>
              </div>

              <div>
                <div className="text-lg font-bold text-blue-400 mb-1">
                  {Math.round(sessionStats.totalWords * 0.3)}
                </div>
                <div className="text-xs text-gray-400">كلمات ستتحسن</div>
              </div>

              <div>
                <div className="text-lg font-bold text-purple-400 mb-1">
                  +{Math.round(sessionStats.averageEaseFactor * 0.1 * 100)}
                </div>
                <div className="text-xs text-gray-400">نقاط خبرة</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionPreview;
