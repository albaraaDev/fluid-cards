// src/components/study/StudyFilters.tsx - تحديث لدعم المجلدات
'use client';

import { DifficultyFilter, StudyFilters as StudyFiltersType } from '@/types/flashcard';
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  FolderOpen,
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
  folders: any[]; // 🔄 تغيير من categories إلى folders
  isOpen: boolean;
  onToggle: () => void;
  wordsCount: number;
  filteredCount: number;
}

const StudyFilters: React.FC<StudyFiltersProps> = ({
  filters,
  onFiltersChange,
  folders,
  isOpen,
  onToggle,
  wordsCount,
  filteredCount
}) => {

  const [activeSection, setActiveSection] = useState<'folders' | 'difficulties' | 'options' | null>(null);

  // Reset all filters
  const resetFilters = () => {
    onFiltersChange({
      folderIds: [], // 🔄 تغيير من categories إلى folderIds
      difficulties: [],
      needsReview: false,
      masteredOnly: false,
      hardestFirst: false,
      randomOrder: false,
      includeSubfolders: false, // 🆕 خيار المجلدات الفرعية
      tags: [], // 🆕 فلترة بالتاجات
    });
  };

  // Toggle folder
  const toggleFolder = (folderId: string) => {
    const currentFolderIds = filters.folderIds || [];
    const newFolderIds = currentFolderIds.includes(folderId)
      ? currentFolderIds.filter(id => id !== folderId)
      : [...currentFolderIds, folderId];
    
    onFiltersChange({ ...filters, folderIds: newFolderIds });
  };

  // Toggle difficulty
  const toggleDifficulty = (difficulty: DifficultyFilter) => {
    if (difficulty === 'all') return;
    
    const currentDifficulties = filters.difficulties || [];
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty];
    
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  // Toggle option
  const toggleOption = (option: keyof Omit<StudyFiltersType, 'folderIds' | 'difficulties' | 'tags'>) => {
    onFiltersChange({ ...filters, [option]: !filters[option] });
  };

  // Count active filters
  const activeFiltersCount = 
    (filters.folderIds?.length || 0) + 
    (filters.difficulties?.length || 0) + 
    (filters.needsReview ? 1 : 0) + 
    (filters.masteredOnly ? 1 : 0) + 
    (filters.hardestFirst ? 1 : 0) + 
    (filters.randomOrder ? 1 : 0) +
    (filters.includeSubfolders ? 1 : 0) +
    (filters.tags?.length || 0);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`
          flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all 
          border touch-manipulation hover:scale-105 active:scale-95
          ${activeFiltersCount > 0 
            ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' 
            : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-300 hover:border-gray-600'
          }
        `}
      >
        <Filter size={18} />
        <span>فلترة</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px]">
            {activeFiltersCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Filter size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">فلاتر الدراسة</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-orange-400 hover:text-orange-300 transition-colors text-sm"
          >
            <RotateCcw size={16} />
            <span>إعادة تعيين</span>
          </button>
          
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filters Count */}
      <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            إجمالي الكلمات: <span className="text-white font-medium">{wordsCount}</span>
          </span>
          <span className="text-gray-400">
            بعد الفلترة: <span className="text-blue-400 font-medium">{filteredCount}</span>
          </span>
        </div>
      </div>

      {/* Filters Content */}
      <div className="p-4 space-y-6">
        
        {/* المجلدات */}
        <div>
          <button
            onClick={() => setActiveSection(activeSection === 'folders' ? null : 'folders')}
            className="flex items-center justify-between w-full text-right mb-3"
          >
            <div className="flex items-center space-x-2">
              <FolderOpen size={18} className="text-purple-400" />
              <span className="font-medium text-white">المجلدات</span>
              {filters.folderIds && filters.folderIds.length > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {filters.folderIds.length}
                </span>
              )}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${
                activeSection === 'folders' ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {activeSection === 'folders' && (
            <div className="space-y-3 pr-4">
              {/* خيار المجلدات الفرعية */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includeSubfolders || false}
                  onChange={() => toggleOption('includeSubfolders')}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">تضمين المجلدات الفرعية</span>
              </label>
              
              {/* قائمة المجلدات */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {folders.map((folder) => (
                  <label key={folder.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.folderIds?.includes(folder.id) || false}
                      onChange={() => toggleFolder(folder.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${folder.color}40` }}
                    >
                      {folder.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                        {folder.name}
                      </span>
                      {folder.wordCount > 0 && (
                        <span className="text-xs text-gray-500 mr-2">
                          ({folder.wordCount} كلمة)
                        </span>
                      )}
                    </div>
                    
                    {folder.isDefault && (
                      <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full">
                        افتراضي
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* مستويات الصعوبة */}
        <div>
          <button
            onClick={() => setActiveSection(activeSection === 'difficulties' ? null : 'difficulties')}
            className="flex items-center justify-between w-full text-right mb-3"
          >
            <div className="flex items-center space-x-2">
              <TrendingDown size={18} className="text-yellow-400" />
              <span className="font-medium text-white">مستوى الصعوبة</span>
              {filters.difficulties && filters.difficulties.length > 0 && (
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  {filters.difficulties.length}
                </span>
              )}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${
                activeSection === 'difficulties' ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {activeSection === 'difficulties' && (
            <div className="space-y-2 pr-4">
              {(['سهل', 'متوسط', 'صعب'] as const).map((difficulty) => {
                const colors = {
                  'سهل': 'text-green-400 border-green-400',
                  'متوسط': 'text-yellow-400 border-yellow-400',
                  'صعب': 'text-red-400 border-red-400'
                };

                return (
                  <label key={difficulty} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.difficulties?.includes(difficulty) || false}
                      onChange={() => toggleDifficulty(difficulty)}
                      className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <span className={`text-sm px-3 py-1 rounded-full border transition-colors ${colors[difficulty]}`}>
                      {difficulty}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* خيارات إضافية */}
        <div>
          <button
            onClick={() => setActiveSection(activeSection === 'options' ? null : 'options')}
            className="flex items-center justify-between w-full text-right mb-3"
          >
            <div className="flex items-center space-x-2">
              <Settings size={18} className="text-green-400" />
              <span className="font-medium text-white">خيارات إضافية</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${
                activeSection === 'options' ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {activeSection === 'options' && (
            <div className="space-y-3 pr-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.needsReview}
                  onChange={() => toggleOption('needsReview')}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <Clock size={16} className="text-orange-400" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  الكلمات التي تحتاج مراجعة فقط
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.masteredOnly}
                  onChange={() => toggleOption('masteredOnly')}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  الكلمات المحفوظة فقط
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.hardestFirst}
                  onChange={() => toggleOption('hardestFirst')}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <TrendingDown size={16} className="text-red-400" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  الأصعب أولاً
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.randomOrder}
                  onChange={() => toggleOption('randomOrder')}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <Shuffle size={16} className="text-purple-400" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  ترتيب عشوائي
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 bg-gray-700/50 border-t border-gray-700">
        <span className="text-sm text-gray-400">
          {filteredCount} من {wordsCount} كلمة
        </span>
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
        >
          تطبيق الفلاتر
        </button>
      </div>
    </div>
  );
};

export default StudyFilters;