// src/components/tests/MatchingTest.tsx
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
  const correctMatches = JSON.parse(correctAnswer || '{}') as Record<
    string,
    string
  >;
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
  const [connectorLines, setConnectorLines] = useState<
    Array<{ from: DOMRect; to: DOMRect; isCorrect?: boolean }>
  >([]);

  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);
  const meaningsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Reset animation when question changes
  useEffect(() => {
    setHasAnimated(false);
    setMatches(userMatches);
    setSelectedWord(null);
    const timer = setTimeout(() => setHasAnimated(true), 200);
    return () => clearTimeout(timer);
  }, [question.id, userMatches]);

  // Update connector lines when matches change
  useEffect(() => {
    updateConnectorLines();
  }, [matches, showResult]);

  // Handle item selection (for touch devices)
  const handleItemSelect = (item: string, type: 'word' | 'meaning') => {
    if (isCompleted || showResult) return;

    if (type === 'word') {
      if (selectedWord === item) {
        setSelectedWord(null);
      } else {
        setSelectedWord(item);
      }
    } else if (type === 'meaning' && selectedWord) {
      // Create or update match
      const newMatches = { ...matches };

      // Remove any existing match for this word
      delete newMatches[selectedWord];

      // Remove any existing match for this meaning
      Object.keys(newMatches).forEach((word) => {
        if (newMatches[word] === item) {
          delete newMatches[word];
        }
      });

      // Add new match
      newMatches[selectedWord] = item;

      setMatches(newMatches);
      setSelectedWord(null);
    }
  };

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent,
    item: string,
    type: 'word' | 'meaning',
    index: number
  ) => {
    if (isCompleted || showResult) return;

    setDragState({
      isDragging: true,
      draggedItem: item,
      dragType: type,
      draggedFromIndex: index,
    });

    e.dataTransfer.setData('text/plain', JSON.stringify({ item, type, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (
    e: React.DragEvent,
    dropItem: string,
    dropType: 'word' | 'meaning'
  ) => {
    e.preventDefault();

    if (isCompleted || showResult || !dragState.draggedItem) return;

    const { draggedItem: dragItem, dragType } = dragState;

    // Only allow word -> meaning or meaning -> word matches
    if (dragType === dropType) return;

    const newMatches = { ...matches };

    if (dragType === 'word' && dropType === 'meaning') {
      // Remove existing match for this word
      delete newMatches[dragItem];
      // Remove existing match for this meaning
      Object.keys(newMatches).forEach((word) => {
        if (newMatches[word] === dropItem) {
          delete newMatches[word];
        }
      });
      // Add new match
      newMatches[dragItem] = dropItem;
    } else if (dragType === 'meaning' && dropType === 'word') {
      // Remove existing match for this word
      delete newMatches[dropItem];
      // Remove existing match for this meaning
      Object.keys(newMatches).forEach((word) => {
        if (newMatches[word] === dragItem) {
          delete newMatches[word];
        }
      });
      // Add new match
      newMatches[dropItem] = dragItem;
    }

    setMatches(newMatches);
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragType: null,
      draggedFromIndex: null,
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragType: null,
      draggedFromIndex: null,
    });
  };

  // Remove match (double click/tap)
  const handleRemoveMatch = (word: string) => {
    if (isCompleted || showResult) return;

    const newMatches = { ...matches };
    delete newMatches[word];
    setMatches(newMatches);
  };

  // Submit matches
  const handleSubmit = () => {
    if (Object.keys(matches).length === 0 || isCompleted || showResult) return;
    onAnswer(matches);
  };

  // Reset all matches
  const handleReset = () => {
    if (isCompleted || showResult) return;
    setMatches({});
    setSelectedWord(null);
  };

  // Update connector lines
  const updateConnectorLines = useCallback(() => {
    const lines: Array<{ from: DOMRect; to: DOMRect; isCorrect?: boolean }> =
      [];

    Object.entries(matches).forEach(([word, meaning]) => {
      const wordIndex = words.indexOf(word);
      const meaningIndex = meanings.indexOf(meaning);

      const wordElement = wordsRef.current[wordIndex];
      const meaningElement = meaningsRef.current[meaningIndex];

      if (wordElement && meaningElement) {
        const wordRect = wordElement.getBoundingClientRect();
        const meaningRect = meaningElement.getBoundingClientRect();

        lines.push({
          from: wordRect,
          to: meaningRect,
          isCorrect: showResult ? correctMatches[word] === meaning : undefined,
        });
      }
    });

    setConnectorLines(lines);
  }, [correctMatches, matches, meanings, showResult, words]);

  // Check if all matches are correct
  const allCorrect =
    showResult &&
    Object.keys(correctMatches).every(
      (word) => matches[word] === correctMatches[word]
    );

  const matchedCount = Object.keys(matches).length;
  const totalCount = words.length;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Question Card */}
      <div
        className={`
        bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm
        rounded-3xl lg:rounded-[2rem] p-6 lg:p-8 mb-8 border border-gray-700/50
        transition-all duration-700 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}
      >
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Link className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg lg:text-xl">
                مطابقة
              </h3>
              <p className="text-gray-400 text-sm">اربط بين الكلمات ومعانيها</p>
            </div>
          </div>

          {/* Timer */}
          {timeLeft !== undefined && timeLeft > 0 && !showResult && (
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                timeLeft <= 15
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-purple-900/30 text-purple-400'
              }`}
            >
              <Clock size={18} />
              <span className="font-bold">{timeLeft}ث</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-700/30 rounded-2xl p-4 lg:p-6 border border-gray-600/50">
          <p className="text-gray-300 text-center">
            {!showResult ? (
              <>
                <span className="hidden lg:inline">
                  اسحب الكلمات إلى معانيها أو{' '}
                </span>
                <span>انقر على كلمة ثم على معناها لربطهما معاً</span>
              </>
            ) : (
              'النتائج - الخطوط الخضراء تشير إلى المطابقات الصحيحة'
            )}
          </p>
        </div>
      </div>

      {/* Matching Interface */}
      <div
        className={`
        relative transition-all duration-700 delay-300 transform
        ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}
      >
        {/* Progress Indicator */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center space-x-3 bg-gray-800/50 rounded-2xl px-6 py-3 border border-gray-700">
            <span className="text-gray-400">المطابقات:</span>
            <span
              className={`font-bold text-lg ${
                matchedCount === totalCount
                  ? 'text-green-400'
                  : 'text-purple-400'
              }`}
            >
              {matchedCount} / {totalCount}
            </span>
          </div>
        </div>

        {/* Matching Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Words Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xl text-center mb-6 flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">أ</span>
              </div>
              <span>الكلمات</span>
            </h4>

            {words.map((word, index) => {
              const isMatched = Object.keys(matches).includes(word);
              const isSelected = selectedWord === word;
              const isDragged = dragState.draggedItem === word;
              const matchedMeaning = matches[word];

              let resultClass = '';
              if (showResult && isMatched) {
                const isCorrect = correctMatches[word] === matchedMeaning;
                resultClass = isCorrect
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-red-500 bg-red-900/20';
              }

              return (
                <div
                  key={`word-${index}`}
                  ref={(el) => { wordsRef.current[index] = el; }}
                  draggable={!isCompleted && !showResult}
                  onDragStart={(e) => handleDragStart(e, word, 'word', index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, word, 'word')}
                  onClick={() => handleItemSelect(word, 'word')}
                  onDoubleClick={() => handleRemoveMatch(word)}
                  className={`
                    p-4 lg:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                    transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation
                    ${isDragged ? 'opacity-50 scale-95' : ''}
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-900/30 shadow-lg scale-[1.02]'
                        : ''
                    }
                    ${
                      isMatched && !isSelected
                        ? 'border-purple-500 bg-purple-900/20'
                        : ''
                    }
                    ${
                      !isMatched && !isSelected
                        ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                        : ''
                    }
                    ${resultClass}
                    ${showResult ? 'cursor-default' : ''}
                  `}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg lg:text-xl">
                        {word}
                      </p>
                      {isMatched && (
                        <p className="text-gray-400 text-sm mt-1">
                          ← {matchedMeaning}
                        </p>
                      )}
                    </div>

                    {/* Match Status */}
                    <div className="mr-3">
                      {showResult &&
                        isMatched &&
                        (correctMatches[word] === matchedMeaning ? (
                          <CheckCircle2 className="text-green-400" size={20} />
                        ) : (
                          <XCircle className="text-red-400" size={20} />
                        ))}
                      {!showResult && isMatched && (
                        <Link className="text-purple-400" size={20} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meanings Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xl text-center mb-6 flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">ب</span>
              </div>
              <span>المعاني</span>
            </h4>

            {meanings.map((meaning, index) => {
              const matchedWord = Object.keys(matches).find(
                (word) => matches[word] === meaning
              );
              const isMatched = !!matchedWord;
              const isDragOver =
                dragState.isDragging && dragState.dragType === 'word';

              let resultClass = '';
              if (showResult && isMatched && matchedWord) {
                const isCorrect = correctMatches[matchedWord] === meaning;
                resultClass = isCorrect
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-red-500 bg-red-900/20';
              }

              return (
                <div
                  key={`meaning-${index}`}
                  ref={(el) => { meaningsRef.current[index] = el; }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, meaning, 'meaning')}
                  onClick={() => handleItemSelect(meaning, 'meaning')}
                  className={`
                    p-4 lg:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                    transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation
                    ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-900/20 scale-[1.02]'
                        : ''
                    }
                    ${
                      isMatched
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                    }
                    ${resultClass}
                    ${showResult ? 'cursor-default' : ''}
                  `}
                  style={{
                    transitionDelay: `${index * 100 + 500}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg lg:text-xl">
                        {meaning}
                      </p>
                      {isMatched && matchedWord && (
                        <p className="text-gray-400 text-sm mt-1">
                          {matchedWord} →
                        </p>
                      )}
                    </div>

                    {/* Match Status */}
                    <div className="mr-3">
                      {showResult &&
                        isMatched &&
                        matchedWord &&
                        (correctMatches[matchedWord] === meaning ? (
                          <CheckCircle2 className="text-green-400" size={20} />
                        ) : (
                          <XCircle className="text-red-400" size={20} />
                        ))}
                      {!showResult && isMatched && (
                        <Link className="text-green-400" size={20} />
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
      </div>

      {/* Result Summary */}
      {showResult && (
        <div
          className={`
          mt-8 p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-700 delay-700
          ${
            allCorrect
              ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600/50'
              : 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-600/50'
          }
        `}
        >
          <div className="flex items-center space-x-4 mb-4">
            {allCorrect ? (
              <>
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-green-400 font-bold text-xl">
                    مطابقة مثالية! 🎉
                  </h4>
                  <p className="text-gray-400">جميع المطابقات صحيحة</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-orange-400 font-bold text-xl">
                    يمكنك التحسن
                  </h4>
                  <p className="text-gray-400">راجع المطابقات الصحيحة</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {
                  Object.keys(correctMatches).filter(
                    (word) => matches[word] === correctMatches[word]
                  ).length
                }
              </div>
              <div className="text-gray-400 text-sm">مطابقات صحيحة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {
                  Object.keys(matches).filter(
                    (word) => correctMatches[word] !== matches[word]
                  ).length
                }
              </div>
              <div className="text-gray-400 text-sm">مطابقات خاطئة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(
                  (Object.keys(correctMatches).filter(
                    (word) => matches[word] === correctMatches[word]
                  ).length /
                    totalCount) *
                    100
                )}
                %
              </div>
              <div className="text-gray-400 text-sm">النسبة المئوية</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {timeLeft !== undefined && timeLeft > 0 && !showResult && (
        <div className="mt-6">
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 15 ? 'bg-red-500' : 'bg-purple-500'
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
