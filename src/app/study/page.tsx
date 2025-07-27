// src/app/study/page.tsx
'use client';

import SoundFeedback, { useSoundFeedback } from '@/components/SoundFeedback';
import StudySettings from '@/components/StudySettings';
import SwipeGestures from '@/components/SwipeGestures';
import { useApp } from '@/context/AppContext';
import { StudyFilters, StudyMode, Word } from '@/types/flashcard';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  FastForward,
  Flame,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  SkipForward,
  Target,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export default function StudyPage() {
  const { words, updateProgressWithQuality } = useApp();
  const { playSound } = useSoundFeedback(true);
  
  // Study State
  const [currentMode, setCurrentMode] = useState<StudyMode>('classic');
  const [currentFilters, setCurrentFilters] = useState<StudyFilters>({
    categories: [],
    difficulties: ['all'],
    needsReview: false,
    masteredOnly: false,
    hardestFirst: false,
    randomOrder: true,
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, streak: 0, points: 0 });
  const [showResult, setShowResult] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Speed Mode State
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // فلترة وترتيب الكلمات للدراسة
  const wordsToStudy = useMemo(() => {
    let filtered = words;

    // تطبيق الفلاتر
    if (currentFilters.needsReview) {
      filtered = filtered.filter(w => w.nextReview <= Date.now());
    }
    
    if (currentFilters.masteredOnly) {
      filtered = filtered.filter(w => w.correctCount >= 3);
    }
    
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(w => currentFilters.categories.includes(w.category));
    }
    
    if (!currentFilters.difficulties.includes('all')) {
      filtered = filtered.filter(w => currentFilters.difficulties.includes(w.difficulty as any));
    }

    // ترتيب الكلمات
    if (currentFilters.hardestFirst) {
      filtered = [...filtered].sort((a, b) => a.easeFactor - b.easeFactor);
    } else if (currentFilters.randomOrder) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [words, currentFilters]);

  const currentWord = wordsToStudy[currentIndex];
  const progress = wordsToStudy.length > 0 ? ((currentIndex + 1) / wordsToStudy.length) * 100 : 0;

  // Speed Mode Timer
  useEffect(() => {
    if (currentMode === 'speed' && sessionStarted && !isPaused && !showResult && !sessionComplete && isFlipped) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // وقت انتهى - تقييم تلقائي كصعب
            handleAnswer(1);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentMode, sessionStarted, isPaused, showResult, sessionComplete, isFlipped]);

  // Reading Mode Auto Advance
  useEffect(() => {
    if (currentMode === 'reading' && sessionStarted && autoAdvance && !sessionComplete) {
      const timer = setTimeout(() => {
        if (currentIndex < wordsToStudy.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        } else {
          setSessionComplete(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentMode, sessionStarted, autoAdvance, currentIndex, wordsToStudy.length, sessionComplete]);

  // معالج بدء الدراسة
  const handleStartStudy = (mode: StudyMode, filters: StudyFilters) => {
    setCurrentMode(mode);
    setCurrentFilters(filters);
    setSessionStarted(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, streak: 0, points: 0 });
    setShowResult(false);
    setSessionComplete(false);
    setTimeLeft(5);
    setAutoAdvance(mode === 'reading');
  };

  // معالج الإجابة
  const handleAnswer = useCallback((quality: number) => {
    if (!currentWord) return;

    updateProgressWithQuality(currentWord.id, quality);
    
    const isCorrect = quality >= 3;
    const newStreak = isCorrect ? sessionStats.streak + 1 : 0;
    const pointsEarned = isCorrect ? (quality * 10 + (newStreak * 5)) : 0;
    
    // تشغيل الصوت المناسب
    if (soundEnabled) {
      if (isCorrect) {
        if (newStreak > sessionStats.streak && newStreak >= 3) {
          playSound('streak'); // صوت streak جديد
        } else {
          playSound('success'); // صوت نجاح عادي
        }
      } else {
        playSound('error'); // صوت خطأ
      }
    }
    
    setSessionStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      streak: newStreak,
      points: prev.points + pointsEarned,
    }));

    setShowResult(true);
    setTimeLeft(5); // إعادة تعيين المؤقت

    // الانتقال للكلمة التالية
    setTimeout(() => {
      if (currentIndex < wordsToStudy.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setShowResult(false);
      } else {
        // انتهت الجلسة
        if (soundEnabled) {
          playSound('complete');
        }
        setSessionComplete(true);
      }
    }, currentMode === 'speed' ? 1000 : 1500);
  }, [currentWord, updateProgressWithQuality, sessionStats.streak, currentIndex, wordsToStudy.length, currentMode, soundEnabled, playSound]);

  // Swipe Gestures Handlers
  const handleSwipeLeft = () => {
    if (soundEnabled) playSound('swipe');
    if (isFlipped && currentMode !== 'reading') {
      // Swipe left = صعب
      handleAnswer(2);
    } else {
      skipWord();
    }
  };

  const handleSwipeRight = () => {
    if (soundEnabled) playSound('swipe');
    if (isFlipped && currentMode !== 'reading') {
      // Swipe right = سهل
      handleAnswer(4);
    } else {
      skipWord();
    }
  };

  const handleSwipeUp = () => {
    if (soundEnabled) playSound('swipe');
    // Swipe up = إعادة تشغيل الجلسة
    if (sessionComplete) {
      restartSession();
    }
  };

  const handleSwipeDown = () => {
    if (soundEnabled) playSound('swipe');
    // Swipe down = تخطي أو pause
    if (currentMode === 'reading' && autoAdvance) {
      setAutoAdvance(false);
    } else {
      skipWord();
    }
  };

  const handleCardTap = () => {
    if (currentMode !== 'reading') {
      if (soundEnabled) playSound('flip');
      setIsFlipped(!isFlipped);
    }
  };
  const skipWord = () => {
    if (currentIndex < wordsToStudy.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowResult(false);
      setTimeLeft(5);
    } else {
      setSessionComplete(true);
    }
  };

  // إعادة تشغيل الجلسة
  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, streak: 0, points: 0 });
    setShowResult(false);
    setSessionComplete(false);
    setTimeLeft(5);
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

  // رندر أزرار حسب النمط
  const renderModeSpecificButtons = () => {
    if (!isFlipped) return null;

    switch (currentMode) {
      case 'speed':
        return (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleAnswer(2)}
              className="flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700 text-white py-6 lg:py-8 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg"
            >
              <XCircle size={24} />
              <span>صعب</span>
            </button>
            <button
              onClick={() => handleAnswer(4)}
              className="flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white py-6 lg:py-8 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg"
            >
              <CheckCircle size={24} />
              <span>سهل</span>
            </button>
          </div>
        );

      case 'challenge':
        return (
          <div className="space-y-4 mb-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-4 mb-3">
                <div className="flex items-center space-x-2 bg-yellow-900/30 rounded-xl px-4 py-2 border border-yellow-800/50">
                  <Flame size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 font-bold">Streak: {sessionStats.streak}</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-900/30 rounded-xl px-4 py-2 border border-purple-800/50">
                  <Trophy size={16} className="text-purple-400" />
                  <span className="text-purple-400 font-bold">{sessionStats.points} نقطة</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { quality: 2, label: 'صعب', color: 'bg-red-600 hover:bg-red-700', points: 20 },
                { quality: 3, label: 'متوسط', color: 'bg-yellow-600 hover:bg-yellow-700', points: 30 },
                { quality: 5, label: 'سهل', color: 'bg-green-600 hover:bg-green-700', points: 50 },
              ].map((option) => (
                <button
                  key={option.quality}
                  onClick={() => handleAnswer(option.quality)}
                  className={`
                    flex flex-col items-center justify-center ${option.color} text-white 
                    py-4 lg:py-6 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg
                  `}
                >
                  <span className="text-lg lg:text-xl mb-1">{option.label}</span>
                  <span className="text-xs opacity-80">+{option.points + (sessionStats.streak * 5)} نقطة</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'reading':
        return (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`
                flex items-center space-x-2 px-6 py-4 rounded-2xl font-semibold transition-all touch-manipulation
                ${autoAdvance 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }
              `}
            >
              {autoAdvance ? <Pause size={20} /> : <Play size={20} />}
              <span>{autoAdvance ? 'إيقاف' : 'تشغيل'} التلقائي</span>
            </button>
            
            <button
              onClick={skipWord}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <FastForward size={20} />
              <span>التالي</span>
            </button>
          </div>
        );

      default: // classic, reverse
        return (
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
          </div>
        );
    }
  };

  // عرض المحتوى حسب الحالة
  if (!sessionStarted) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center py-16 lg:py-24">
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Brain size={48} className="text-white lg:w-16 lg:h-16" />
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">مرحباً بك في جلسة الدراسة! 🚀</h1>
            <p className="text-xl lg:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              اختر نمط الدراسة والفلاتر لتخصيص تجربة التعلم حسب احتياجاتك
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <Settings size={20} />
                <span>إعداد الجلسة</span>
              </button>
              
              <Link
                href="/"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <ArrowRight size={20} />
                <span>العودة للرئيسية</span>
              </Link>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 max-w-2xl mx-auto mt-12">
              <h3 className="text-xl font-bold text-white mb-6">إحصائيات سريعة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{words.length}</div>
                  <div className="text-gray-400">إجمالي الكلمات</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {words.filter(w => w.nextReview <= Date.now()).length}
                  </div>
                  <div className="text-gray-400">تحتاج مراجعة</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {words.filter(w => w.correctCount >= 3).length}
                  </div>
                  <div className="text-gray-400">محفوظة</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StudySettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onStartStudy={handleStartStudy}
          availableWordsCount={words.length}
        />
      </>
    );
  }

  // لا توجد كلمات للمراجعة
  if (wordsToStudy.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16 lg:py-24">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Target size={48} className="text-white lg:w-16 lg:h-16" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">لا توجد كلمات مطابقة! 🔍</h1>
          <p className="text-xl lg:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            الفلاتر المحددة لا تطابق أي كلمات. جرب تعديل الإعدادات أو إضافة كلمات جديدة.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Settings size={20} />
              <span>تعديل الإعدادات</span>
            </button>
            
            <button
              onClick={() => setSessionStarted(false)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <ArrowRight size={20} />
              <span>العودة</span>
            </button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">{totalAnswered}</div>
                <div className="text-gray-400">كلمات راجعتها</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">{sessionStats.correct}</div>
                <div className="text-gray-400">إجابات صحيحة</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">{successRate}%</div>
                <div className="text-gray-400">معدل النجاح</div>
              </div>
              {currentMode === 'challenge' && (
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">{sessionStats.points}</div>
                  <div className="text-gray-400">نقاط مكتسبة</div>
                </div>
              )}
            </div>

            {/* Challenge Mode Stats */}
            {currentMode === 'challenge' && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2 bg-yellow-900/30 rounded-xl px-4 py-2 border border-yellow-800/50">
                    <Flame size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold">أطول Streak: {sessionStats.streak}</span>
                  </div>
                </div>
              </div>
            )}

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
            
            <button
              onClick={() => setSessionStarted(false)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Settings size={20} />
              <span>إعدادات جديدة</span>
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
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
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {currentMode === 'speed' && '⚡ التحدي السريع'}
              {currentMode === 'reverse' && '🔄 المراجعة العكسية'}
              {currentMode === 'challenge' && '🎯 وضع التحدي'}
              {currentMode === 'reading' && '👁️ القراءة السريعة'}
              {currentMode === 'classic' && '🧠 المراجعة الكلاسيكية'}
            </h1>
            <p className="text-gray-400">
              الكلمة {currentIndex + 1} من {wordsToStudy.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSound('tick');
              }}
              className={`
                p-2 rounded-xl transition-all touch-manipulation
                ${soundEnabled 
                  ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }
              `}
              title={soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Speed Mode Timer */}
            {currentMode === 'speed' && isFlipped && (
              <div className={`
                flex items-center space-x-2 px-4 py-2 rounded-xl font-bold
                ${timeLeft <= 2 ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                  'bg-blue-900/30 text-blue-400 border border-blue-800/50'}
              `}>
                <Timer size={16} />
                <span>{timeLeft}s</span>
              </div>
            )}
            
            {/* Challenge Mode Points */}
            {currentMode === 'challenge' && (
              <div className="flex items-center space-x-2 bg-purple-900/30 rounded-xl px-4 py-2 border border-purple-800/50">
                <Trophy size={16} className="text-purple-400" />
                <span className="text-purple-400 font-bold">{sessionStats.points}</span>
              </div>
            )}
            
            <div className="text-right">
              <div className="text-lg lg:text-xl font-bold text-white">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-gray-400">مكتمل</div>
            </div>
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
          {currentMode === 'challenge' && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <Flame size={16} />
              <span>Streak: {sessionStats.streak}</span>
            </div>
          )}
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
              ${sessionStats.correct > sessionStats.incorrect ? 'bg-green-500' : 'bg-red-500'}
            `}>
              {sessionStats.correct > sessionStats.incorrect ? (
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
            onClick={() => currentMode !== 'reading' && setIsFlipped(!isFlipped)}
          >
            {/* الوجه المناسب حسب النمط */}
            {currentMode === 'reverse' ? (
              <>
                {/* الوجه الأمامي - المعنى */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
                  <div className="text-center">
                    <h2 className="text-3xl lg:text-5xl font-bold mb-6 lg:mb-8 leading-relaxed">{currentWord.meaning}</h2>
                    <p className="text-green-100 mb-8 text-lg lg:text-xl">ما هي الكلمة الإنجليزية؟</p>
                    
                    <div className="flex items-center justify-center gap-6 text-sm lg:text-base">
                      <div className={`w-4 h-4 rounded-full ${getDifficultyColor(currentWord.difficulty)}`} />
                      <span className="text-green-200">{currentWord.difficulty}</span>
                      <span className="text-green-300">•</span>
                      <span className="text-green-200">{currentWord.category}</span>
                    </div>
                  </div>
                </div>

                {/* الوجه الخلفي - الكلمة */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
                  <div className="text-center">
                    <div className="text-sm lg:text-base text-blue-100 mb-4 opacity-80">{currentWord.meaning}</div>
                    <h2 className="text-4xl lg:text-6xl font-bold mb-6 lg:mb-8">{currentWord.word}</h2>
                    
                    {currentWord.note && (
                      <div className="bg-blue-800/30 rounded-2xl p-4 lg:p-6 border border-blue-600/30 mb-6">
                        <p className="text-blue-100 text-lg lg:text-xl italic">💡 {currentWord.note}</p>
                      </div>
                    )}
                    
                    <p className="text-blue-100 text-lg lg:text-xl">كيف كان أداؤك؟</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* الوجه الأمامي - الكلمة */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
                  <div className="text-center">
                    <h2 className="text-4xl lg:text-6xl font-bold mb-6 lg:mb-8">{currentWord.word}</h2>
                    {currentMode === 'reading' ? (
                      <p className="text-blue-100 mb-6 text-lg lg:text-xl">{currentWord.meaning}</p>
                    ) : (
                      <p className="text-blue-100 mb-8 text-lg lg:text-xl">
                        {currentMode === 'speed' ? 'اضغط لرؤية المعنى - سريعاً!' : 'انقر لرؤية المعنى'}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-6 text-sm lg:text-base">
                      <div className={`w-4 h-4 rounded-full ${getDifficultyColor(currentWord.difficulty)}`} />
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
                        <p className="text-green-100 text-lg lg:text-xl italic">💡 {currentWord.note}</p>
                      </div>
                    )}
                    
                    {currentMode !== 'reading' && (
                      <p className="text-green-100 text-lg lg:text-xl">كيف كان أداؤك؟</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="max-w-2xl mx-auto mt-8 lg:mt-12">
        {isFlipped || currentMode === 'reading' ? (
          renderModeSpecificButtons()
        ) : (
          /* زر إظهار المعنى */
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 lg:py-8 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg mb-6"
          >
            <RotateCcw size={24} />
            <span>
              {currentMode === 'reverse' ? 'إظهار الكلمة' : 'إظهار المعنى'}
            </span>
          </button>
        )}

        {/* أزرار إضافية */}
        {currentMode !== 'reading' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 lg:py-5 rounded-2xl font-medium transition-all border border-gray-700 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <RotateCcw size={20} />
              <span>{isFlipped ? 'إخفاء' : 'إظهار'}</span>
            </button>
            
            <button
              onClick={skipWord}
              className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 lg:py-5 rounded-2xl font-medium transition-all border border-gray-700 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <SkipForward size={20} />
              <span>تخطي</span>
            </button>
          </div>
        )}
      </div>

      {/* StudySettings Modal */}
      <StudySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onStartStudy={handleStartStudy}
        availableWordsCount={words.length}
      />
    </div>
  );
}