// src/components/ModernWordCard.tsx
'use client';

import { Word } from '@/types/flashcard';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface ModernWordCardProps {
  word: Word;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export default function ModernWordCard({ 
  word, 
  onClick, 
  onEdit, 
  onDelete,
  compact = false 
}: ModernWordCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-500';
      case 'متوسط': return 'bg-yellow-500';
      case 'صعب': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isMastered = word.correctCount >= 3;

  return (
    <div className="relative">
      <div
        onClick={onClick}
        className={`
          bg-gray-800 rounded-2xl border border-gray-700 cursor-pointer
          transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-gray-600
          ${compact ? 'p-4' : 'p-6'}
          ${isMastered ? 'ring-2 ring-green-500/30 bg-green-900/10' : ''}
        `}
      >
        {/* Header with Difficulty Indicator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Difficulty Indicator */}
            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(word.difficulty)}`} />
            
            {/* Category */}
            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full font-medium">
              {word.category}
            </span>
            
            {/* Mastered Badge */}
            {isMastered && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">محفوظة</span>
              </div>
            )}
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute left-0 top-0 mt-1 w-36 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <Edit size={14} />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>حذف</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Word Content */}
        <div className="space-y-3">
          <h3 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'}`} dir='ltr'>
            {word.word}
          </h3>
          
          <p className={`text-gray-300 ${compact ? 'text-sm' : 'text-base'} line-clamp-1 leading-relaxed`}>
            {word.meaning}
          </p>
          
          {word.note && !compact && (
            <p className="text-gray-400 text-sm bg-gray-700/50 rounded-lg p-3 border border-gray-600 h-[66px] line-clamp-2" dir='ltr'>
              💡 {word.note}
            </p>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Success Count */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-400">{word.correctCount}</span>
            </div>
            
            {/* Failure Count */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs text-gray-400">{word.incorrectCount}</span>
            </div>
          </div>

          {/* Next Review */}
          <div className="text-xs text-gray-400">
            {word.nextReview <= Date.now() ? (
              <span className="text-orange-400 font-medium">للمراجعة</span>
            ) : (
              <span>
                {Math.ceil((word.nextReview - Date.now()) / (24 * 60 * 60 * 1000))} يوم
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}