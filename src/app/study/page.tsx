// src/app/study/page.tsx
'use client';

import { useApp } from '@/context/AppContext';
import { Word } from '@/types/flashcard';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  RotateCcw,
  SkipForward,
  Target,
  Trophy,
  XCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

export default function StudyPage() {
  const { words, updateProgressWithQuality } = useApp();
  
  // Study State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [showResult, setShowResult] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // كلمات تحتاج للمراجعة
  const wordsToStudy = useMemo(() => {
    return words.filter(w => w.nextReview <= Date.now());
  }, [words]);

  const currentWord = wordsToStudy[currentIndex];
  const progress = wordsToStudy.length > 0 ? ((currentIndex + 1) / wordsToStudy.length) * 100 : 0;

  // Reset session عند تغيير الكلمات
  useEffect(() => {
    if (wordsToStudy.length === 0) {
      setSessionComplete(true);
    } else {
      setSessionComplete(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionStats({ correct: 0, incorrect: 0 });
    }
  }, [wordsToStudy.length]);

  // معالج الإجابة
  const handleAnswer = (quality: number) => {
    if (!currentWord) return;

    updateProgressWithQuality(currentWord.id, quality);
    
    // تحديث إحصائيات الجلسة
    setSessionStats(prev => ({
      ...prev,
      [quality >= 3 ? 'correct' : 'incorrect']: prev[quality >= 3 ? 'correct' : 'incorrect'] + 1
    }));

    setShowResult(true);

    // الانتقال للكلمة التالية بعد تأخير
    setTimeout(() => {
      if (currentIndex < wordsToStudy.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setShowResult(false);
      } else {
        // انتهت الجلسة
        setSessionComplete(true);
      }
    }, 1500);
  };

  // تخطي الكلمة
  const skipWord = () => {
    if (currentIndex < wordsToStudy.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowResult(false);
    } else {
      setSessionComplete(true);
    }
  };

  // إعادة تشغيل الجلسة
  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setShowResult(false);
    setSessionComplete(false);
  };

  // الحصول على لون الصعوبة
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-500';
      case 'متوسط': return 'bg-yellow-500';
      case 'صعب': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // لا توجد كلمات للمراجعة
  if (wordsToStudy.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16 lg:py-24">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Trophy size={48} className="text-white lg:w-16 lg:h-16" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">أحسنت! 🎉</h1>
          <p className="text-xl lg:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            لا توجد كلمات تحتاج للمراجعة في الوقت الحالي. جميع كلماتك محدثة!
          </p>
          
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {words.length}
                </div>
                <div className="text-gray-400">إجمالي الكلمات</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                  {words.filter(w => w.correctCount >= 3).length}
                </div>
                <div className="text-gray-400">كلمات محفوظة</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  {words.length > 0 ? Math.round((words.filter(w => w.correctCount >= 3).length / words.length) * 100) : 0}%
                </div>
                <div className="text-gray-400">معدل الإتقان</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/cards"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Target size={20} />
              <span>تصفح البطاقات</span>
            </Link>
            
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <ArrowRight size={20} />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // انتهت الجلسة
  if (sessionComplete) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const successRate = totalAnswered > 0 ? Math.round((sessionStats.correct / totalAnswered) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16 lg:py-24">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Trophy size={48} className="text-white lg:w-16 lg:h-16" />
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">انتهت الجلسة! 🎊</h1>
          <p className="text-xl lg:text-2xl text-gray-400 mb-8">عمل رائع! إليك ملخص أدائك</p>

          {/* نتائج الجلسة */}
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {totalAnswered}
                </div>
                <div className="text-gray-400">كلمات راجعتها</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                  {sessionStats.correct}
                </div>
                <div className="text-gray-400">إجابات صحيحة</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  {successRate}%
                </div>
                <div className="text-gray-400">معدل النجاح</div>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="mt-8">
              <div className="w-full bg-gray-700 rounded-full h-3 lg:h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${successRate}%` }}
                />
              </div>
              <p className="text-sm lg:text-base text-gray-400 mt-2">
                {successRate >= 80 ? 'أداء ممتاز! 🌟' : 
                 successRate >= 60 ? 'أداء جيد! 👍' : 
                 'يمكنك التحسن أكثر! 💪'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={restartSession}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <RefreshCw size={20} />
              <span>إعادة الجلسة</span>
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <ArrowRight size={20} />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Header مع Progress */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">جلسة المراجعة</h1>
            <p className="text-gray-400">
              الكلمة {currentIndex + 1} من {wordsToStudy.length}
            </p>
          </div>
          
          <div className="text-left">
            <div className="text-lg lg:text-xl font-bold text-white">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-gray-400">مكتمل</div>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="w-full bg-gray-800 rounded-full h-2 lg:h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats الجلسة */}
        <div className="flex items-center justify-center space-x-6 text-sm lg:text-base">
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle size={16} />
            <span>{sessionStats.correct} صحيح</span>
          </div>
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle size={16} />
            <span>{sessionStats.incorrect} خطأ</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock size={16} />
            <span>{sessionStats.correct + sessionStats.incorrect} / {wordsToStudy.length}</span>
          </div>
        </div>
      </div>

      {/* البطاقة الرئيسية */}
      <div className="relative max-w-2xl mx-auto">
        {/* نتيجة الإجابة */}
        {showResult && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
            <div className={`
              w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center shadow-2xl
              ${sessionStats.correct + sessionStats.incorrect > 0 && 
                sessionStats.correct > sessionStats.incorrect ? 
                'bg-green-500' : 'bg-red-500'
              }
            `}>
              {sessionStats.correct + sessionStats.incorrect > 0 && 
               sessionStats.correct > sessionStats.incorrect ? (
                <CheckCircle size={48} className="text-white lg:w-16 lg:h-16" />
              ) : (
                <XCircle size={48} className="text-white lg:w-16 lg:h-16" />
              )}
            </div>
          </div>
        )}

        {/* البطاقة */}
        <div className="relative w-full h-96 lg:h-[28rem] perspective-1000">
          <div
            className={`
              relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer
              ${isFlipped ? 'rotate-y-180' : ''}
            `}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* الوجه الأمامي - الكلمة */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
              <div className="text-center">
                <h2 className="text-4xl lg:text-6xl font-bold mb-6 lg:mb-8">{currentWord.word}</h2>
                <p className="text-blue-100 mb-8 text-lg lg:text-xl">انقر لرؤية المعنى</p>
                
                <div className="flex items-center justify-center gap-6 text-sm lg:text-base">
                  <div className={`
                    w-4 h-4 rounded-full ${getDifficultyColor(currentWord.difficulty)}
                  `} />
                  <span className="text-blue-200">{currentWord.difficulty}</span>
                  <span className="text-blue-300">•</span>
                  <span className="text-blue-200">{currentWord.category}</span>
                </div>
              </div>
            </div>

            {/* الوجه الخلفي - المعنى */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
              <div className="text-center">
                <div className="text-sm lg:text-base text-green-100 mb-4 opacity-80">{currentWord.word}</div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 lg:mb-8 leading-relaxed">{currentWord.meaning}</h2>
                
                {currentWord.note && (
                  <div className="bg-green-800/30 rounded-2xl p-4 lg:p-6 border border-green-600/30 mb-6">
                    <p className="text-green-100 text-lg lg:text-xl italic">
                      💡 {currentWord.note}
                    </p>
                  </div>
                )}
                
                <p className="text-green-100 text-lg lg:text-xl">كيف كان أداؤك؟</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="max-w-2xl mx-auto mt-8 lg:mt-12">
        {isFlipped ? (
          /* أزرار التقييم المتدرج (0-5) */
          <div className="space-y-4 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
                كيف كان أداؤك؟
              </h3>
              <p className="text-gray-400 text-sm lg:text-base mb-3">
                اختر مستوى صعوبة تذكر هذه الكلمة
              </p>
              <div className="bg-blue-900/20 rounded-xl p-3 border border-blue-800/30">
                <p className="text-blue-300 text-xs lg:text-sm">
                  🧠 النظام الذكي سيحدد توقيت المراجعة القادمة بناءً على تقييمك
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {[
                { quality: 0, label: 'نسيت تماماً', color: 'bg-red-700 hover:bg-red-800', emoji: '😰' },
                { quality: 1, label: 'صعب جداً', color: 'bg-red-600 hover:bg-red-700', emoji: '😟' },
                { quality: 2, label: 'صعب', color: 'bg-orange-600 hover:bg-orange-700', emoji: '🤔' },
                { quality: 3, label: 'متوسط', color: 'bg-yellow-600 hover:bg-yellow-700', emoji: '😐' },
                { quality: 4, label: 'جيد', color: 'bg-green-600 hover:bg-green-700', emoji: '😊' },
                { quality: 5, label: 'سهل جداً', color: 'bg-green-700 hover:bg-green-800', emoji: '😍' },
              ].map((option) => (
                <button
                  key={option.quality}
                  onClick={() => handleAnswer(option.quality)}
                  className={`
                    flex items-center justify-center space-x-2 ${option.color} text-white 
                    py-4 lg:py-5 rounded-2xl lg:rounded-3xl font-semibold text-base lg:text-lg 
                    transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg
                  `}
                >
                  <span className="text-xl lg:text-2xl">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            
            <div className="text-center text-xs lg:text-sm text-gray-500 mt-4">
              💡 كلما قيّمت بصدق، كلما تحسن توقيت المراجعة
            </div>
          </div>
        ) : (
          /* زر إظهار المعنى */
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 lg:py-8 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg mb-6"
          >
            <RotateCcw size={24} />
            <span>إظهار المعنى</span>
          </button>
        )}

        {/* أزرار إضافية */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 lg:py-5 rounded-2xl font-medium transition-all border border-gray-700 hover:scale-105 active:scale-95 touch-manipulation"
          >
            <RotateCcw size={20} />
            <span>{isFlipped ? 'إخفاء المعنى' : 'إظهار المعنى'}</span>
          </button>
          
          <button
            onClick={skipWord}
            className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 lg:py-5 rounded-2xl font-medium transition-all border border-gray-700 hover:scale-105 active:scale-95 touch-manipulation"
          >
            <SkipForward size={20} />
            <span>تخطي</span>
          </button>
        </div>
      </div>
    </div>
  );
}