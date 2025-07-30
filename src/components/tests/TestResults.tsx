// src/components/tests/TestResults.tsx
'use client';

import { Test, TestQuestion, TestResults as TestResultsType } from '@/types/flashcard';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Home,
  Lightbulb,
  PieChart,
  RefreshCw,
  Share2,
  SkipForward,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Trophy,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface TestResultsProps {
  results: TestResultsType;
  test: Test;
  onRestart: () => void;
  onReviewAnswers: () => void;
  onBackToTests: () => void;
}

type ResultsView = 'summary' | 'detailed' | 'questions' | 'recommendations';

export default function TestResults({ 
  results, 
  test, 
  onRestart, 
  onReviewAnswers, 
  onBackToTests 
}: TestResultsProps) {
  
  const [currentView, setCurrentView] = useState<ResultsView>('summary');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // ==========================================
  // Computed Properties
  // ==========================================
  const performance = useMemo(() => {
    const { percentage } = results;
    
    if (percentage >= 90) return { 
      grade: 'ممتاز', 
      emoji: '🏆', 
      color: 'text-yellow-400', 
      bgColor: 'from-yellow-900/20 to-orange-900/10',
      borderColor: 'border-yellow-600/50'
    };
    if (percentage >= 80) return { 
      grade: 'جيد جداً', 
      emoji: '🌟', 
      color: 'text-green-400',
      bgColor: 'from-green-900/20 to-green-800/10',
      borderColor: 'border-green-600/50'
    };
    if (percentage >= 70) return { 
      grade: 'جيد', 
      emoji: '👍', 
      color: 'text-blue-400',
      bgColor: 'from-blue-900/20 to-blue-800/10',
      borderColor: 'border-blue-600/50'
    };
    if (percentage >= 60) return { 
      grade: 'مقبول', 
      emoji: '📈', 
      color: 'text-orange-400',
      bgColor: 'from-orange-900/20 to-orange-800/10',
      borderColor: 'border-orange-600/50'
    };
    
    return { 
      grade: 'يحتاج تحسين', 
      emoji: '💪', 
      color: 'text-red-400',
      bgColor: 'from-red-900/20 to-red-800/10',
      borderColor: 'border-red-600/50'
    };
  }, [results.percentage]);

  const timeStats = useMemo(() => {
    const totalMinutes = Math.floor(results.timeSpent / 60);
    const totalSeconds = results.timeSpent % 60;
    const avgMinutes = Math.floor(results.averageTimePerQuestion / 60);
    const avgSeconds = Math.floor(results.averageTimePerQuestion % 60);
    
    return {
      total: `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`,
      average: `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`
    };
  }, [results]);

  const questionStats = useMemo(() => {
    return results.questionsData.reduce((acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [results.questionsData]);

  const strengths = useMemo(() => {
    const strengths: string[] = [];
    
    if (results.percentage >= 80) strengths.push('أداء ممتاز بشكل عام');
    if (results.averageTimePerQuestion < 20) strengths.push('سرعة في الإجابة');
    if (results.correctAnswers > results.wrongAnswers * 2) strengths.push('دقة عالية');
    if (results.skippedAnswers === 0) strengths.push('مثابرة واجتهاد');
    
    return strengths;
  }, [results]);

  const improvements = useMemo(() => {
    const improvements: string[] = [];
    
    if (results.percentage < 70) improvements.push('راجع المفاهيم الأساسية');
    if (results.averageTimePerQuestion > 45) improvements.push('تدرب على السرعة');
    if (results.skippedAnswers > results.totalQuestions * 0.2) improvements.push('قلل من تخطي الأسئلة');
    if (results.wrongAnswers > results.correctAnswers) improvements.push('ركز على الدقة أكثر من السرعة');
    
    return improvements;
  }, [results]);

  // ==========================================
  // View Components
  // ==========================================
  
  // 6.2.1 ملخص عام
  const renderSummaryView = () => (
    <div className="space-y-8">
      
      {/* Main Achievement Card */}
      <div className={`
        bg-gradient-to-br ${performance.bgColor} backdrop-blur-sm
        rounded-3xl lg:rounded-[2rem] p-8 lg:p-12 border-2 ${performance.borderColor}
        text-center transform hover:scale-[1.01] transition-all duration-500
      `}>
        <div className="text-8xl lg:text-9xl mb-6 animate-bounce">
          {performance.emoji}
        </div>
        
        <h2 className={`text-4xl lg:text-5xl font-bold ${performance.color} mb-4`}>
          {performance.grade}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          
          {/* Score */}
          <div className="text-center">
            <div className={`text-5xl lg:text-6xl font-bold ${performance.color} mb-2`}>
              {results.percentage.toFixed(0)}%
            </div>
            <div className="text-gray-400 text-lg">النسبة المئوية</div>
          </div>
          
          {/* Points */}
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-purple-400 mb-2">
              {results.totalScore}
            </div>
            <div className="text-gray-400 text-lg">النقاط</div>
          </div>
          
          {/* Time */}
          <div className="text-center">
            <div className="text-5xl lg:text-6xl font-bold text-blue-400 mb-2">
              {timeStats.total}
            </div>
            <div className="text-gray-400 text-lg">الوقت المستغرق</div>
          </div>
        </div>

        <p className="text-xl text-gray-300 leading-relaxed">
          {results.percentage >= 80 
            ? 'أداء رائع! أظهرت فهماً عميقاً للمادة واستمر في هذا المستوى المتميز.'
            : results.percentage >= 60
            ? 'أداء جيد مع وجود مجال للتحسين. ركز على نقاط الضعف وستحقق نتائج أفضل.'
            : 'هناك مجال كبير للتحسين. لا تيأس، المزيد من الممارسة سيحسن أداءك بشكل كبير.'
          }
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Correct Answers */}
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl lg:rounded-3xl p-6 border border-green-600/30">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="text-green-400" size={32} />
            <div className="text-3xl lg:text-4xl font-bold text-green-400">
              {results.correctAnswers}
            </div>
          </div>
          <div className="text-gray-400 text-sm lg:text-base">إجابات صحيحة</div>
        </div>

        {/* Wrong Answers */}
        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-2xl lg:rounded-3xl p-6 border border-red-600/30">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="text-red-400" size={32} />
            <div className="text-3xl lg:text-4xl font-bold text-red-400">
              {results.wrongAnswers}
            </div>
          </div>
          <div className="text-gray-400 text-sm lg:text-base">إجابات خاطئة</div>
        </div>

        {/* Skipped */}
        <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-2xl lg:rounded-3xl p-6 border border-orange-600/30">
          <div className="flex items-center justify-between mb-4">
            <SkipForward className="text-orange-400" size={32} />
            <div className="text-3xl lg:text-4xl font-bold text-orange-400">
              {results.skippedAnswers}
            </div>
          </div>
          <div className="text-gray-400 text-sm lg:text-base">أسئلة متخطاة</div>
        </div>

        {/* Average Time */}
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-2xl lg:rounded-3xl p-6 border border-blue-600/30">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-blue-400" size={32} />
            <div className="text-3xl lg:text-4xl font-bold text-blue-400">
              {timeStats.average}
            </div>
          </div>
          <div className="text-gray-400 text-sm lg:text-base">متوسط/سؤال</div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="bg-gradient-to-br from-green-900/10 to-green-800/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-green-600/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <ThumbsUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-green-400">نقاط القوة</h3>
            </div>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="bg-gradient-to-br from-orange-900/10 to-orange-800/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-orange-600/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-orange-400">نقاط التحسين</h3>
            </div>
            <div className="space-y-3">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 6.2.2 تحليل مفصل
  const renderDetailedView = () => (
    <div className="space-y-8">
      
      {/* Performance Breakdown */}
      <div className="bg-gray-800/50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <BarChart3 className="text-purple-400" size={24} />
          <span>تحليل الأداء</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* By Question Type */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">حسب نوع السؤال</h4>
            <div className="space-y-3">
              {Object.entries(results.breakdown.byType).map(([type, stats]) => {
                const percentage = (stats.correct / stats.total) * 100;
                const typeNames = {
                  'multiple_choice': 'اختيار متعدد',
                  'typing': 'كتابة',
                  'matching': 'مطابقة',
                  'true_false': 'صح/خطأ',
                  'mixed': 'مختلط'
                };
                
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">{typeNames[type as keyof typeof typeNames] || type}</span>
                      <span className="text-white font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.correct} من {stats.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Difficulty */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">حسب الصعوبة</h4>
            <div className="space-y-3">
              {Object.entries(results.breakdown.byDifficulty).map(([difficulty, stats]) => {
                const percentage = (stats.correct / stats.total) * 100;
                const colors = {
                  '1': 'from-green-500 to-green-600',
                  '3': 'from-yellow-500 to-yellow-600',
                  '5': 'from-red-500 to-red-600',
                  'متوسط': 'from-yellow-500 to-yellow-600'
                };
                
                return (
                  <div key={difficulty}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">مستوى {difficulty}</span>
                      <span className="text-white font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors[difficulty as keyof typeof colors] || colors['متوسط']} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.correct} من {stats.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Analysis */}
          <div className="bg-gray-700/30 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">تحليل الوقت</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">الوقت الإجمالي:</span>
                <span className="text-blue-400 font-bold">{timeStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">متوسط كل سؤال:</span>
                <span className="text-green-400 font-bold">{timeStats.average}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">أسرع إجابة:</span>
                <span className="text-purple-400 font-bold">
                  {Math.min(...results.questionsData.map(q => q.timeSpent || 30))}ث
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">أبطأ إجابة:</span>
                <span className="text-orange-400 font-bold">
                  {Math.max(...results.questionsData.map(q => q.timeSpent || 30))}ث
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Calculation */}
      <div className="bg-gray-800/50 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <Target className="text-yellow-400" size={24} />
          <span>تفصيل النقاط</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {results.correctAnswers * 100}
            </div>
            <div className="text-gray-400 text-sm">نقاط الإجابات الصحيحة</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              +{Math.round(results.totalScore - (results.correctAnswers * 100))}
            </div>
            <div className="text-gray-400 text-sm">بونص الصعوبة والسرعة</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {results.totalScore}
            </div>
            <div className="text-gray-400 text-sm">إجمالي النقاط</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {results.maxScore}
            </div>
            <div className="text-gray-400 text-sm">أقصى نقاط ممكنة</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 6.2.3 مراجعة الأسئلة
  const renderQuestionsView = () => (
    <div className="space-y-6">
      
      {/* Questions List */}
      <div className="space-y-4">
        {results.questionsData.map((question, index) => {
          const isCorrect = question.isCorrect;
          const timeSpent = question.timeSpent || 0;
          
          return (
            <div 
              key={question.id}
              className={`
                bg-gray-800/50 rounded-2xl p-6 border-2 transition-all cursor-pointer
                ${isCorrect 
                  ? 'border-green-600/30 hover:border-green-600/50' 
                  : question.userAnswer 
                  ? 'border-red-600/30 hover:border-red-600/50'
                  : 'border-orange-600/30 hover:border-orange-600/50'
                }
                ${selectedQuestion === index ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
            >
              
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  
                  {/* Question Number */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                    ${isCorrect ? 'bg-green-600' : question.userAnswer ? 'bg-red-600' : 'bg-orange-600'}
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Question Type */}
                  <div className="text-gray-400 text-sm">
                    {question.type === 'multiple_choice' && 'اختيار متعدد'}
                    {question.type === 'typing' && 'كتابة'}
                    {question.type === 'matching' && 'مطابقة'}
                    {question.type === 'true_false' && 'صح/خطأ'}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  
                  {/* Time Spent */}
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock size={16} />
                    <span>{timeSpent}ث</span>
                  </div>
                  
                  {/* Result Icon */}
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : question.userAnswer ? (
                    <XCircle className="text-red-400" size={24} />
                  ) : (
                    <SkipForward className="text-orange-400" size={24} />
                  )}
                </div>
              </div>

              {/* Question Text Preview */}
              <div className="text-white mb-3">
                {question.question.length > 100 
                  ? `${question.question.substring(0, 100)}...`
                  : question.question
                }
              </div>

              {/* Answer Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">إجابتك: </span>
                  <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                    {question.userAnswer || 'لم تجب'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">الإجابة الصحيحة: </span>
                  <span className="text-green-400">{question.correctAnswer}</span>
                </div>
              </div>

              {/* Expanded View */}
              {selectedQuestion === index && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h4 className="text-white font-bold mb-3">السؤال كاملاً:</h4>
                    <p className="text-gray-300 leading-relaxed mb-4">{question.question}</p>
                    
                    {question.options && (
                      <div className="mb-4">
                        <h5 className="text-white font-semibold mb-2">الخيارات:</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                option === question.correctAnswer 
                                  ? 'bg-green-900/20 border-green-600/50 text-green-300'
                                  : option === question.userAnswer && option !== question.correctAnswer
                                  ? 'bg-red-900/20 border-red-600/50 text-red-300'
                                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">وقت الإجابة: {timeSpent} ثانية</span>
                      <span className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'إجابة صحيحة ✓' : question.userAnswer ? 'إجابة خاطئة ✗' : 'لم تجب'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // 6.2.4 توصيات التحسين
  const renderRecommendationsView = () => (
    <div className="space-y-8">
      
      {/* Study Plan */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-blue-600/30">
        <h3 className="text-xl lg:text-2xl font-bold text-blue-400 mb-6 flex items-center space-x-3">
          <BookOpen size={24} />
          <span>خطة الدراسة المقترحة</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Review Priority */}
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
              <AlertTriangle className="text-red-400" size={20} />
              <span>مراجعة فورية</span>
            </h4>
            <div className="space-y-2">
              {results.questionsData
                .filter(q => !q.isCorrect)
                .slice(0, 5)
                .map((question, index) => (
                  <div key={index} className="text-gray-300 text-sm p-2 bg-gray-700/30 rounded">
                    السؤال {results.questionsData.indexOf(question) + 1}
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Practice Areas */}
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
              <Target className="text-orange-400" size={20} />
              <span>تدريب إضافي</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(results.breakdown.byType)
                .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
                .map(([type, stats]) => {
                  const typeNames = {
                    'multiple_choice': 'الاختيار المتعدد',
                    'typing': 'الكتابة',
                    'matching': 'المطابقة',
                    'true_false': 'صح/خطأ'
                  };
                  return (
                    <div key={type} className="text-gray-300 text-sm p-2 bg-gray-700/30 rounded">
                      {typeNames[type as keyof typeof typeNames]}
                    </div>
                  );
                })
              }
            </div>
          </div>
          
          {/* Strengths to Build */}
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
              <Star className="text-green-400" size={20} />
              <span>نقاط القوة</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(results.breakdown.byType)
                .filter(([_, stats]) => (stats.correct / stats.total) >= 0.8)
                .map(([type, stats]) => {
                  const typeNames = {
                    'multiple_choice': 'الاختيار المتعدد',
                    'typing': 'الكتابة',
                    'matching': 'المطابقة',
                    'true_false': 'صح/خطأ'
                  };
                  return (
                    <div key={type} className="text-gray-300 text-sm p-2 bg-gray-700/30 rounded">
                      {typeNames[type as keyof typeof typeNames]} ({Math.round((stats.correct / stats.total) * 100)}%)
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Strategies */}
      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-yellow-600/30">
        <h3 className="text-xl lg:text-2xl font-bold text-yellow-400 mb-6 flex items-center space-x-3">
          <Lightbulb size={24} />
          <span>نصائح للتحسين</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            'راجع الأخطاء فوراً وحاول فهم السبب',
            'تدرب على أنواع الأسئلة التي تجد صعوبة فيها',
            'اقرأ الأسئلة بعناية قبل الإجابة',
            'استخدم تقنيات الذاكرة مثل الربط والتكرار',
            'خذ فترات راحة منتظمة أثناء الدراسة',
            'اختبر نفسك بانتظام لتقييم التقدم'
          ].map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            نتائج الاختبار
          </h1>
          <p className="text-xl text-gray-400">
            {test.name} • {new Date(results.endTime).toLocaleDateString('ar-SA')}
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-2xl p-1 mb-8 border border-gray-700">
          {[
            { id: 'summary', label: 'الملخص', icon: Trophy },
            { id: 'detailed', label: 'تحليل مفصل', icon: BarChart3 },
            { id: 'questions', label: 'مراجعة الأسئلة', icon: Eye },
            { id: 'recommendations', label: 'التوصيات', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as ResultsView)}
                className={`
                  flex items-center space-x-2 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold transition-all touch-manipulation
                  ${currentView === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mb-8">
          {currentView === 'summary' && renderSummaryView()}
          {currentView === 'detailed' && renderDetailedView()}
          {currentView === 'questions' && renderQuestionsView()}
          {currentView === 'recommendations' && renderRecommendationsView()}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          
          <button
            onClick={onRestart}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <RefreshCw size={24} />
            <span>إعادة الاختبار</span>
          </button>
          
          <button
            onClick={onReviewAnswers}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Eye size={24} />
            <span>مراجعة تفصيلية</span>
          </button>
          
          <button
            onClick={onBackToTests}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
          >
            <Home size={24} />
            <span>العودة للاختبارات</span>
          </button>
        </div>
      </div>
    </div>
  );
}