// src/components/tests/MatchingTest.tsx - النسخة المكتملة
'use client';

import { TestQuestion } from '@/types/flashcard';
import {
  CheckCircle2,
  Clock,
  Eye,
  Link,
  RotateCcw,
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

interface DragState {
  isDragging: boolean;
  draggedItem: string | null;
  dragType: 'word' | 'meaning' | null;
  draggedFromIndex: number | null;
}

export default function MatchingTest({
  question,
  onAnswer,
  timeLeft,
  showResult = false,
  correctAnswer,
  userAnswer,
  isCompleted = false,
}: MatchingTestProps) {
  // Parse question data
  const questionData = JSON.parse(question.question);
  const words = questionData.words as string[];
  const meanings = questionData.meanings as string[];

  // Parse correct and user answers
  const correctMatches = JSON.parse(correctAnswer || '{}') as Record<string, string>;
  const userMatches = JSON.parse(userAnswer || '{}') as Record<string, string>;

  // State
  const [matches, setMatches] = useState<Record<string, string>>(userMatches);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragType: null,
    draggedFromIndex: null,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setMatches(userMatches);
    setSelectedWord(null);
    
    const timer = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [question.id, userAnswer]);

  // Calculate stats
  const matchedCount = Object.keys(matches).length;
  const totalPairs = words.length;
  const allMatched = matchedCount === totalPairs;

  // Check if all matches are correct
  const allCorrect = showResult && Object.keys(correctMatches).every(
    word => matches[word] === correctMatches[word]
  );

  // Handle mobile tap selection
  const handleWordSelection = (word: string) => {
    if (isCompleted || showResult) return;
    
    if (selectedWord === word) {
      setSelectedWord(null);
    } else if (selectedWord) {
      // Create match between selectedWord and word
      if (words.includes(selectedWord) && meanings.includes(word)) {
        setMatches(prev => ({ ...prev, [selectedWord]: word }));
      } else if (meanings.includes(selectedWord) && words.includes(word)) {
        setMatches(prev => ({ ...prev, [word]: selectedWord }));
      }
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  // Handle drag operations
  const handleDragStart = (item: string, type: 'word' | 'meaning', index: number) => {
    if (isCompleted || showResult) return;
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragType: type,
      draggedFromIndex: index,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (item: string, type: 'word' | 'meaning', e?: React.DragEvent) => {
    if (e) e.preventDefault();

    if (!dragState.draggedItem || dragState.dragType === type || isCompleted || showResult) {
      resetDragState();
      return;
    }

    // Create match
    if (dragState.dragType === 'word' && type === 'meaning') {
      setMatches(prev => ({ ...prev, [dragState.draggedItem!]: item }));
    } else if (dragState.dragType === 'meaning' && type === 'word') {
      setMatches(prev => ({ ...prev, [item]: dragState.draggedItem! }));
    }

    resetDragState();
  };

  const resetDragState = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragType: null,
      draggedFromIndex: null,
    });
  };

  // Remove match
  const removeMatch = (word: string) => {
    if (isCompleted || showResult) return;
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[word];
      return newMatches;
    });
  };

  // Reset all matches
  const handleReset = () => {
    if (isCompleted || showResult) return;
    setMatches({});
    setSelectedWord(null);
  };

  // Submit answers
  const handleSubmit = () => {
    if (matchedCount === 0 || isCompleted || showResult) return;
    onAnswer(matches);
  };

  // Check if item is matched
  const isWordMatched = (word: string) => matches.hasOwnProperty(word);
  const isMeaningMatched = (meaning: string) => Object.values(matches).includes(meaning);

  return (
    <div className={`w-full transition-all duration-700 ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
          اربط الكلمات بمعانيها
        </h3>
        <p className="text-gray-400 text-lg">
          اسحب الكلمات أو اضغط لربطها بمعانيها الصحيحة
        </p>
        <div className="mt-4 text-purple-400 font-semibold">
          تم ربط {matchedCount} من {totalPairs}
        </div>
      </div>

      {/* Matching Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Words Column */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-white text-center mb-6 pb-3 border-b border-gray-700">
            الكلمات
          </h4>
          {words.map((word, index) => {
            const isMatched = isWordMatched(word);
            const isSelected = selectedWord === word;
            const isCorrectMatch = showResult && matches[word] === correctMatches[word];
            const isWrongMatch = showResult && matches[word] && matches[word] !== correctMatches[word];
            
            return (
              <div
                key={word}
                draggable={!isCompleted && !showResult}
                onDragStart={() => handleDragStart(word, 'word', index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(word, 'word')}
                onClick={() => handleWordSelection(word)}
                className={`
                  p-4 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 touch-manipulation select-none
                  ${isSelected ? 'border-purple-500 bg-purple-900/30 scale-105' : 
                    isMatched ? 
                      showResult ? 
                        isCorrectMatch ? 'border-green-500 bg-green-900/20' :
                        isWrongMatch ? 'border-red-500 bg-red-900/20' :
                        'border-gray-600 bg-gray-800/50'
                      : 'border-purple-600 bg-purple-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-900/10'
                  }
                  ${dragState.isDragging && dragState.draggedItem === word ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">{word}</span>
                  <div className="flex items-center space-x-2">
                    {isMatched && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMatch(word);
                        }}
                        disabled={isCompleted || showResult}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    {showResult && isMatched && (
                      isCorrectMatch ? (
                        <CheckCircle2 className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )
                    )}
                    {!showResult && isMatched && (
                      <Link className="text-purple-400" size={20} />
                    )}
                  </div>
                </div>
                {isMatched && (
                  <div className="mt-2 text-sm text-gray-400">
                    مرتبطة بـ: <span className="text-purple-400">{matches[word]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Meanings Column */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-white text-center mb-6 pb-3 border-b border-gray-700">
            المعاني
          </h4>
          {meanings.map((meaning, index) => {
            const isMatched = isMeaningMatched(meaning);
            const isSelected = selectedWord === meaning;
            const matchedWord = Object.keys(matches).find(word => matches[word] === meaning);
            const isCorrectMatch = showResult && matchedWord && correctMatches[matchedWord] === meaning;
            const isWrongMatch = showResult && matchedWord && correctMatches[matchedWord] !== meaning;
            
            return (
              <div
                key={meaning}
                draggable={!isCompleted && !showResult}
                onDragStart={() => handleDragStart(meaning, 'meaning', index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(meaning, 'meaning')}
                onClick={() => handleWordSelection(meaning)}
                className={`
                  p-4 lg:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 touch-manipulation select-none
                  ${isSelected ? 'border-purple-500 bg-purple-900/30 scale-105' : 
                    isMatched ? 
                      showResult ? 
                        isCorrectMatch ? 'border-green-500 bg-green-900/20' :
                        isWrongMatch ? 'border-red-500 bg-red-900/20' :
                        'border-gray-600 bg-gray-800/50'
                      : 'border-purple-600 bg-purple-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-900/10'
                  }
                  ${dragState.isDragging && dragState.draggedItem === meaning ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{meaning}</span>
                  <div className="flex items-center space-x-2">
                    {showResult && isMatched && (
                      isCorrectMatch ? (
                        <CheckCircle2 className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )
                    )}
                    {!showResult && isMatched && (
                      <Link className="text-purple-400" size={20} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {!showResult && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            onClick={handleReset}
            disabled={Object.keys(matches).length === 0}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all touch-manipulation
              ${
                Object.keys(matches).length > 0
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <RotateCcw size={18} />
            <span>إعادة تعيين</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={matchedCount === 0}
            className={`
              flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform touch-manipulation
              ${
                matchedCount > 0
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Eye size={20} />
            <span>عرض النتائج</span>
          </button>
        </div>
      )}

      {/* Result Summary */}
      {showResult && (
        <div className={`
          mt-8 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-700 delay-700
          ${
            allCorrect
              ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50'
              : 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-600/50'
          }
        `}>
          <div className="flex items-center space-x-4 mb-4">
            {allCorrect ? (
              <>
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-green-400 font-bold text-xl">مطابقة مثالية!</h4>
                  <p className="text-gray-400">جميع الربط صحيح</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-orange-400 font-bold text-xl">يحتاج تحسين</h4>
                  <p className="text-gray-400">بعض الربط غير صحيح</p>
                </div>
              </>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {Object.keys(correctMatches).filter(word => matches[word] === correctMatches[word]).length} / {Object.keys(correctMatches).length}
            </div>
            <div className="text-gray-400">ربط صحيح</div>
          </div>
        </div>
      )}

      {/* Timer Progress */}
      {timeLeft !== undefined && timeLeft > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm flex items-center space-x-1">
              <Clock size={16} />
              <span>الوقت المتبقي</span>
            </span>
            <span className="text-white font-bold">{timeLeft}ث</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 30 ? 'bg-yellow-500' : 'bg-purple-500'
              }`}
              style={{
                width: `${(timeLeft / (question.timeSpent || 60)) * 100}%`,
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}