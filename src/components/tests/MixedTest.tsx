// src/components/tests/MixedTest.tsx - النسخة المكتملة
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
        ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shuffle size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">اختبار مختلط</h2>
              <p className="text-sm text-gray-400">مزيج من جميع أنواع الأسئلة</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {currentQuestionIndex} / {totalQuestions}
            </div>
            <div className="text-sm text-gray-400">السؤال الحالي</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Current Question Type Indicator */}
        <div className={`
          mb-6 p-4 rounded-2xl border transition-all duration-500 transform
          ${typeIndicatorVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${typeInfo.bgColor} ${typeInfo.borderColor}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 bg-gradient-to-r ${typeInfo.color} rounded-xl flex items-center justify-center
            `}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${typeInfo.textColor}`}>
                {typeInfo.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {typeInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Test Component */}
      <div className={`
        transition-all duration-500 delay-200 transform
        ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        {renderTestComponent()}
      </div>

      {/* Question Type Legend (Bottom) */}
      {!showResult && (
        <div className={`
          mt-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700
          transition-all duration-700 delay-500 transform
          ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-blue-400" />
              <span className="text-gray-400">اختيار متعدد</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={16} className="text-green-400" />
              <span className="text-gray-400">كتابة</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} className="text-purple-400" />
              <span className="text-gray-400">مطابقة</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shuffle size={16} className="text-orange-400" />
              <span className="text-gray-400">صح/خطأ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}