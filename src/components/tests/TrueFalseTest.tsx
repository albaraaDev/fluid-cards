// src/components/tests/TrueFalseTest.tsx
'use client';

import { TestQuestion } from '@/types/flashcard';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TrueFalseTestProps {
  question: TestQuestion;
  onAnswer: (answer: boolean) => void;
  timeLeft?: number;
  showResult?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isCompleted?: boolean;
}

export default function TrueFalseTest({ 
  question, 
  onAnswer, 
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false
}: TrueFalseTestProps) {
  
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(
    userAnswer ? userAnswer === 'true' : null
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const [pulseEffect, setPulseEffect] = useState<'true' | 'false' | null>(null);

  // Parse correct answer
  const isCorrectAnswer = correctAnswer === 'true';
  const isUserCorrect = showResult && userAnswer !== undefined && 
    ((userAnswer === 'true') === isCorrectAnswer);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setSelectedAnswer(userAnswer ? userAnswer === 'true' : null);
    setPulseEffect(null);
    const timer = setTimeout(() => setHasAnimated(true), 200);
    return () => clearTimeout(timer);
  }, [question.id, userAnswer]);

  // Handle answer selection
  const handleAnswerSelect = (answer: boolean) => {
    if (isCompleted || showResult) return;
    
    setSelectedAnswer(answer);
    setPulseEffect(answer ? 'true' : 'false');
    
    // Clear pulse effect and submit answer
    setTimeout(() => {
      setPulseEffect(null);
      onAnswer(answer);
    }, 200);
  };

  // Get button styling
  const getButtonStyling = (buttonType: 'true' | 'false') => {
    const isSelected = selectedAnswer === (buttonType === 'true');
    const isPulsing = pulseEffect === buttonType;
    
    let baseClasses = `
      relative flex-1 p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] border-2 font-bold text-xl lg:text-2xl
      transition-all duration-300 transform touch-manipulation overflow-hidden
      ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      ${isPulsing ? 'animate-pulse scale-105' : 'hover:scale-[1.02] active:scale-[0.98]'}
    `;
    
    if (showResult && correctAnswer) {
      // Show result colors
      const isCorrectButton = (buttonType === 'true') === isCorrectAnswer;
      const wasSelectedByUser = selectedAnswer === (buttonType === 'true');
      
      if (isCorrectButton) {
        // This is the correct answer
        baseClasses += ` bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white shadow-xl`;
      } else if (wasSelectedByUser && !isCorrectButton) {
        // User selected this wrong answer
        baseClasses += ` bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-xl`;
      } else {
        // Inactive option
        baseClasses += ` bg-gray-800/30 border-gray-700 text-gray-400`;
      }
    } else {
      // Normal state
      if (isSelected) {
        baseClasses += buttonType === 'true' 
          ? ` bg-gradient-to-br from-green-600 to-blue-600 border-green-500 text-white shadow-xl`
          : ` bg-gradient-to-br from-red-600 to-pink-600 border-red-500 text-white shadow-xl`;
      } else {
        baseClasses += ` bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800/70 hover:border-gray-600`;
      }
    }
    
    return baseClasses;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Question Card */}
      <div className={`
        bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm
        rounded-3xl lg:rounded-[2rem] p-6 lg:p-8 mb-8 border border-gray-700/50
        transition-all duration-700 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}>
        
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <HelpCircle className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg lg:text-xl">صح أم خطأ</h3>
              <p className="text-gray-400 text-sm">حدد ما إذا كانت الجملة صحيحة أم خاطئة</p>
            </div>
          </div>
          
          {/* Timer */}
          {timeLeft !== undefined && timeLeft > 0 && !showResult && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              timeLeft <= 5 ? 'bg-red-900/30 text-red-400' : 'bg-orange-900/30 text-orange-400'
            }`}>
              <Clock size={18} />
              <span className="font-bold">{timeLeft}ث</span>
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="bg-gray-700/30 rounded-2xl lg:rounded-3xl p-8 lg:p-12 border border-gray-600/50 relative">
          {/* Quote marks decoration */}
          <div className="absolute top-4 right-4 text-6xl text-gray-600/20 font-serif">&quot;</div>
          <div className="absolute bottom-4 left-4 text-6xl text-gray-600/20 font-serif">&quot;</div>
          
          <p className="text-white text-xl lg:text-3xl font-semibold leading-relaxed text-center relative z-10">
            {question.question}
          </p>
        </div>
      </div>

      {/* Answer Buttons */}
      <div className={`
        grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8
        transition-all duration-700 delay-300 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}>
        
        {/* True Button */}
        <button
          onClick={() => handleAnswerSelect(true)}
          disabled={isCompleted || showResult}
          className={getButtonStyling('true')}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <ThumbsUp size={40} className="lg:w-12 lg:h-12" />
              {/* Glow effect for correct answer */}
              {showResult && isCorrectAnswer && (
                <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 animate-pulse" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-2">صحيح ✓</div>
              <div className="text-sm lg:text-base opacity-80">الجملة صحيحة</div>
            </div>
          </div>
          
          {/* Selection indicator */}
          {selectedAnswer === true && !showResult && (
            <div className="absolute inset-0 rounded-3xl lg:rounded-[2rem] border-4 border-white/30 animate-pulse" />
          )}
          
          {/* Sparkle effect for correct selection */}
          {showResult && userAnswer === 'true' && isCorrectAnswer && (
            <div className="absolute top-4 right-4 text-yellow-300 animate-bounce">✨</div>
          )}
        </button>

        {/* False Button */}
        <button
          onClick={() => handleAnswerSelect(false)}
          disabled={isCompleted || showResult}
          className={getButtonStyling('false')}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <ThumbsDown size={40} className="lg:w-12 lg:h-12" />
              {/* Glow effect for correct answer */}
              {showResult && !isCorrectAnswer && (
                <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 animate-pulse" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-2">خطأ ✗</div>
              <div className="text-sm lg:text-base opacity-80">الجملة خاطئة</div>
            </div>
          </div>
          
          {/* Selection indicator */}
          {selectedAnswer === false && !showResult && (
            <div className="absolute inset-0 rounded-3xl lg:rounded-[2rem] border-4 border-white/30 animate-pulse" />
          )}
          
          {/* Sparkle effect for correct selection */}
          {showResult && userAnswer === 'false' && !isCorrectAnswer && (
            <div className="absolute top-4 right-4 text-yellow-300 animate-bounce">✨</div>
          )}
        </button>
      </div>

      {/* Result Explanation */}
      {showResult && (
        <div className={`
          p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-700 delay-600
          transform ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          ${isUserCorrect 
            ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50' 
            : 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-600/50'
          }
        `}>
          
          {/* Result Header */}
          <div className="flex items-center space-x-4 mb-6">
            {isUserCorrect ? (
              <>
                <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <CheckCircle2 size={32} className="text-white z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-green-400 font-bold text-2xl flex items-center space-x-2">
                    <span>إجابة صحيحة!</span>
                    <span className="text-3xl">🎉</span>
                  </h4>
                  <p className="text-gray-400 text-lg">ممتاز! لديك فهم جيد</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <XCircle size={32} className="text-white z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-2xl">إجابة خاطئة</h4>
                  <p className="text-gray-400 text-lg">لا تقلق، هذا جزء من التعلم</p>
                </div>
              </>
            )}
          </div>

          {/* Answer Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User's Answer */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isUserCorrect ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {isUserCorrect ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                </div>
                <h5 className="text-white font-bold">إجابتك</h5>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${
                  userAnswer === 'true' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                }`}>
                  {userAnswer === 'true' ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />}
                  <span className="font-bold text-lg">{userAnswer === 'true' ? 'صحيح' : 'خطأ'}</span>
                </div>
              </div>
            </div>

            {/* Correct Answer */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <h5 className="text-white font-bold">الإجابة الصحيحة</h5>
              </div>
              <div className="text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl ${
                  isCorrectAnswer ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                }`}>
                  {isCorrectAnswer ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />}
                  <span className="font-bold text-lg">{isCorrectAnswer ? 'صحيح' : 'خطأ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Explanation */}
          {!isUserCorrect && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <AlertCircle className="text-blue-400" size={20} />
                <span className="text-blue-400 font-semibold">نصيحة للمرة القادمة:</span>
              </div>
              <p className="text-gray-300 text-sm">
                {isCorrectAnswer 
                  ? 'هذه الجملة صحيحة. راجع معنى الكلمة مرة أخرى لتتذكرها بشكل أفضل.'
                  : 'هذه الجملة خاطئة. انتبه للتفاصيل الدقيقة في المعاني.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Decision Indicator */}
      {!showResult && selectedAnswer === null && timeLeft && timeLeft <= 8 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-900/20 border border-yellow-800/30 rounded-xl px-4 py-2 animate-pulse">
            <AlertCircle className="text-yellow-400" size={16} />
            <span className="text-yellow-400 text-sm font-semibold">قرار سريع مطلوب!</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {timeLeft !== undefined && timeLeft > 0 && !showResult && (
        <div className="mt-6">
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ 
                width: `${(timeLeft / (question.timeSpent || 15)) * 100}%`,
                transition: 'width 1s linear'
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}