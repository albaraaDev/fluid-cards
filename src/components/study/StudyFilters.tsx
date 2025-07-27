// src/components/study/StudyFilters.tsx
'use client';

import { DifficultyFilter, StudyFilters as StudyFiltersType } from '@/types/flashcard';
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  RotateCcw,
  Settings,
  Shuffle,
  TrendingDown,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface StudyFiltersProps {
  filters: StudyFiltersType;
  onFiltersChange: (filters: StudyFiltersType) => void;
  categories: string[];
  isOpen: boolean;
  onToggle: () => void;
  wordsCount: number;
  filteredCount: number;
}

const StudyFilters: React.FC<StudyFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  isOpen,
  onToggle,
  wordsCount,
  filteredCount
}) => {

  const [activeSection, setActiveSection] = useState<'categories' | 'difficulties' | 'options' | null>(null);

  // Reset all filters
  const resetFilters = () => {
    onFiltersChange({
      categories: [],
      difficulties: [],
      needsReview: false,
      masteredOnly: false,
      hardestFirst: false,
      randomOrder: false,
    });
  };

  // Toggle category
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  // Toggle difficulty
  const toggleDifficulty = (difficulty: DifficultyFilter) => {
    if (difficulty === 'all') return;
    
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  // Toggle option
  const toggleOption = (option: keyof Omit<StudyFiltersType, 'categories' | 'difficulties'>) => {
    onFiltersChange({ ...filters, [option]: !filters[option] });
  };

  // Count active filters
  const activeFiltersCount = 
    filters.categories.length + 
    filters.difficulties.length + 
    (filters.needsReview ? 1 : 0) + 
    (filters.masteredOnly ? 1 : 0) + 
    (filters.hardestFirst ? 1 : 0) + 
    (filters.randomOrder ? 1 : 0);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all 
          border touch-manipulation hover:scale-105 active:scale-95
          ${activeFiltersCount > 0 
            ? 'bg-blue-900/30 text-blue-400 border-blue-800/50 shadow-lg' 
            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
          }
        `}
      >
        <Filter size={18} />
        <span className="hidden sm:inline">فلترة</span>
        {activeFiltersCount > 0 && (
          <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {activeFiltersCount}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">فلترة الكلمات</h3>
          <div className="text-sm text-gray-400">
            ({filteredCount} من {wordsCount})
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors touch-manipulation"
            >
              <RotateCcw size={14} />
              <span>إعادة تعيين</span>
            </button>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-300 rounded-lg transition-colors touch-manipulation"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Options */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { 
            key: 'needsReview', 
            label: 'تحتاج مراجعة', 
            icon: Clock, 
            color: 'orange',
            active: filters.needsReview 
          },
          { 
            key: 'masteredOnly', 
            label: 'محفوظة فقط', 
            icon: CheckCircle, 
            color: 'green',
            active: filters.masteredOnly 
          },
          { 
            key: 'hardestFirst', 
            label: 'الأصعب أولاً', 
            icon: TrendingDown, 
            color: 'red',
            active: filters.hardestFirst 
          },
          { 
            key: 'randomOrder', 
            label: 'ترتيب عشوائي', 
            icon: Shuffle, 
            color: 'purple',
            active: filters.randomOrder 
          },
        ].map((option) => {
          const Icon = option.icon;
          const colorClasses = {
            orange: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
            green: 'bg-green-900/30 text-green-400 border-green-800/50',
            red: 'bg-red-900/30 text-red-400 border-red-800/50',
            purple: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
          };
          
          return (
            <button
              key={option.key}
              onClick={() => toggleOption(option.key as any)}
              className={`
                flex items-center space-x-2 p-3 rounded-xl border font-medium text-sm
                transition-all hover:scale-105 active:scale-95 touch-manipulation
                ${option.active 
                  ? colorClasses[option.color as keyof typeof colorClasses]
                  : 'bg-gray-700/50 text-gray-400 border-gray-600/50 hover:border-gray-600'
                }
              `}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Section */}
      <div className="space-y-3">
        <button
          onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-white font-medium">التصنيفات</h4>
          <div className="flex items-center space-x-2">
            {filters.categories.length > 0 && (
              <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {filters.categories.length}
              </div>
            )}
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${
                activeSection === 'categories' ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>

        {activeSection === 'categories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`
                  p-2 rounded-lg text-sm font-medium transition-all border
                  ${filters.categories.includes(category)
                    ? 'bg-blue-900/30 text-blue-400 border-blue-800/50'
                    : 'bg-gray-700/50 text-gray-400 border-gray-600/50 hover:border-gray-600'
                  }
                  touch-manipulation hover:scale-105 active:scale-95
                `}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Difficulties Section */}
      <div className="space-y-3">
        <button
          onClick={() => setActiveSection(activeSection === 'difficulties' ? null : 'difficulties')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-white font-medium">مستويات الصعوبة</h4>
          <div className="flex items-center space-x-2">
            {filters.difficulties.length > 0 && (
              <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {filters.difficulties.length}
              </div>
            )}
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${
                activeSection === 'difficulties' ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>

        {activeSection === 'difficulties' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'سهل', color: 'green', emoji: '🟢' },
              { value: 'متوسط', color: 'yellow', emoji: '🟡' },
              { value: 'صعب', color: 'red', emoji: '🔴' },
            ].map((difficulty) => {
              const colorClasses = {
                green: 'bg-green-900/30 text-green-400 border-green-800/50',
                yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
                red: 'bg-red-900/30 text-red-400 border-red-800/50',
              };

              return (
                <button
                  key={difficulty.value}
                  onClick={() => toggleDifficulty(difficulty.value as DifficultyFilter)}
                  className={`
                    flex items-center justify-center space-x-2 p-3 rounded-xl border font-medium
                    transition-all hover:scale-105 active:scale-95 touch-manipulation
                    ${filters.difficulties.includes(difficulty.value as DifficultyFilter)
                      ? colorClasses[difficulty.color as keyof typeof colorClasses]
                      : 'bg-gray-700/50 text-gray-400 border-gray-600/50 hover:border-gray-600'
                    }
                  `}
                >
                  <span>{difficulty.emoji}</span>
                  <span>{difficulty.value}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-400 font-semibold">
                {filteredCount} كلمة متطابقة
              </div>
              <div className="text-blue-300 text-sm">
                من أصل {wordsCount} كلمة
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-blue-400 text-2xl font-bold">
                {wordsCount > 0 ? Math.round((filteredCount / wordsCount) * 100) : 0}%
              </div>
              <div className="text-blue-300 text-xs">من المجموع</div>
            </div>
          </div>

          {filteredCount === 0 && (
            <div className="mt-3 pt-3 border-t border-blue-800/30">
              <p className="text-blue-300 text-sm">
                💡 جرب تقليل الفلاتر أو إعادة تعيينها للحصول على نتائج
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyFilters;