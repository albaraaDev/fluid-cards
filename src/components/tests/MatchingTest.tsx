// src/components/tests/MatchingTest.tsx - النسخة المحسنة
'use client';

import { TestQuestion } from '@/types/flashcard';
import {
  CheckCircle2,
  Clock,
  Eye,
  Link,
  RotateCcw,
  Shuffle,
  Target,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MatchingTestProps {
  question: TestQuestion;
  onAnswer: (matches: Record<string, string>) => void;
  timeLeft?: number;
  showResult?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isCompleted?: boolean;
}

interface MatchPair {
  word: string;
  meaning: string;
  isMatched: boolean;
  isCorrect?: boolean;
}

export default function MatchingTest({
  question,
  onAnswer,
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false
}: MatchingTestProps) {
  
  // ==========================================
  // State Management
  // ==========================================
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Animation timer ref
  const animationTimer = useRef<number | null>(null);
  
  // ==========================================
  // Data Processing - 🔥 إصلاح مشكلة JSON
  // ==========================================
  const { words, meanings, correctMatches } = React.useMemo(() => {
    // 🔥 استخدام matchingData الجديدة بدلاً من JSON.parse
    if (question.matchingData) {
      return {
        words: question.matchingData.words,
        meanings: question.matchingData.meanings,
        correctMatches: question.matchingData.correctMatches,
      };
    }
    
    // Fallback للكود القديم (مؤقت)
    try {
      const correctMatches = JSON.parse(question.correctAnswer);
      const words = Object.keys(correctMatches);
      const meanings = Object.values(correctMatches) as string[];
      
      return {
        words,
        meanings: [...meanings].sort(() => Math.random() - 0.5), // خلط المعاني
        correctMatches,
      };
    } catch (error) {
      console.error('❌ خطأ في تحليل بيانات المطابقة:', error);
      
      // بيانات افتراضية لمنع التعطل
      return {
        words: ['كلمة مؤقتة'],
        meanings: ['معنى مؤقت'],
        correctMatches: { 'كلمة مؤقتة': 'معنى مؤقت' },
      };
    }
  }, [question]);

  // ==========================================
  // Effects
  // ==========================================
  
  // Reset animation on question change
  useEffect(() => {
    setHasAnimated(false);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatches({});
    
    // Load previous matches if available
    if (userAnswer) {
      try {
        const previousMatches = JSON.parse(userAnswer);
        setMatches(previousMatches);
      } catch (error) {
        console.error('Error loading previous matches:', error);
      }
    }
    
    if (animationTimer.current) {
      clearTimeout(animationTimer.current);
    }
    
    animationTimer.current = window.setTimeout(() => {
      setHasAnimated(true);
    }, 100);

    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, [question.id, userAnswer]);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleWordClick = useCallback((word: string) => {
    if (isCompleted || showResult) return;
    
    // إذا كانت الكلمة مطابقة بالفعل، إلغاء المطابقة
    if (matches[word]) {
      const newMatches = { ...matches };
      delete newMatches[word];
      setMatches(newMatches);
      setSelectedWord(null);
      return;
    }
    
    // إذا كان هناك معنى محدد، قم بالمطابقة
    if (selectedMeaning) {
      const newMatches = { ...matches, [word]: selectedMeaning };
      setMatches(newMatches);
      setSelectedWord(null);
      setSelectedMeaning(null);
      
      // إذا اكتملت جميع المطابقات، أرسل الإجابة
      if (Object.keys(newMatches).length === words.length) {
        setTimeout(() => {
          onAnswer(newMatches);
        }, 300);
      }
    } else {
      setSelectedWord(word);
      setSelectedMeaning(null);
    }
  }, [isCompleted, showResult, matches, selectedMeaning, words.length, onAnswer]);

  const handleMeaningClick = useCallback((meaning: string) => {
    if (isCompleted || showResult) return;
    
    // إذا كان المعنى مطابق بالفعل، إلغاء المطابقة
    const matchedWord = Object.keys(matches).find(word => matches[word] === meaning);
    if (matchedWord) {
      const newMatches = { ...matches };
      delete newMatches[matchedWord];
      setMatches(newMatches);
      setSelectedMeaning(null);
      return;
    }
    
    // إذا كان هناك كلمة محددة، قم بالمطابقة
    if (selectedWord) {
      const newMatches = { ...matches, [selectedWord]: meaning };
      setMatches(newMatches);
      setSelectedWord(null);
      setSelectedMeaning(null);
      
      // إذا اكتملت جميع المطابقات، أرسل الإجابة
      if (Object.keys(newMatches).length === words.length) {
        setTimeout(() => {
          onAnswer(newMatches);
        }, 300);
      }
    } else {
      setSelectedMeaning(meaning);
      setSelectedWord(null);
    }
  }, [isCompleted, showResult, matches, selectedWord, words.length, onAnswer]);

  const handleReset = useCallback(() => {
    if (isCompleted || showResult) return;
    
    setMatches({});
    setSelectedWord(null);
    setSelectedMeaning(null);
  }, [isCompleted, showResult]);

  const toggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  // ==========================================
  // Helper Functions
  // ==========================================
  
  const getWordStyling = (word: string) => {
    const isMatched = matches[word];
    const isSelected = selectedWord === word;
    let isCorrect = false;
    
    if (showResult && isMatched) {
      isCorrect = correctMatches[word] === matches[word];
    }
    
    let classes = `
      relative p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 
      font-semibold text-lg lg:text-xl text-right cursor-pointer transform hover:scale-105
      ${hasAnimated ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
    `;
    
    if (showResult) {
      if (isMatched) {
        classes += isCorrect
          ? ` bg-green-900/30 border-green-500/50 text-green-300`
          : ` bg-red-900/30 border-red-500/50 text-red-300`;
      } else {
        classes += ` bg-gray-900/30 border-gray-600/50 text-gray-400`;
      }
    } else if (isMatched) {
      classes += ` bg-blue-900/30 border-blue-500/50 text-blue-300`;
    } else if (isSelected) {
      classes += ` bg-purple-900/30 border-purple-500/50 text-purple-300 scale-105`;
    } else {
      classes += ` bg-gray-900/30 border-gray-600/50 text-white hover:bg-gray-800/40 hover:border-gray-500/60`;
    }
    
    return classes;
  };

  const getMeaningStyling = (meaning: string) => {
    const matchedWord = Object.keys(matches).find(word => matches[word] === meaning);
    const isMatched = !!matchedWord;
    const isSelected = selectedMeaning === meaning;
    let isCorrect = false;
    
    if (showResult && isMatched) {
      isCorrect = correctMatches[matchedWord] === meaning;
    }
    
    let classes = `
      relative p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all duration-300 
      font-semibold text-lg lg:text-xl text-right cursor-pointer transform hover:scale-105
      ${hasAnimated ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
    `;
    
    if (showResult) {
      if (isMatched) {
        classes += isCorrect
          ? ` bg-green-900/30 border-green-500/50 text-green-300`
          : ` bg-red-900/30 border-red-500/50 text-red-300`;
      } else {
        classes += ` bg-gray-900/30 border-gray-600/50 text-gray-400`;
      }
    } else if (isMatched) {
      classes += ` bg-blue-900/30 border-blue-500/50 text-blue-300`;
    } else if (isSelected) {
      classes += ` bg-purple-900/30 border-purple-500/50 text-purple-300 scale-105`;
    } else {
      classes += ` bg-gray-900/30 border-gray-600/50 text-white hover:bg-gray-800/40 hover:border-gray-500/60`;
    }
    
    return classes;
  };

  const getConnectionLine = (word: string) => {
    const meaning = matches[word];
    if (!meaning) return null;
    
    const isCorrect = showResult ? correctMatches[word] === meaning : true;
    
    return (
      <div 
        key={`line-${word}`}
        className={`
          absolute top-1/2 left-1/2 w-1 h-8 transform -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-500 rounded-full
          ${isCorrect ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'}
          ${hasAnimated ? 'scale-y-100' : 'scale-y-0'}
        `}
      />
    );
  };

  // ==========================================
  // Statistics
  // ==========================================
  const matchedCount = Object.keys(matches).length;
  const totalCount = words.length;
  const progress = totalCount > 0 ? (matchedCount / totalCount) * 100 : 0;
  
  let correctCount = 0;
  if (showResult) {
    correctCount = Object.keys(matches).filter(word => 
      correctMatches[word] === matches[word]
    ).length;
  }

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="w-full max-w-4xl mx-auto p-4 lg:p-6">
      
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            🔗 اختبار المطابقة
          </h2>
          
          <div className="flex items-center gap-4">
            {timeLeft !== undefined && (
              <div className="flex items-center gap-2 text-orange-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
            
            <button
              onClick={toggleHint}
              className="p-2 rounded-lg bg-blue-900/30 border border-blue-600/50 text-blue-300 hover:bg-blue-800/40 transition-colors"
              title="عرض تلميح"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {matchedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-gray-300 text-center mt-4">
          {isCompleted || showResult
            ? showResult 
              ? `أكملت ${correctCount} من ${totalCount} مطابقات صحيحة`
              : 'مكتمل! في انتظار النتائج...'
            : 'انقر على كلمة ثم انقر على معناها لربطهما معاً'
          }
        </p>
      </div>

      {/* Hint */}
      {showHint && !showResult && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-xl">
          <p className="text-blue-300 text-sm">
            💡 <strong>تلميح:</strong> ابدأ بالكلمات التي تعرفها جيداً، ثم انتقل للأصعب. 
            يمكنك النقر على أي مطابقة لإلغائها وإعادة ترتيبها.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Words Column */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-center text-gray-300 mb-4 flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            الكلمات
          </h3>
          
          {words.map((word, index) => (
            <div
              key={word}
              className={getWordStyling(word)}
              onClick={() => handleWordClick(word)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span>{word}</span>
                
                {matches[word] && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-400" />
                    {showResult && (
                      correctMatches[word] === matches[word] 
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Connection indicator */}
              {/* {matches[word] && getConnectionLine(word)} */}
            </div>
          ))}
        </div>

        {/* Center Line */}
        {/* <div className="hidden lg:flex items-center justify-center">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
        </div> */}

        {/* Meanings Column */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-center text-gray-300 mb-4 flex items-center justify-center gap-2">
            <Shuffle className="w-5 h-5" />
            المعاني
          </h3>
          
          {meanings.map((meaning, index) => (
            <div
              key={meaning}
              className={getMeaningStyling(meaning)}
              onClick={() => handleMeaningClick(meaning)}
              style={{ animationDelay: `${(index + words.length) * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span>{meaning}</span>
                
                {Object.values(matches).includes(meaning) && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-400" />
                    {showResult && (
                      (() => {
                        const matchedWord = Object.keys(matches).find(word => matches[word] === meaning);
                        return matchedWord && correctMatches[matchedWord] === meaning
                          ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />;
                      })()
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && !showResult && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleReset}
            disabled={Object.keys(matches).length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة تعيين
          </button>
        </div>
      )}

      {/* Results Summary */}
      {showResult && (
        <div className="mt-8 p-6 bg-gray-900/50 border border-gray-600/30 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {correctCount === totalCount ? '🎉' : correctCount >= totalCount * 0.7 ? '👍' : '💪'}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              النتيجة: {correctCount}/{totalCount}
            </h3>
            
            <p className="text-gray-300">
              {correctCount === totalCount 
                ? 'ممتاز! جميع المطابقات صحيحة!'
                : correctCount >= totalCount * 0.7
                ? 'جيد جداً! استمر في التدريب'
                : 'تحتاج إلى مزيد من المراجعة'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}