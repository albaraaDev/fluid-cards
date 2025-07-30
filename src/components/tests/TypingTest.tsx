// src/components/tests/TypingTest.tsx
'use client';

import { TestQuestion } from '@/types/flashcard';
import { QuestionGenerator } from '@/utils/QuestionGenerator';
import { AlertCircle, CheckCircle2, Clock, Lightbulb, PenTool, Type, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TypingTestProps {
  question: TestQuestion;
  onAnswer: (answer: string) => void;
  timeLeft?: number;
  showResult?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isCompleted?: boolean;
}

export default function TypingTest({ 
  question, 
  onAnswer, 
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false
}: TypingTestProps) {
  
  const [inputValue, setInputValue] = useState(userAnswer || '');
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setInputValue(userAnswer || '');
    setShowHint(false);
    const timer = setTimeout(() => {
      setHasAnimated(true);
      // Auto-focus input after animation
      if (inputRef.current && !showResult) {
        inputRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [question.id, userAnswer, showResult]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isCompleted || showResult) return;
    setInputValue(e.target.value);
  };

  // Handle submit (Enter key or button click)
  const handleSubmit = () => {
    if (!inputValue.trim() || isCompleted || showResult) return;
    onAnswer(inputValue.trim());
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show hint after some time
  useEffect(() => {
    if (!showResult && timeLeft && timeLeft <= 15) {
      setShowHint(true);
    }
  }, [timeLeft, showResult]);

  // Check if answer is correct (using our smart validation)
  const isAnswerCorrect = showResult && correctAnswer && userAnswer 
    ? QuestionGenerator.validateTypingAnswer(userAnswer, correctAnswer)
    : false;

  // Get character and word count
  const charCount = inputValue.length;
  const wordCount = inputValue.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Get suggestions based on input
  const getSuggestions = () => {
    if (!correctAnswer || inputValue.length < 2) return [];
    
    const input = inputValue.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase();
    
    // If input is very similar, show completion suggestion
    if (correct.startsWith(input) && input.length >= correct.length * 0.5) {
      return [correctAnswer];
    }
    
    return [];
  };

  const suggestions = getSuggestions();

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
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <PenTool className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg lg:text-xl">كتابة الإجابة</h3>
              <p className="text-gray-400 text-sm">اكتب الإجابة الصحيحة</p>
            </div>
          </div>
          
          {/* Timer */}
          {timeLeft !== undefined && timeLeft > 0 && !showResult && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              timeLeft <= 10 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
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

      {/* Input Section */}
      <div className={`
        transition-all duration-700 delay-300 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}>
        
        {/* Input Field */}
        <div className={`
          bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm
          rounded-2xl lg:rounded-3xl p-6 lg:p-8 border-2 transition-all duration-300
          ${isFocused ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-gray-700/50'}
          ${showResult ? 'pointer-events-none' : ''}
        `}>
          
          {/* Input Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Type className="text-green-400" size={20} />
              <span className="text-white font-semibold">اكتب إجابتك هنا</span>
            </div>
            
            {/* Character Counter */}
            <div className="text-sm text-gray-400">
              <span className={charCount > 100 ? 'text-orange-400' : ''}>{charCount}</span>
              <span className="mx-1">حرف</span>
              {wordCount > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <span>{wordCount} كلمة</span>
                </>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isCompleted || showResult}
            placeholder="اكتب الإجابة هنا... (اضغط Enter للإرسال)"
            className={`
              w-full bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 lg:p-6 
              text-white text-lg lg:text-xl leading-relaxed resize-none
              focus:outline-none focus:border-green-500/50 focus:bg-gray-700/50
              transition-all duration-300 placeholder-gray-500
              ${showResult ? 'cursor-not-allowed opacity-60' : ''}
            `}
            rows={3}
            style={{ 
              minHeight: '120px',
              fontFamily: 'inherit'
            }}
          />

          {/* Suggestions */}
          {suggestions.length > 0 && !showResult && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="text-blue-400" size={16} />
                <span className="text-blue-400 text-sm font-semibold">اقتراح:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 
                             rounded-lg text-blue-200 text-sm transition-all hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hint */}
          {showHint && !showResult && correctAnswer && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="text-yellow-400" size={16} />
                <span className="text-yellow-400 text-sm font-semibold">تلميح:</span>
              </div>
              <p className="text-gray-300 text-sm">
                الإجابة تبدأ بـ &quot;{correctAnswer.substring(0, Math.min(2, correctAnswer.length))}&quot;
                {correctAnswer.length > 5 && ` وتحتوي على ${correctAnswer.length} حرف`}
              </p>
            </div>
          )}

          {/* Submit Button */}
          {!showResult && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isCompleted}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-lg transition-all transform touch-manipulation
                  ${inputValue.trim() && !isCompleted
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                إرسال الإجابة
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {showResult && correctAnswer && (
        <div className={`
          mt-8 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-700 delay-500
          transform ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
          ${isAnswerCorrect 
            ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50' 
            : 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-600/50'
          }
        `}>
          
          {/* Result Header */}
          <div className="flex items-center space-x-4 mb-6">
            {isAnswerCorrect ? (
              <>
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-green-400 font-bold text-xl">إجابة صحيحة! 🎉</h4>
                  <p className="text-gray-400">ممتاز! إجابتك دقيقة</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-xl">إجابة غير دقيقة</h4>
                  <p className="text-gray-400">لا تقلق، راجع الإجابة الصحيحة</p>
                </div>
              </>
            )}
          </div>

          {/* Answer Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Answer */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h5 className="text-gray-400 text-sm font-semibold mb-2">إجابتك:</h5>
              <p className={`text-lg font-medium ${isAnswerCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {userAnswer || 'لم تكتب إجابة'}
              </p>
            </div>

            {/* Correct Answer */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h5 className="text-gray-400 text-sm font-semibold mb-2">الإجابة الصحيحة:</h5>
              <p className="text-lg font-medium text-green-300">
                {correctAnswer}
              </p>
            </div>
          </div>

          {/* Similarity Indicator */}
          {!isAnswerCorrect && userAnswer && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 text-sm font-semibold">مدى التشابه:</span>
                <span className="text-blue-300 text-sm">
                  {Math.round(calculateSimilarity(userAnswer, correctAnswer) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
                  style={{ width: `${calculateSimilarity(userAnswer, correctAnswer) * 100}%` }}
                />
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
                timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${(timeLeft / (question.timeSpent || 45)) * 100}%`,
                transition: 'width 1s linear'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate similarity (simple version)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Simple approach - count matching characters
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
  const norm1 = normalize(str1);
  const norm2 = normalize(str2);
  
  let matches = 0;
  const minLength = Math.min(norm1.length, norm2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (norm1[i] === norm2[i]) matches++;
  }
  
  return matches / Math.max(norm1.length, norm2.length);
}