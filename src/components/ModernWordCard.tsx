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
          bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer
          transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
          ${compact ? 'p-4' : 'p-6'}
          ${isMastered ? 'ring-2 ring-green-200 bg-green-50/30' : ''}
        `}
      >
        {/* Header with Difficulty Indicator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Difficulty Indicator */}
            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(word.difficulty)}`} />
            
            {/* Category */}
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
              {word.category}
            </span>
            
            {/* Mastered Badge */}
            {isMastered && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">محفوظة</span>
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
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          <h3 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {word.word}
          </h3>
          
          <p className={`text-gray-700 leading-relaxed ${compact ? 'text-sm' : 'text-base'}`}>
            {word.meaning}
          </p>
        </div>

        {/* Footer - Progress Indicator */}
        {!compact && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-medium">
                  ✓ {word.correctCount}
                </span>
                <span className="text-red-600 font-medium">
                  ✗ {word.incorrectCount}
                </span>
              </div>
              
              <div className="text-gray-500">
                {word.correctCount + word.incorrectCount > 0 
                  ? `${Math.round((word.correctCount / (word.correctCount + word.incorrectCount)) * 100)}%`
                  : 'جديدة'
                }
              </div>
            </div>
          </div>
        )}

        {/* Click Indicator */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}