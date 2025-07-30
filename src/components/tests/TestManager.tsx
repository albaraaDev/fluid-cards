// src/components/tests/TestManager.tsx
'use client';

import { Test, TestQuestion, TestResults } from '@/types/flashcard';
import { QuestionGenerator } from '@/utils/QuestionGenerator';
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

  // Timer states
  const [totalTimeLeft, setTotalTimeLeft] = useState(
    test.settings.timeLimit || 300
  );
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    test.settings.questionTimeLimit || 30
  );
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null
  );

  // Statistics
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    streak: 0,
    maxStreak: 0,
    totalTimeSpent: 0,
  });

  // References
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
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
  // Timer Management
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
      totalTimerRef.current = setInterval(() => {
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
      questionTimerRef.current = setInterval(() => {
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
    pauseTimers();
    finishTest();
  };

  const handleQuestionTimeUp = () => {
    if (test.settings.allowSkip) {
      handleSkipQuestion();
    } else {
      // Force submit empty answer
      handleAnswer('');
    }
  };

  // ==========================================
  // Navigation
  // ==========================================
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < test.questions.length) {
      setCurrentQuestionIndex(index);
      setShowCurrentResult(false);
      resetQuestionTimer();
    }
  };

  const nextQuestion = () => {
    if (hasNextQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowCurrentResult(false);
      resetQuestionTimer();
    }
  };

  const prevQuestion = () => {
    if (hasPrevQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowCurrentResult(false);
      resetQuestionTimer();
    }
  };

  const handleSkipQuestion = () => {
    const questionId = currentQuestion.id;
    setAnswers((prev) => ({ ...prev, [questionId]: '' }));
    setStats((prev) => ({ ...prev, skipped: prev.skipped + 1, streak: 0 }));

    if (hasNextQuestion) {
      nextQuestion();
    } else {
      finishTest();
    }
  };

  // ==========================================
  // Answer Processing
  // ==========================================
  const handleAnswer = (answer: string | Record<string, string> | boolean) => {
    if (testState !== 'active') return;

    const questionId = currentQuestion.id;
    let answerString: string;

    // Convert answer to string
    if (typeof answer === 'boolean') {
      answerString = answer.toString();
    } else if (typeof answer === 'object') {
      answerString = JSON.stringify(answer);
    } else {
      answerString = answer;
    }

    // Save answer
    setAnswers((prev) => ({ ...prev, [questionId]: answerString }));

    // Calculate if correct
    const isCorrect = evaluateAnswer(currentQuestion, answerString);

    // Calculate time spent
    const timeSpent = questionTimeSpentRef.current;

    // 🔥 إصلاح: تحديث السؤال فوراً وبشكل مباشر
    const updatedQuestion = {
      ...currentQuestion,
      timeSpent: timeSpent,
      userAnswer: answerString,
      isCorrect: isCorrect,
    };

    // تحديث السؤال في مصفوفة الأسئلة
    test.questions[currentQuestionIndex] = updatedQuestion;

    // Update statistics (للعرض فقط)
    setStats((prev) => {
      const newStats = { ...prev };

      if (isCorrect) {
        newStats.correct += 1;
        newStats.streak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.streak);
      } else {
        newStats.incorrect += 1;
        newStats.streak = 0;
      }

      newStats.totalTimeSpent += timeSpent;
      return newStats;
    });

    // Show result if instant feedback is enabled
    if (test.settings.instantFeedback) {
      setShowCurrentResult(true);
      setTimeout(() => {
        setShowCurrentResult(false);
        if (hasNextQuestion) {
          nextQuestion();
        } else {
          // 🔥 إصلاح: تأخير قليل لضمان تحديث جميع البيانات
          setTimeout(() => {
            finishTest();
          }, 100);
        }
      }, 2500);
    } else {
      // Move to next question or finish
      if (hasNextQuestion) {
        nextQuestion();
      } else {
        // 🔥 إصلاح: تأخير قليل لضمان تحديث جميع البيانات
        setTimeout(() => {
          finishTest();
        }, 100);
      }
    }
  };

  // ==========================================
  // Answer Evaluation
  // ==========================================
  const evaluateAnswer = (
    question: TestQuestion,
    userAnswer: string
  ): boolean => {
    if (!userAnswer || userAnswer.trim() === '') return false;

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === question.correctAnswer;

      case 'typing':
        // Use the smart validation from QuestionGenerator
        try {
          return QuestionGenerator.validateTypingAnswer(
            userAnswer,
            question.correctAnswer
          );
        } catch {
          // Fallback to simple comparison
          return (
            userAnswer.toLowerCase().trim() ===
            question.correctAnswer.toLowerCase().trim()
          );
        }

      case 'matching':
        try {
          const userMatches = JSON.parse(userAnswer);
          const correctMatches = JSON.parse(question.correctAnswer);

          // Check if all matches are correct
          const correctKeys = Object.keys(correctMatches);
          return correctKeys.every(
            (key) => userMatches[key] === correctMatches[key]
          );
        } catch {
          return false;
        }

      default:
        return false;
    }
  };

  // ==========================================
  // Test Completion
  // ==========================================

  const finishTest = () => {
    pauseTimers();
    setTestState('completed');

    const endTime = Date.now();
    const startTime = testStartTime || endTime;

    // 🔥 إصلاح: حساب النتائج مباشرة من الأسئلة بدلاً من الـ stats
    const directResults = calculateResultsFromQuestions();

    const results: TestResults = {
      id: `result_${Date.now()}`,
      testId: test.id,
      startTime,
      endTime,
      totalScore: calculateScore(),
      maxScore: test.questions.length * 100,

      // 🔥 استخدم النتائج المحسوبة مباشرة
      percentage: directResults.percentage,
      totalQuestions: test.questions.length,
      correctAnswers: directResults.correctAnswers,
      wrongAnswers: directResults.wrongAnswers,
      skippedAnswers: directResults.skippedAnswers,

      timeSpent: Math.floor((endTime - startTime) / 1000),
      averageTimePerQuestion:
        directResults.totalTimeSpent / test.questions.length,
      questionsData: test.questions,
      breakdown: calculateBreakdown(),
    };

    onComplete(results);
  };

  const calculateResultsFromQuestions = () => {
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;
    let totalTimeSpent = 0;

    test.questions.forEach((question) => {
      // حساب الوقت المستغرق
      totalTimeSpent += question.timeSpent || 0;

      // تحديد حالة الإجابة
      if (!question.userAnswer || question.userAnswer.trim() === '') {
        // لم يتم الإجابة عليه
        skippedAnswers++;
      } else if (question.isCorrect === true) {
        // إجابة صحيحة
        correctAnswers++;
      } else if (question.isCorrect === false) {
        // إجابة خاطئة
        wrongAnswers++;
      } else {
        // في حالة عدم تحديد isCorrect، نحسبه الآن
        const isCorrect = evaluateAnswer(question, question.userAnswer || '');
        if (isCorrect) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      }
    });

    const percentage =
      test.questions.length > 0
        ? (correctAnswers / test.questions.length) * 100
        : 0;

    return {
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      percentage,
      totalTimeSpent,
    };
  };

  const calculateScore = (): number => {
    let totalScore = 0;

    test.questions.forEach((question) => {
      if (question.isCorrect) {
        const baseScore = 100;

        // Difficulty bonus
        const difficultyBonus = (question.difficulty || 3) * 10;

        // Speed bonus (if answered quickly)
        const timeSpent = question.timeSpent || 30;
        const maxTime = test.settings.questionTimeLimit || 30;
        const speedBonus = Math.max(0, (maxTime - timeSpent) * 2);

        totalScore += baseScore + difficultyBonus + speedBonus;
      }
    });

    return totalScore;
  };

  const calculateBreakdown = () => {
    const byCategory: Record<string, { correct: number; total: number }> = {};
    const byDifficulty: Record<string, { correct: number; total: number }> = {};
    const byType: Record<string, { correct: number; total: number }> = {};

    test.questions.forEach((question) => {
      // By type
      const type = question.type;
      if (!byType[type]) byType[type] = { correct: 0, total: 0 };
      byType[type].total += 1;

      // 🔥 إصلاح: استخدم قيمة isCorrect المحدثة أو احسبها
      const isCorrect =
        question.isCorrect !== undefined
          ? question.isCorrect
          : evaluateAnswer(question, question.userAnswer || '');

      if (isCorrect) byType[type].correct += 1;

      // By difficulty (if available)
      const difficulty = question.difficulty?.toString() || 'متوسط';
      if (!byDifficulty[difficulty])
        byDifficulty[difficulty] = { correct: 0, total: 0 };
      byDifficulty[difficulty].total += 1;
      if (isCorrect) byDifficulty[difficulty].correct += 1;
    });

    return { byCategory, byDifficulty, byType };
  };

  // ==========================================
  // Component Rendering
  // ==========================================
  const renderCurrentTest = () => {
    if (!currentQuestion) return null;

    const commonProps = {
      question: currentQuestion,
      timeLeft: test.settings.questionTimeLimit ? questionTimeLeft : undefined,
      showResult: showCurrentResult,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: answers[currentQuestion.id],
      isCompleted: testState === 'completed',
    };

    // 🔥 إصلاح: للاختبار المختلط، مرر props إضافية
    if (test.settings.type === 'mixed') {
      return (
        <MixedTest
          {...commonProps}
          onAnswer={handleAnswer}
          currentQuestionIndex={currentQuestionIndex + 1}
          totalQuestions={test.questions.length}
        />
      );
    }

    // 🔥 إصلاح: للاختبارات الفردية، استخدم نوع السؤال وليس نوع الاختبار
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return <MultipleChoiceTest {...commonProps} onAnswer={handleAnswer} />;
      case 'typing':
        return <TypingTest {...commonProps} onAnswer={handleAnswer} />;
      case 'matching':
        return <MatchingTest {...commonProps} onAnswer={handleAnswer} />;
      case 'true_false':
        return <TrueFalseTest {...commonProps} onAnswer={handleAnswer} />;
      default:
        return (
          <div className="text-center text-red-400 p-8">
            <div className="bg-red-900/20 border border-red-600/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">نوع السؤال غير مدعوم</h3>
              <p className="text-gray-300 mb-4">
                نوع السؤال &quot;{currentQuestion.type}&quot; غير متاح حالياً
              </p>
              <button
                onClick={() => handleSkipQuestion()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all"
              >
                تخطي السؤال
              </button>
            </div>
          </div>
        );
    }
  };

  // ==========================================
  // Effects
  // ==========================================
  useEffect(() => {
    return () => {
      pauseTimers();
    };
  }, [pauseTimers]);

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Test Header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Ready State Header */}
          {testState === 'ready' && (
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {test.name}
              </h1>
              <p className="text-gray-400 mb-6">
                {test.description ||
                  `${test.questions.length} أسئلة • ${Math.ceil(
                    (test.settings.timeLimit || 300) / 60
                  )} دقائق`}
              </p>

              <button
                onClick={startTest}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Play size={24} />
                <span>ابدأ الاختبار</span>
              </button>
            </div>
          )}

          {/* Active/Paused State Header */}
          {(testState === 'active' || testState === 'paused') && (
            <div className="flex items-center justify-between">
              {/* Left Side - Test Info */}
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  <h2 className="font-bold text-lg lg:text-xl">{test.name}</h2>
                  <p className="text-gray-400 text-sm">
                    السؤال {currentQuestionIndex + 1} من {test.questions.length}
                  </p>
                </div>
              </div>

              {/* Center - Progress */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="text-green-400" size={18} />
                  <span className="text-green-400 font-bold">
                    {stats.correct}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="text-red-400" size={18} />
                  <span className="text-red-400 font-bold">
                    {stats.incorrect}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="text-purple-400" size={18} />
                  <span className="text-purple-400 font-bold">
                    {stats.streak}
                  </span>
                </div>
              </div>

              {/* Right Side - Controls & Timers */}
              <div className="flex items-center space-x-3">
                {/* Total Timer */}
                {test.settings.timeLimit && (
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
                      totalTimeLeft <= 60
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-blue-900/30 text-blue-400'
                    }`}
                  >
                    <Timer size={16} />
                    <span className="font-bold text-sm">
                      {Math.floor(totalTimeLeft / 60)}:
                      {String(totalTimeLeft % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center space-x-2">
                  {testState === 'active' ? (
                    <button
                      onClick={pauseTest}
                      className="p-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
                    >
                      <Pause size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={resumeTest}
                      className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all"
                    >
                      <Play size={20} />
                    </button>
                  )}

                  <button
                    onClick={onExit}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all"
                  >
                    <Square size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {(testState === 'active' || testState === 'paused') && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Content */}
      <div className="flex-1 py-8">
        {/* Paused Overlay */}
        {testState === 'paused' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700 text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pause size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                الاختبار متوقف مؤقتاً
              </h3>
              <p className="text-gray-400 mb-8">
                يمكنك أخذ استراحة والعودة متى شئت
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={resumeTest}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  متابعة
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  إنهاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Questions */}
        {testState !== 'ready' && testState !== 'completed' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderCurrentTest()}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {(testState === 'active' || testState === 'paused') &&
        !showCurrentResult && (
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={prevQuestion}
                disabled={!hasPrevQuestion}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  hasPrevQuestion
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={20} />
                <span className="hidden sm:inline">السابق</span>
              </button>

              {/* Middle Info */}
              <div className="flex items-center space-x-4">
                {test.settings.allowSkip && (
                  <button
                    onClick={handleSkipQuestion}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all"
                  >
                    <SkipForward size={18} />
                    <span className="hidden sm:inline">تخطي</span>
                  </button>
                )}

                <div className="text-white text-center">
                  <div className="font-bold">
                    {currentQuestionIndex + 1} / {test.questions.length}
                  </div>
                  <div className="text-xs text-gray-400">السؤال الحالي</div>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={isLastQuestion ? finishTest : nextQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
              >
                <span className="hidden sm:inline">
                  {isLastQuestion ? 'إنهاء' : 'التالي'}
                </span>
                {isLastQuestion ? (
                  <Trophy size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
