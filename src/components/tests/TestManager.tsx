// src/components/tests/TestManager.tsx - النسخة المحسنة
'use client';

import { Test, TestQuestion, TestResults, TimerRef } from '@/types/flashcard';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Square,
  Target,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MatchingTest from './MatchingTest';
import MixedTest from './MixedTest';
import MultipleChoiceTest from './MultipleChoiceTest';
import TrueFalseTest from './TrueFalseTest';
import TypingTest from './TypingTest';

interface TestManagerProps {
  test: Test;
  onComplete: (results: TestResults) => void;
  onExit: () => void;
}

type TestState = 'ready' | 'active' | 'paused' | 'completed';

export default function TestManager({
  test,
  onComplete,
  onExit,
}: TestManagerProps) {
  // ==========================================
  // State Management
  // ==========================================
  const [testState, setTestState] = useState<TestState>('ready');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCurrentResult, setShowCurrentResult] = useState(false);

  // Timer states - 🔥 إصلاح: استخدام TimerRef بدلاً من NodeJS.Timeout
  const [totalTimeLeft, setTotalTimeLeft] = useState(
    test.settings.timeLimit || 300
  );
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    test.settings.questionTimeLimit || 30
  );
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    streak: 0,
    maxStreak: 0,
    totalTimeSpent: 0,
  });

  // References - 🔥 إصلاح: استخدام TimerRef
  const totalTimerRef = useRef<TimerRef>(null);
  const questionTimerRef = useRef<TimerRef>(null);
  const questionTimeSpentRef = useRef<number>(0);

  // ==========================================
  // Computed Properties
  // ==========================================
  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const hasNextQuestion = currentQuestionIndex < test.questions.length - 1;
  const hasPrevQuestion = currentQuestionIndex > 0;
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  // ==========================================
  // Enhanced Timer Management - 🔥 محسن
  // ==========================================
  const startTimers = useCallback(() => {
    const now = Date.now();

    if (!testStartTime) {
      setTestStartTime(now);
    }
    setQuestionStartTime(now);
    questionTimeSpentRef.current = 0;

    // Total timer
    if (test.settings.timeLimit && totalTimerRef.current === null) {
      totalTimerRef.current = window.setInterval(() => {
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Question timer
    if (test.settings.questionTimeLimit && questionTimerRef.current === null) {
      questionTimerRef.current = window.setInterval(() => {
        questionTimeSpentRef.current += 1;
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            handleQuestionTimeUp();
            return test.settings.questionTimeLimit || 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [testStartTime, test.settings]);

  const pauseTimers = useCallback(() => {
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
      totalTimerRef.current = null;
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
  }, []);

  const resetQuestionTimer = useCallback(() => {
    setQuestionTimeLeft(test.settings.questionTimeLimit || 30);
    questionTimeSpentRef.current = 0;
    setQuestionStartTime(Date.now());
  }, [test.settings.questionTimeLimit]);

  // ==========================================
  // Test Control
  // ==========================================
  const startTest = () => {
    setTestState('active');
    startTimers();
  };

  const pauseTest = () => {
    setTestState('paused');
    pauseTimers();
  };

  const resumeTest = () => {
    setTestState('active');
    startTimers();
  };

  const handleTimeUp = () => {
    console.log('⏰ Total time up!');
    completeTest();
  };

  const handleQuestionTimeUp = () => {
    console.log('⏰ Question time up!');
    if (test.settings.allowSkip) {
      handleSkip();
    } else {
      // Force move to next question
      nextQuestion();
    }
  };

  // ==========================================
  // Question Navigation - محسن
  // ==========================================
  const nextQuestion = useCallback(() => {
    if (hasNextQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowCurrentResult(false);
      resetQuestionTimer();
    } else {
      completeTest();
    }
  }, [hasNextQuestion, resetQuestionTimer]);

  const prevQuestion = useCallback(() => {
    if (hasPrevQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowCurrentResult(false);
      resetQuestionTimer();
    }
  }, [hasPrevQuestion, resetQuestionTimer]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < test.questions.length) {
      setCurrentQuestionIndex(index);
      setShowCurrentResult(false);
      resetQuestionTimer();
    }
  }, [test.questions.length, resetQuestionTimer]);

  // ==========================================
  // Answer Handling - محسن
  // ==========================================
  const handleAnswer = useCallback((answer: string | Record<string, string> | boolean) => {
    if (testState !== 'active') return;

    const questionId = currentQuestion.id;
    const timeSpent = questionTimeSpentRef.current;
    
    // تحويل الإجابة إلى string
    let answerString: string;
    if (typeof answer === 'object' && answer !== null) {
      answerString = JSON.stringify(answer);
    } else {
      answerString = String(answer);
    }

    // حفظ الإجابة
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerString,
    }));

    // تحديث السؤال مع الإجابة والوقت
    const updatedQuestion: TestQuestion = {
      ...currentQuestion,
      userAnswer: answerString,
      timeSpent,
      isCorrect: validateAnswer(currentQuestion, answerString),
    };

    // تحديث الإحصائيات
    const isCorrect = updatedQuestion.isCorrect;
    setStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      streak: isCorrect ? prev.streak + 1 : 0,
      maxStreak: isCorrect ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak,
    }));

    // عرض النتيجة الفورية إذا كانت مفعلة
    if (test.settings.instantFeedback) {
      setShowCurrentResult(true);
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      nextQuestion();
    }
  }, [testState, currentQuestion, nextQuestion, test.settings.instantFeedback]);

  const handleSkip = useCallback(() => {
    if (!test.settings.allowSkip || testState !== 'active') return;

    const questionId = currentQuestion.id;
    const timeSpent = questionTimeSpentRef.current;

    setAnswers(prev => ({
      ...prev,
      [questionId]: '',
    }));

    setStats(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      streak: 0,
    }));

    nextQuestion();
  }, [test.settings.allowSkip, testState, currentQuestion.id, nextQuestion]);

  // ==========================================
  // Answer Validation - محسن
  // ==========================================
  const validateAnswer = (question: TestQuestion, userAnswer: string): boolean => {
    if (!userAnswer || userAnswer.trim() === '') return false;

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

      case 'typing':
        return validateTypingAnswer(userAnswer, question.correctAnswer);

      case 'matching':
        try {
          const userMatches = JSON.parse(userAnswer);
          const correctMatches = JSON.parse(question.correctAnswer);
          
          return JSON.stringify(userMatches) === JSON.stringify(correctMatches);
        } catch {
          return false;
        }

      default:
        return false;
    }
  };

  const validateTypingAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalize = (text: string) =>
      text.trim()
          .toLowerCase()
          .replace(/[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, '')
          .replace(/\s+/g, ' ');

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // تطابق تام
    if (normalizedUser === normalizedCorrect) return true;

    // تطابق جزئي للإجابات الطويلة (85% تشابه)
    if (normalizedCorrect.length > 10) {
      const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
      return similarity >= 0.85;
    }

    return false;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // ==========================================
  // Test Completion - محسن
  // ==========================================
  const completeTest = useCallback(() => {
    pauseTimers();
    setTestState('completed');

    const endTime = Date.now();
    const totalTimeSpent = testStartTime ? endTime - testStartTime : 0;

    // إنشاء نتائج مفصلة
    const questionsData = test.questions.map(question => ({
      ...question,
      userAnswer: answers[question.id] || '',
      timeSpent: question.timeSpent || 0,
      isCorrect: answers[question.id] ? validateAnswer(question, answers[question.id]) : false,
    }));

    // حساب الإحصائيات
    const correctAnswers = questionsData.filter(q => q.isCorrect).length;
    const wrongAnswers = questionsData.filter(q => !q.isCorrect && q.userAnswer).length;
    const skippedAnswers = questionsData.filter(q => !q.userAnswer).length;

    const percentage = test.questions.length > 0 
      ? Math.round((correctAnswers / test.questions.length) * 100) 
      : 0;

    // تحليل الأداء حسب الفئات والصعوبة
    const breakdown = calculateBreakdown(questionsData);
    const performance = calculatePerformance(questionsData, totalTimeSpent);

    const results: TestResults = {
      id: `result_${Date.now()}`,
      testId: test.id,
      startTime: testStartTime || endTime,
      endTime,
      totalScore: correctAnswers * 10, // 10 نقاط لكل إجابة صحيحة
      maxScore: test.questions.length * 10,
      percentage,
      totalQuestions: test.questions.length,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      timeSpent: Math.round(totalTimeSpent / 1000), // بالثواني
      averageTimePerQuestion: test.questions.length > 0 
        ? Math.round(totalTimeSpent / test.questions.length / 1000) 
        : 0,
      questionsData,
      breakdown,
      performance,
    };

    onComplete(results);
  }, [test, testStartTime, answers, pauseTimers, onComplete]);

  // حساب التفصيل حسب الفئات والصعوبة
  const calculateBreakdown = (questionsData: TestQuestion[]) => {
    const byCategory: Record<string, { correct: number; total: number; percentage: number }> = {};
    const byDifficulty: Record<string, { correct: number; total: number; percentage: number }> = {};
    const byType: Record<string, { correct: number; total: number; percentage: number }> = {};

    questionsData.forEach(question => {
      // حسب الفئة (نحتاج للحصول على معلومات الكلمة)
      // هذا يتطلب تمرير معلومات الكلمات، سنتركه مبسط حالياً
      
      // حسب النوع
      if (!byType[question.type]) {
        byType[question.type] = { correct: 0, total: 0, percentage: 0 };
      }
      byType[question.type].total++;
      if (question.isCorrect) {
        byType[question.type].correct++;
      }
    });

    // حساب النسب المئوية
    Object.keys(byType).forEach(type => {
      const data = byType[type];
      data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    });

    return { byCategory, byDifficulty, byType };
  };

  // حساب الأداء
  const calculatePerformance = (questionsData: TestQuestion[], totalTime: number) => {
    const times = questionsData
      .map(q => q.timeSpent || 0)
      .filter(t => t > 0);

    const fastestTime = times.length > 0 ? Math.min(...times) : 0;
    const slowestTime = times.length > 0 ? Math.max(...times) : 0;
    
    // حساب الثبات (كلما قل الانحراف المعياري، كان الأداء أكثر ثباتاً)
    const avgTime = times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : 0;
    const variance = times.length > 0 
      ? times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length 
      : 0;
    const stdDev = Math.sqrt(variance);
    const consistency = avgTime > 0 ? Math.max(0, 1 - (stdDev / avgTime)) : 0;

    return {
      fastestTime,
      slowestTime,
      consistency: Math.round(consistency * 100) / 100,
      improvement: 0, // يمكن حسابه بمقارنة الاختبارات السابقة
    };
  };

  // ==========================================
  // Effects
  // ==========================================
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pauseTimers();
    };
  }, [pauseTimers]);

  // ==========================================
  // Render Functions
  // ==========================================
  
  const renderCurrentQuestion = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      timeLeft: questionTimeLeft,
      showResult: showCurrentResult,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: answers[currentQuestion.id],
      isCompleted: testState === 'completed',
    };

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceTest
            {...commonProps}
            onAnswer={handleAnswer}
          />
        );

      case 'typing':
        return (
          <TypingTest
            {...commonProps}
            onAnswer={handleAnswer}
          />
        );

      case 'matching':
        return (
          <MatchingTest
            {...commonProps}
            onAnswer={handleAnswer}
          />
        );

      case 'true_false':
        return (
          <TrueFalseTest
            {...commonProps}
            onAnswer={handleAnswer}
          />
        );

      case 'mixed':
      default:
        return (
          <MixedTest
            {...commonProps}
            onAnswer={handleAnswer}
            currentQuestionIndex={currentQuestionIndex + 1}
            totalQuestions={test.questions.length}
          />
        );
    }
  };

  // ==========================================
  // Main Render
  // ==========================================
  
  if (testState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-6">🚀</div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            {test.name}
          </h1>
          
          <div className="space-y-4 text-gray-300 mb-8">
            <p className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              {test.questions.length} سؤال
            </p>
            
            {test.settings.timeLimit && (
              <p className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                {Math.floor(test.settings.timeLimit / 60)} دقيقة
              </p>
            )}
            
            <p className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              {test.settings.type === 'mixed' ? 'أسئلة متنوعة' : 'نوع واحد'}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={startTest}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              بدء الاختبار
            </button>
            
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-8 py-4 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition-all"
            >
              <Home className="w-5 h-5" />
              العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                السؤال {currentQuestionIndex + 1} من {test.questions.length}
              </div>
              
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              {test.settings.timeLimit && (
                <div className="flex items-center gap-2 text-orange-300">
                  <Timer className="w-5 h-5" />
                  <span className="font-mono">
                    {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              
              {test.settings.questionTimeLimit && (
                <div className="flex items-center gap-2 text-blue-300">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono">
                    {Math.floor(questionTimeLeft / 60)}:{(questionTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {testState === 'active' && (
                <button
                  onClick={pauseTest}
                  className="p-2 rounded-lg bg-orange-900/30 border border-orange-600/50 text-orange-300 hover:bg-orange-800/40 transition-colors"
                  title="إيقاف مؤقت"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              
              {testState === 'paused' && (
                <button
                  onClick={resumeTest}
                  className="p-2 rounded-lg bg-green-900/30 border border-green-600/50 text-green-300 hover:bg-green-800/40 transition-colors"
                  title="استئناف"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onExit}
                className="p-2 rounded-lg bg-red-900/30 border border-red-600/50 text-red-300 hover:bg-red-800/40 transition-colors"
                title="إنهاء الاختبار"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {testState === 'paused' ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-4">الاختبار متوقف مؤقتاً</h2>
            <p className="text-gray-400 mb-8">انقر على زر الاستئناف للمتابعة</p>
            
            <button
              onClick={resumeTest}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all"
            >
              <Play className="w-5 h-5" />
              استئناف الاختبار
            </button>
          </div>
        ) : (
          renderCurrentQuestion()
        )}
      </div>

      {/* Navigation Footer */}
      {testState === 'active' && (
        <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              
              {/* Previous Button */}
              <button
                onClick={prevQuestion}
                disabled={!hasPrevQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                السابق
              </button>

              {/* Skip Button */}
              {test.settings.allowSkip && (
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-900/30 border border-orange-600/50 text-orange-300 rounded-lg hover:bg-orange-800/40 transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                  تخطي
                </button>
              )}

              {/* Next/Finish Button */}
              <button
                onClick={isLastQuestion ? completeTest : nextQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                {isLastQuestion ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    إنهاء
                  </>
                ) : (
                  <>
                    التالي
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}