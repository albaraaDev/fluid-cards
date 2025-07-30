// src/components/tests/MixedTest.tsx
'use client';

import { TestQuestion } from '@/types/flashcard';
import { Shuffle, Star, Target, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MatchingTest from './MatchingTest';
import MultipleChoiceTest from './MultipleChoiceTest';
import TrueFalseTest from './TrueFalseTest';
import TypingTest from './TypingTest';

interface MixedTestProps {
  question: TestQuestion;
  onAnswer: (answer: string | Record<string, string> | boolean) => void;
  timeLeft?: number;
  showResult?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isCompleted?: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

export default function MixedTest({ 
  question, 
  onAnswer, 
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false,
  currentQuestionIndex = 1,
  totalQuestions = 10
}: MixedTestProps) {
  
  const [hasAnimated, setHasAnimated] = useState(false);
  const [typeIndicatorVisible, setTypeIndicatorVisible] = useState(true);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setTypeIndicatorVisible(true);
    
    const timer = setTimeout(() => {
      setHasAnimated(true);
      // Hide type indicator after showing it briefly
      setTimeout(() => setTypeIndicatorVisible(false), 2000);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [question.id]);

  // Get question type info
  const getQuestionTypeInfo = () => {
    switch (question.type) {
      case 'multiple_choice':
        return {
          title: 'اختيار متعدد',
          description: '4 خيارات - اختر الصحيح',
          icon: Target,
          color: 'from-blue-600 to-blue-800',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-600/50'
        };
      case 'typing':
        return {
          title: 'كتابة الإجابة',
          description: 'اكتب الإجابة بنفسك',
          icon: Zap,
          color: 'from-green-600 to-green-800',
          textColor: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-600/50'
        };
      case 'matching':
        return {
          title: 'مطابقة',
          description: 'اربط الكلمات بمعانيها',
          icon: Star,
          color: 'from-purple-600 to-purple-800',
          textColor: 'text-purple-400',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-600/50'
        };
      case 'true_false':
        return {
          title: 'صح أم خطأ',
          description: 'حدد صحة الجملة',
          icon: Shuffle,
          color: 'from-orange-600 to-orange-800',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-900/20',
          borderColor: 'border-orange-600/50'
        };
      default:
        return {
          title: 'سؤال مختلط',
          description: 'نوع متنوع',
          icon: Shuffle,
          color: 'from-pink-600 to-pink-800',
          textColor: 'text-pink-400',
          bgColor: 'bg-pink-900/20',
          borderColor: 'border-pink-600/50'
        };
    }
  };

  const typeInfo = getQuestionTypeInfo();
  const Icon = typeInfo.icon;

  // Handle answer submission (convert to string for consistency)
  const handleAnswer = (answer: string | Record<string, string> | boolean) => {
    let formattedAnswer: string;
    
    if (typeof answer === 'boolean') {
      formattedAnswer = answer.toString();
    } else if (typeof answer === 'object') {
      formattedAnswer = JSON.stringify(answer);
    } else {
      formattedAnswer = answer;
    }
    
    onAnswer(formattedAnswer);
  };

  // Render the appropriate test component
  const renderTestComponent = () => {
    const commonProps = {
      question,
      timeLeft,
      showResult,
      correctAnswer,
      userAnswer,
      isCompleted
    };

    switch (question.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceTest
            {...commonProps}
            onAnswer={(answer: string) => handleAnswer(answer)}
          />
        );
      
      case 'typing':
        return (
          <TypingTest
            {...commonProps}
            onAnswer={(answer: string) => handleAnswer(answer)}
          />
        );
      
      case 'matching':
        return (
          <MatchingTest
            {...commonProps}
            onAnswer={(answer: Record<string, string>) => handleAnswer(answer)}
          />
        );
      
      case 'true_false':
        return (
          <TrueFalseTest
            {...commonProps}
            onAnswer={(answer: boolean) => handleAnswer(answer)}
          />
        );
      
      default:
        return (
          <div className="text-center text-gray-400 p-8">
            نوع السؤال غير مدعوم: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      
      {/* Mixed Test Header */}
      <div className={`
        relative mb-6 transition-all duration-700 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}>
        
        {/* Main Header Card */}
        <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-pink-800/30">
          <div className="flex items-center justify-between">
            
            {/* Left Side - Mixed Test Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Shuffle className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg lg:text-xl">اختبار مختلط</h2>
                <p className="text-gray-400 text-sm">أنواع متنوعة من الأسئلة</p>
              </div>
            </div>

            {/* Right Side - Progress */}
            <div className="text-left">
              <div className="text-white font-bold text-lg lg:text-xl">
                {currentQuestionIndex} / {totalQuestions}
              </div>
              <div className="text-gray-400 text-sm">السؤال الحالي</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000 ease-out"
                style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Type Indicator */}
        {typeIndicatorVisible && (
          <div className={`
            absolute -bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-1000
            ${hasAnimated ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
          `}>
            <div className={`
              ${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-2xl px-4 py-2 
              backdrop-blur-sm shadow-lg animate-pulse
            `}>
              <div className="flex items-center space-x-3">
                <Icon size={18} className={typeInfo.textColor} />
                <div>
                  <div className={`${typeInfo.textColor} font-bold text-sm`}>
                    {typeInfo.title}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {typeInfo.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Component */}
      <div className={`
        transition-all duration-700 delay-200 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}>
        {renderTestComponent()}
      </div>

      {/* Mixed Test Footer */}
      {!showResult && (
        <div className={`
          mt-8 text-center transition-all duration-700 delay-400 transform
          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="inline-flex items-center space-x-3 bg-gray-800/50 rounded-2xl px-6 py-3 border border-gray-700">
            <Shuffle className="text-pink-400" size={16} />
            <span className="text-gray-400 text-sm">
              نوع السؤال التالي سيكون مفاجأة
            </span>
            <span className="text-pink-400 text-lg">✨</span>
          </div>
        </div>
      )}

      {/* Achievement Celebration */}
      {showResult && currentQuestionIndex === totalQuestions && (
        <div className={`
          mt-8 text-center transition-all duration-1000 delay-800 transform
          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-3xl p-6 border border-yellow-600/30">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-yellow-400 font-bold text-2xl mb-2">
              أكملت الاختبار المختلط!
            </h3>
            <p className="text-gray-400">
              تحدٍ رائع! واجهت أنواعاً متنوعة من الأسئلة
            </p>
          </div>
        </div>
      )}

      {/* Difficulty Indicator */}
      {question.difficulty && question.difficulty > 3 && !showResult && (
        <div className={`
          fixed top-4 left-4 z-40 transition-all duration-1000 delay-600 transform
          ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <div className="bg-red-900/20 border border-red-600/50 rounded-xl px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs font-semibold">سؤال صعب</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes typeWriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        .type-writer {
          overflow: hidden;
          border-right: 0.15em solid #3B82F6;
          white-space: nowrap;
          animation: typeWriter 1s steps(20, end), blink-caret 0.75s step-end infinite;
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #3B82F6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3); }
          50% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.6); }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}