// src/components/tests/MultipleChoiceTest.tsx
'use client';

import { TestQuestion } from '@/types/flashcard';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MultipleChoiceTestProps {
  question: TestQuestion;
  onAnswer: (answer: string) => void;
  timeLeft?: number;
  showResult?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isCompleted?: boolean;
}

export default function MultipleChoiceTest({ 
  question, 
  onAnswer, 
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false
}: MultipleChoiceTestProps) {
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(userAnswer || null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setSelectedAnswer(userAnswer || null);
    const timer = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [question.id, userAnswer]);

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (isCompleted || showResult) return;
    
    setSelectedAnswer(answer);
    // Give visual feedback before submitting
    setTimeout(() => {
      onAnswer(answer);
    }, 150);
  };

  // Get option styling based on state
  const getOptionStyling = (option: string, index: number) => {
    const isSelected = selectedAnswer === option;
    
    // Base styling
    let styling = `
      relative w-full p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 text-right
      font-semibold text-lg lg:text-xl touch-manipulation transform
      ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `;
    
    // Animation delay for staggered appearance
    styling += ` transition-delay-${index * 100}`;
    
    if (showResult && correctAnswer) {
      // Show results state
      const isCorrect = option === correctAnswer;
      const wasSelected = option === userAnswer;
      
      if (isCorrect) {
        // Correct answer - always green
        styling += ` bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white shadow-lg`;
      } else if (wasSelected && !isCorrect) {
        // Wrong selected answer - red
        styling += ` bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg`;
      } else {
        // Other options - dimmed
        styling += ` bg-gray-800/30 border-gray-700 text-gray-400`;
      }
    } else {
      // Normal state or selected state
      if (isSelected) {
        styling += ` bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg scale-[1.02]`;
      } else {
        styling += ` bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800/70 hover:border-gray-600 hover:scale-[1.01] active:scale-[0.99]`;
      }
    }
    
    return styling;
  };

  // Get icon for option
  const getOptionIcon = (option: string) => {
    if (!showResult || !correctAnswer) return null;
    
    const isCorrect = option === correctAnswer;
    const wasSelected = option === userAnswer;
    
    if (isCorrect) {
      return <CheckCircle2 size={24} className="text-white" />;
    } else if (wasSelected && !isCorrect) {
      return <XCircle size={24} className="text-white" />;
    }
    
    return null;
  };

  // Option labels (A, B, C, D)
  const optionLabels = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Question Card */}
      <div className={`
        bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm
        rounded-3xl lg:rounded-[2rem] p-6 lg:p-8 mb-8 border border-gray-700/50
        transition-all duration-500 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}>
        
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg lg:text-xl">؟</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg lg:text-xl">اختيار متعدد</h3>
              <p className="text-gray-400 text-sm">اختر الإجابة الصحيحة</p>
            </div>
          </div>
          
          {/* Timer */}
          {timeLeft !== undefined && timeLeft > 0 && !showResult && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              timeLeft <= 10 ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
            }`}>
              <Clock size={18} />
              <span className="font-bold">{timeLeft}ث</span>
            </div>
          )}
        </div>

        {/* Question Text */}
        <div className="bg-gray-700/30 rounded-2xl p-6 lg:p-8 border border-gray-600/50">
          <p className="text-white text-xl lg:text-2xl font-semibold leading-relaxed text-center">
            {question.question}
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {question.options?.map((option, index) => (
          <button
            key={`${question.id}-${index}`}
            onClick={() => handleAnswerSelect(option)}
            disabled={isCompleted || showResult}
            className={getOptionStyling(option, index)}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="flex items-center justify-between">
              
              {/* Option Content */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Option Label */}
                <div className={`
                  w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center font-bold text-lg lg:text-xl
                  ${selectedAnswer === option && !showResult
                    ? 'bg-white/20 text-white' 
                    : showResult && correctAnswer === option
                    ? 'bg-white/20 text-white'
                    : showResult && userAnswer === option && option !== correctAnswer
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-700/50 text-gray-300'
                  }
                `}>
                  {optionLabels[index]}
                </div>
                
                {/* Option Text */}
                <span className="flex-1 text-right leading-relaxed">
                  {option}
                </span>
              </div>

              {/* Result Icon */}
              <div className="mr-4">
                {getOptionIcon(option)}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedAnswer === option && !showResult && (
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-white/30 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Result Explanation */}
      {showResult && correctAnswer && (
        <div className={`
          mt-8 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-500
          ${userAnswer === correctAnswer 
            ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50' 
            : 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-600/50'
          }
        `}>
          <div className="flex items-center space-x-4 mb-4">
            {userAnswer === correctAnswer ? (
              <>
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-green-400 font-bold text-xl">إجابة صحيحة! 🎉</h4>
                  <p className="text-gray-400">أحسنت، استمر في التقدم</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-xl">إجابة خاطئة</h4>
                  <p className="text-gray-400">لا تقلق، ستتحسن مع التدريب</p>
                </div>
              </>
            )}
          </div>
          
          {/* Correct Answer Highlight */}
          {userAnswer !== correctAnswer && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <AlertCircle size={20} className="text-blue-400" />
                <div>
                  <span className="text-gray-400 text-sm">الإجابة الصحيحة: </span>
                  <span className="text-white font-semibold">{correctAnswer}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {timeLeft !== undefined && timeLeft > 0 && !showResult && (
        <div className="mt-6">
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${(timeLeft / (question.timeSpent || 30)) * 100}%`,
                transition: 'width 1s linear'
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .transition-delay-0 { transition-delay: 0ms; }
        .transition-delay-100 { transition-delay: 100ms; }
        .transition-delay-200 { transition-delay: 200ms; }
        .transition-delay-300 { transition-delay: 300ms; }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}