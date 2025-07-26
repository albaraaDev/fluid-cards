// src/components/WordCard.tsx
'use client';

import { Word } from '@/types/flashcard';
import { CheckCircle, Edit, Trash2, XCircle } from 'lucide-react';
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
      case 'سهل': return 'bg-green-900/30 text-green-400 border-green-800/50';
      case 'متوسط': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50';
      case 'صعب': return 'bg-red-900/30 text-red-400 border-red-800/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
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
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center text-white">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">{word.word}</h3>
              <p className="text-blue-100 mb-6">انقر لرؤية المعنى</p>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full bg-white/20 ${
                  word.difficulty === 'سهل' ? 'text-green-200' :
                  word.difficulty === 'متوسط' ? 'text-yellow-200' :
                  'text-red-200'
                }`}>
                  {word.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-blue-200">
                  {word.category}
                </span>
              </div>
            </div>
          </div>

          {/* الوجه الخلفي - المعنى */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between border border-gray-700">
            <div className="text-center flex-1 flex flex-col justify-center">
              <h4 className="text-xl font-bold text-white mb-4">{word.word}</h4>
              <p className="text-lg text-gray-300 mb-4">{word.meaning}</p>
              
              {word.note && (
                <p className="text-sm text-gray-400 bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  💡 {word.note}
                </p>
              )}
            </div>

            {/* أزرار الإجابة */}
            <div className="grid grid-cols-2 gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleIncorrectAnswer}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                <XCircle size={18} />
                <span>صعب</span>
              </button>
              <button
                onClick={handleCorrectAnswer}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                <CheckCircle size={18} />
                <span>سهل</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{word.word}</h3>
          <p className="text-gray-300">{word.meaning}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(word)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
            title="تعديل"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* الملاحظة */}
      {word.note && (
        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 italic">"{word.note}"</p>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(word.difficulty)}`}>
            {word.difficulty}
          </span>
          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-lg text-xs font-semibold">
            {word.category}
          </span>
          {isMastered && (
            <span className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-lg text-xs font-semibold">
              محفوظة ✨
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400">
            {getSuccessRate()}% معدل النجاح
          </div>
          <div className="text-xs text-gray-500">
            {word.correctCount} صحيح • {word.incorrectCount} خطأ
          </div>
        </div>
      </div>

      {/* تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">تأكيد الحذف</h3>
            <p className="text-gray-400 mb-6">
              هل أنت متأكد من حذف كلمة "{word.word}"؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  onDelete(word.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}