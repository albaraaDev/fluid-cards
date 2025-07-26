// src/components/WordCard.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useState } from 'react';

interface WordCardProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (id: number) => void;
  onUpdateProgress: (id: number, correct: boolean) => void;
  isStudyMode?: boolean;
}

export default function WordCard({ 
  word, 
  onEdit, 
  onDelete, 
  onUpdateProgress,
  isStudyMode = false 
}: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-100 text-green-800 border-green-200';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'صعب': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRate = () => {
    const total = word.correctCount + word.incorrectCount;
    return total > 0 ? Math.round((word.correctCount / total) * 100) : 0;
  };

  const isMastered = word.correctCount >= 3;

  const handleCorrectAnswer = () => {
    onUpdateProgress(word.id, true);
    setIsFlipped(false);
  };

  const handleIncorrectAnswer = () => {
    onUpdateProgress(word.id, false);
    setIsFlipped(false);
  };

  if (isStudyMode) {
    return (
      <div className="relative w-full h-80 perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* الوجه الأمامي - الكلمة */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center text-white">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">{word.word}</h3>
              <p className="text-blue-100 mb-6">انقر لرؤية المعنى</p>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full bg-white/20 ${
                  word.difficulty === 'سهل' ? 'text-green-200' :
                  word.difficulty === 'متوسط' ? 'text-yellow-200' : 'text-red-200'
                }`}>
                  {word.difficulty}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {word.category}
                </span>
              </div>
            </div>
          </div>

          {/* الوجه الخلفي - المعنى */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="h-full flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{word.word}</h4>
                <p className="text-xl text-gray-900 mb-4 leading-relaxed">{word.meaning}</p>
                
                {word.note && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 italic">&qout;{word.note}&qout;</p>
                  </div>
                )}
              </div>

              {/* أزرار التقييم */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncorrectAnswer();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  صعب ❌
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCorrectAnswer();
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  سهل ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative">
      {/* شارة الإتقان */}
      {isMastered && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          ⭐ محفوظة
        </div>
      )}

      <div className="p-6">
        {/* رأس البطاقة */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{word.word}</h3>
            <p className="text-gray-700 leading-relaxed">{word.meaning}</p>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(word)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="تعديل"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* الملاحظة */}
        {word.note && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 italic">&qout;{word.note}&qout;</p>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(word.difficulty)}`}>
              {word.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold">
              {word.category}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">
              معدل النجاح: <span className="font-semibold text-gray-800">{getSuccessRate()}%</span>
            </div>
            <div className="text-xs text-gray-500">
              صحيح: {word.correctCount} | خطأ: {word.incorrectCount}
            </div>
          </div>
        </div>
      </div>

      {/* مؤكد الحذف */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="text-center p-6">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">حذف الكلمة؟</h4>
            <p className="text-gray-600 mb-4">هذا الإجراء لا يمكن التراجع عنه</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDelete(word.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}