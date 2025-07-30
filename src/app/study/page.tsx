// src/app/study/page.tsx
'use client';

import StudyFilters from '@/components/study/StudyFilters';
import StudyModeSelector from '@/components/study/StudyModeSelector';
import { useApp } from '@/context/AppContext';
import {
  StudyFilters as StudyFiltersType,
  StudyMode,
  Word,
} from '@/types/flashcard';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  SkipForward,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export default function StudyPage() {
  const { words, updateProgressWithQuality } = useApp();

  // Study Mode State
  const [currentMode, setCurrentMode] = useState<StudyMode>('classic');
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<StudyFiltersType>({
    categories: [],
    difficulties: [],
    needsReview: false,
    masteredOnly: false,
    hardestFirst: false,
    randomOrder: false,
  });

  // Session State
  const [sessionWords, setSessionWords] = useState<Word[]>([]); // الكلمات المجمدة للجلسة
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
    maxStreak: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [currentWordResult, setCurrentWordResult] = useState<boolean | null>(
    null
  );
  const [sessionComplete, setSessionComplete] = useState(false);

  // Speed Mode State
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [sessionTimestamp, setSessionTimestamp] = useState<number>(Date.now());

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(words.map((w) => w.category)));
  }, [words]);

  // Apply filters to words (only for preview, not during active session)
  const filteredWords = useMemo(() => {
    // إذا كانت الجلسة نشطة، استخدم الكلمات المجمدة
    if (isStudyActive && sessionWords.length > 0) {
      return sessionWords;
    }

    // وإلا احسب الفلترة العادية للمعاينة
    let filtered = [...words];

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((w) =>
        filters.categories.includes(w.category)
      );
    }

    // Apply difficulty filter
    if (filters.difficulties.length > 0) {
      filtered = filtered.filter((w) =>
        filters.difficulties.includes(w.difficulty)
      );
    }

    // Apply review status filter - استخدم sessionTimestamp بدلاً من Date.now()
    if (filters.needsReview) {
      filtered = filtered.filter((w) => w.nextReview <= sessionTimestamp);
    }

    // Apply mastery filter
    if (filters.masteredOnly) {
      filtered = filtered.filter((w) => w.correctCount >= 3);
    } else if (!filters.needsReview) {
      // If not filtering for mastered only and not filtering for needs review, filter for needs review by default
      filtered = filtered.filter((w) => w.nextReview <= sessionTimestamp);
    }

    // Apply sorting
    if (filters.hardestFirst) {
      filtered.sort((a, b) => a.easeFactor - b.easeFactor);
    } else if (filters.randomOrder) {
      // إنشاء نسخة مختلطة بناءً على sessionTimestamp للاستقرار
      const seed = sessionTimestamp % 1000000;
      filtered.sort((a, b) => {
        // استخدام seed ثابت للترتيب العشوائي المستقر
        const hashA = ((a.id * seed) % 1000) / 1000;
        const hashB = ((b.id * seed) % 1000) / 1000;
        return hashA - hashB;
      });
    } else {
      // Default: prioritize words that need review and have low ease factor
      filtered.sort((a, b) => {
        const aScore =
          (a.nextReview <= sessionTimestamp ? 100 : 0) +
          (5 - a.easeFactor) * 10;
        const bScore =
          (b.nextReview <= sessionTimestamp ? 100 : 0) +
          (5 - b.easeFactor) * 10;
        return bScore - aScore;
      });
    }

    return filtered;
  }, [words, filters, sessionTimestamp, isStudyActive, sessionWords]);

  const currentWord = filteredWords[currentIndex];

  // Timer for speed mode
  useEffect(() => {
    if (
      currentMode === 'speed' &&
      timeLeft > 0 &&
      !isPaused &&
      isStudyActive &&
      !showResult
    ) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (
      currentMode === 'speed' &&
      timeLeft === 0 &&
      isStudyActive &&
      !showResult
    ) {
      // Auto advance on timeout
      handleAnswer(1); // Consider timeout as difficult
    }
  }, [timeLeft, isPaused, currentMode, isStudyActive, showResult]);

  // Auto advance for reading mode
  useEffect(() => {
    if (
      currentMode === 'reading' &&
      autoAdvance &&
      isStudyActive &&
      !showResult
    ) {
      const timer = setTimeout(() => {
        if (currentIndex < filteredWords.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
          setTimeout(() => setIsFlipped(true), 1000);
        } else {
          setSessionComplete(true);
        }
      }, 3000); // 3 seconds per word in reading mode
      return () => clearTimeout(timer);
    }
  }, [
    currentMode,
    autoAdvance,
    isStudyActive,
    currentIndex,
    filteredWords.length,
    showResult,
  ]);

  // Reset session when starting study
  const startStudy = useCallback(() => {
    const now = Date.now(); // احصل على الوقت مرة واحدة فقط
    setSessionTimestamp(now); // حدث الـ timestamp

    // احسب الكلمات المفلترة وجمدها للجلسة
    let filtered = [...words];

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((w) =>
        filters.categories.includes(w.category)
      );
    }

    // Apply difficulty filter
    if (filters.difficulties.length > 0) {
      filtered = filtered.filter((w) =>
        filters.difficulties.includes(w.difficulty)
      );
    }

    // Apply review status filter
    if (filters.needsReview) {
      filtered = filtered.filter((w) => w.nextReview <= now);
    }

    // Apply mastery filter
    if (filters.masteredOnly) {
      filtered = filtered.filter((w) => w.correctCount >= 3);
    } else if (!filters.needsReview) {
      filtered = filtered.filter((w) => w.nextReview <= now);
    }

    // Apply sorting
    if (filters.hardestFirst) {
      filtered.sort((a, b) => a.easeFactor - b.easeFactor);
    } else if (filters.randomOrder) {
      const seed = now % 1000000;
      filtered.sort((a, b) => {
        const hashA = ((a.id * seed) % 1000) / 1000;
        const hashB = ((b.id * seed) % 1000) / 1000;
        return hashA - hashB;
      });
    } else {
      filtered.sort((a, b) => {
        const aScore =
          (a.nextReview <= now ? 100 : 0) + (5 - a.easeFactor) * 10;
        const bScore =
          (b.nextReview <= now ? 100 : 0) + (5 - b.easeFactor) * 10;
        return bScore - aScore;
      });
    }

    // جمد الكلمات للجلسة
    setSessionWords(filtered);
    setIsStudyActive(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setShowResult(false);
    setCurrentWordResult(null);
    setSessionComplete(false);
    setTimeLeft(currentMode === 'speed' ? 10 : 0);
    setAutoAdvance(currentMode === 'reading');
  }, [words, filters, currentMode]);

  // Handle answer based on study mode
  const handleAnswer = (quality: number) => {
    if (!currentWord) return;

    updateProgressWithQuality(currentWord.id, quality);

    const isCorrect = quality >= 3;

    // حفظ نتيجة الكلمة الحالية للـ overlay
    setCurrentWordResult(isCorrect);

    const newStreak = isCorrect ? sessionStats.streak + 1 : 0;

    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      streak: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
    }));

    setShowResult(true);

    // Auto advance timing based on mode
    const delay =
      currentMode === 'speed' ? 800 : currentMode === 'reading' ? 500 : 1500;

    setTimeout(() => {
      if (currentIndex < filteredWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        setShowResult(false);
        setCurrentWordResult(null); // إعادة تعيين النتيجة
        setTimeLeft(currentMode === 'speed' ? 10 : 0);
      } else {
        setSessionComplete(true);
      }
    }, delay);
  };

  // Skip current word
  const skipWord = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowResult(false);
      setTimeLeft(currentMode === 'speed' ? 10 : 0);
    } else {
      setSessionComplete(true);
    }
  };

  // Restart session
  const restartSession = () => {
    // إعادة استخدام نفس الكلمات المجمدة
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setShowResult(false);
    setCurrentWordResult(null);
    setSessionComplete(false);
    setTimeLeft(currentMode === 'speed' ? 10 : 0);
    setAutoAdvance(currentMode === 'reading');
    // لا نحدث sessionWords - نبقي نفس القائمة المجمدة
  };

  const endSession = () => {
    setIsStudyActive(false);
    setSessionWords([]); // مسح الكلمات المجمدة
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0, streak: 0, maxStreak: 0 });
    setShowResult(false);
    setCurrentWordResult(null);
    setSessionComplete(false);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل':
        return 'bg-green-500';
      case 'متوسط':
        return 'bg-yellow-500';
      case 'صعب':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Mode selection phase
  if (!isStudyActive && !sessionComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Filters Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            إعداد جلسة الدراسة
          </h1>
          <StudyFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
            wordsCount={words.length}
            filteredCount={filteredWords.length}
          />
        </div>

        {/* Filters Panel
        {showFilters && (
          <div className="mb-8">
            <StudyFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              isOpen={true}
              onToggle={() => setShowFilters(!showFilters)}
              wordsCount={words.length}
              filteredCount={filteredWords.length}
            />
          </div>
        )} */}

        {/* Mode Selector */}
        <StudyModeSelector
          selectedMode={currentMode}
          onModeSelect={setCurrentMode}
          onStartStudy={startStudy}
          wordsCount={filteredWords.length}
          filteredWords={filteredWords}
          filters={filters}
          className="mb-8 lg:mb-12"
        />
      </div>
    );
  }

  // No words available
  if (filteredWords.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16 lg:py-24">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Settings size={48} className="text-white lg:w-16 lg:h-16" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            لا توجد كلمات متطابقة
          </h1>
          <p className="text-xl lg:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            يرجى تعديل الفلاتر أو إضافة المزيد من الكلمات للدراسة
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={endSession}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Settings size={20} />
              <span>تعديل الفلاتر</span>
            </button>

            <Link
              href="/cards"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Target size={20} />
              <span>إضافة كلمات</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Session completed
  if (sessionComplete) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const successRate =
      totalAnswered > 0
        ? Math.round((sessionStats.correct / totalAnswered) * 100)
        : 0;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="text-center py-16 lg:py-24">
          <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Trophy size={48} className="text-white lg:w-16 lg:h-16" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            🎊 انتهت الجلسة!
          </h1>

          {/* Mode-specific celebration */}
          {currentMode === 'challenge' && sessionStats.maxStreak >= 5 && (
            <div className="mb-6">
              <div className="text-2xl lg:text-3xl">🔥</div>
              <p className="text-xl lg:text-2xl text-orange-400 font-bold">
                إنجاز رائع! سلسلة {sessionStats.maxStreak} إجابات صحيحة
              </p>
            </div>
          )}

          <p className="text-xl lg:text-2xl text-gray-400 mb-8">
            عمل رائع! إليك ملخص أدائك
          </p>

          {/* Results */}
          <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-orange-400 mb-2">
                  {sessionStats.maxStreak}
                </div>
                <div className="text-gray-400">أطول سلسلة</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="w-full bg-gray-700 rounded-full h-3 lg:h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${successRate}%` }}
                />
              </div>
              <p className="text-sm lg:text-base text-gray-400 mt-2">
                {successRate >= 80
                  ? 'أداء ممتاز! 🌟'
                  : successRate >= 60
                  ? 'أداء جيد! 👍'
                  : 'يمكنك التحسن أكثر! 💪'}
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
              onClick={endSession}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Settings size={20} />
              <span>تغيير النمط</span>
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

  // Active study session
  const progress =
    filteredWords.length > 0
      ? ((currentIndex + 1) / filteredWords.length) * 100
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header with mode indicator */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {currentMode === 'classic'
                ? '🧠'
                : currentMode === 'speed'
                ? '⚡'
                : currentMode === 'reverse'
                ? '🔄'
                : currentMode === 'challenge'
                ? '🏆'
                : '📚'}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {currentMode === 'classic'
                  ? 'النمط الكلاسيكي'
                  : currentMode === 'speed'
                  ? 'السرعة'
                  : currentMode === 'reverse'
                  ? 'العكسي'
                  : currentMode === 'challenge'
                  ? 'التحدي'
                  : 'القراءة السريعة'}
              </h1>
              <p className="text-gray-400">
                الكلمة {currentIndex + 1} من {filteredWords.length}
              </p>
            </div>
          </div>

          {/* Speed mode timer */}
          {currentMode === 'speed' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 text-gray-400 hover:text-white rounded-xl transition-colors touch-manipulation"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
              <div
                className={`text-2xl font-bold ${
                  timeLeft <= 3 ? 'text-red-400' : 'text-blue-400'
                }`}
              >
                {timeLeft}s
              </div>
            </div>
          )}

          {/* Challenge mode streak */}
          {currentMode === 'challenge' && (
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">
                🔥 {sessionStats.streak}
              </div>
              <div className="text-sm text-gray-400">سلسلة حالية</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 lg:h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Session stats */}
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
            <span>
              {sessionStats.correct + sessionStats.incorrect} /{' '}
              {filteredWords.length}
            </span>
          </div>
          {currentMode === 'challenge' && (
            <div className="flex items-center space-x-2 text-orange-400">
              <Trophy size={16} />
              <span>أفضل: {sessionStats.maxStreak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="relative max-w-2xl mx-auto">
        {/* Result overlay */}
        {showResult && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
            <div
              className={`
        w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center shadow-2xl
        ${currentWordResult ? 'bg-green-500' : 'bg-red-500'}
      `}
            >
              {currentWordResult ? (
                <CheckCircle size={48} className="text-white lg:w-16 lg:h-16" />
              ) : (
                <XCircle size={48} className="text-white lg:w-16 lg:h-16" />
              )}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="relative w-full h-96 lg:h-[28rem] perspective-1000">
          <div
            className={`
              relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer
              ${
                isFlipped ||
                currentMode === 'reverse' ||
                currentMode === 'reading'
                  ? 'rotate-y-180'
                  : ''
              }
            `}
            onClick={() =>
              currentMode !== 'reading' && setIsFlipped(!isFlipped)
            }
          >
            {/* Front side */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
              <div className="text-center">
                <h2 className="text-4xl lg:text-6xl font-bold mb-6 lg:mb-8">
                  {currentMode === 'reverse'
                    ? currentWord.meaning
                    : currentWord.word}
                </h2>
                <p className="text-blue-100 mb-8 text-lg lg:text-xl">
                  {currentMode === 'reading'
                    ? 'قراءة سريعة'
                    : currentMode === 'reverse'
                    ? 'ما هي الكلمة؟'
                    : 'انقر لرؤية المعنى'}
                </p>

                <div className="flex items-center justify-center gap-6 text-sm lg:text-base">
                  <div
                    className={`w-4 h-4 rounded-full ${getDifficultyColor(
                      currentWord.difficulty
                    )}`}
                  />
                  <span className="text-blue-200">
                    {currentWord.difficulty}
                  </span>
                  <span className="text-blue-300">•</span>
                  <span className="text-blue-200">{currentWord.category}</span>
                </div>
              </div>
            </div>

            {/* Back side */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col justify-center items-center text-white border-2 border-white/10">
              <div className="text-center">
                <div className="text-sm lg:text-base text-green-100 mb-4 opacity-80">
                  {currentMode === 'reverse'
                    ? currentWord.meaning
                    : currentWord.word}
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 lg:mb-8 leading-relaxed">
                  {currentMode === 'reverse'
                    ? currentWord.word
                    : currentWord.meaning}
                </h2>

                {currentWord.note && (
                  <div className="bg-green-800/30 rounded-2xl p-4 lg:p-6 border border-green-600/30 mb-6">
                    <p className="text-green-100 text-lg lg:text-xl italic">
                      💡 {currentWord.note}
                    </p>
                  </div>
                )}

                <p className="text-green-100 text-lg lg:text-xl">
                  {currentMode === 'reading'
                    ? 'تذكر هذه الكلمة'
                    : 'كيف كان أداؤك؟'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="max-w-2xl mx-auto mt-8 lg:mt-12">
        {(isFlipped ||
          currentMode === 'reverse' ||
          currentMode === 'reading') &&
        currentMode !== 'reading' ? (
          /* Answer buttons */
          <div className="space-y-4 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">
                كيف كان أداؤك؟
              </h3>
              <p className="text-gray-400 text-sm lg:text-base mb-3">
                {currentMode === 'speed'
                  ? 'إجابة سريعة!'
                  : 'اختر مستوى صعوبة تذكر هذه الكلمة'}
              </p>
              {currentMode !== 'speed' && (
                <div className="bg-blue-900/20 rounded-xl p-3 border border-blue-800/30">
                  <p className="text-blue-300 text-xs lg:text-sm">
                    🧠 النظام الذكي سيحدد توقيت المراجعة القادمة بناءً على
                    تقييمك
                  </p>
                </div>
              )}
            </div>

            {currentMode === 'speed' ? (
              /* Speed mode: simple correct/incorrect */
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
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
            ) : (
              /* Other modes: detailed rating */
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {[
                  {
                    quality: 0,
                    label: 'نسيت تماماً',
                    color: 'bg-red-700 hover:bg-red-800',
                    emoji: '😰',
                  },
                  {
                    quality: 1,
                    label: 'صعب جداً',
                    color: 'bg-red-600 hover:bg-red-700',
                    emoji: '😟',
                  },
                  {
                    quality: 2,
                    label: 'صعب',
                    color: 'bg-orange-600 hover:bg-orange-700',
                    emoji: '🤔',
                  },
                  {
                    quality: 3,
                    label: 'متوسط',
                    color: 'bg-yellow-600 hover:bg-yellow-700',
                    emoji: '😐',
                  },
                  {
                    quality: 4,
                    label: 'جيد',
                    color: 'bg-green-600 hover:bg-green-700',
                    emoji: '😊',
                  },
                  {
                    quality: 5,
                    label: 'سهل جداً',
                    color: 'bg-green-700 hover:bg-green-800',
                    emoji: '😍',
                  },
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
            )}

            <div className="text-center text-xs lg:text-sm text-gray-500 mt-4">
              💡 كلما قيّمت بصدق، كلما تحسن توقيت المراجعة
            </div>
          </div>
        ) : currentMode !== 'reading' ? (
          /* Show answer button */
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 lg:py-8 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation shadow-lg mb-6"
          >
            <RotateCcw size={24} />
            <span>
              {(currentMode as StudyMode) === 'reverse'
                ? 'إظهار الكلمة'
                : 'إظهار المعنى'}
            </span>
          </button>
        ) : null}

        {/* Additional controls */}
        {currentMode !== 'reading' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 lg:py-5 rounded-2xl font-medium transition-all border border-gray-700 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <RotateCcw size={20} />
              <span>
                {isFlipped
                  ? currentMode === 'reverse'
                    ? 'إخفاء الكلمة'
                    : 'إخفاء المعنى'
                  : currentMode === 'reverse'
                  ? 'إظهار الكلمة'
                  : 'إظهار المعنى'}
              </span>
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

        {/* Reading mode controls */}
        {currentMode === 'reading' && (
          <div className="text-center space-y-4">
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`
                flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all border touch-manipulation
                ${
                  autoAdvance
                    ? 'bg-green-900/30 text-green-400 border-green-800/50'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {autoAdvance ? <Pause size={20} /> : <Play size={20} />}
              <span>{autoAdvance ? 'إيقاف التلقائي' : 'تشغيل تلقائي'}</span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(3)}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <CheckCircle size={20} />
                <span>أعرفها</span>
              </button>

              <button
                onClick={() => handleAnswer(1)}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
              >
                <XCircle size={20} />
                <span>لا أعرفها</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
