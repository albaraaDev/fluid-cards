// src/components/search/EnhancedSearch.tsx - البحث المتقدم
'use client';

import { DifficultyFilter, Folder, Word } from '@/types/flashcard';
import {
  Hash,
  Search,
  Sliders,
  Tag,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface SearchFilters {
  query: string;
  folderIds: string[];
  difficulties: DifficultyFilter[];
  tags: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  masteredOnly: boolean;
  needsReviewOnly: boolean;
  includeSubfolders: boolean;
  searchIn: ('word' | 'meaning' | 'note')[];
}

interface EnhancedSearchProps {
  words: Word[];
  folders: Folder[];
  onSearchResults: (results: Word[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  initialQuery?: string;
  initialFolders?: string[];
  placeholder?: string;
  className?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  words,
  folders,
  onSearchResults,
  onFiltersChange,
  initialQuery = '',
  initialFolders = [],
  placeholder = 'البحث في الكلمات...',
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    folderIds: initialFolders,
    difficulties: [],
    tags: [],
    dateRange: {},
    masteredOnly: false,
    needsReviewOnly: false,
    includeSubfolders: true,
    searchIn: ['word', 'meaning', 'note'],
  });

  // استخراج جميع التاجات المتاحة
  const availableTags = useMemo(() => {
    const allTags = words.flatMap(word => word.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  }, [words]);

  // تطبيق الفلاتر والبحث
  const searchResults = useMemo(() => {
    let filtered = [...words];

    // فلترة حسب النص
    if (filters.query.trim()) {
      const searchTerm = filters.query.toLowerCase().trim();
      const searchTerms = searchTerm.split(/\s+/);
      
      filtered = filtered.filter(word => {
        const searchableText = [];
        
        if (filters.searchIn.includes('word')) {
          searchableText.push(word.word.toLowerCase());
        }
        if (filters.searchIn.includes('meaning')) {
          searchableText.push(word.meaning.toLowerCase());
        }
        if (filters.searchIn.includes('note') && word.note) {
          searchableText.push(word.note.toLowerCase());
        }
        
        const combinedText = searchableText.join(' ');
        
        // البحث بجميع الكلمات (AND)
        return searchTerms.every(term => combinedText.includes(term));
      });
    }

    // فلترة حسب المجلدات
    if (filters.folderIds.length > 0) {
      if (filters.includeSubfolders) {
        // جمع جميع المجلدات الفرعية
        const getAllSubfolderIds = (parentIds: string[]): string[] => {
          const subfolderIds = folders
            .filter(f => parentIds.includes(f.parentId || ''))
            .map(f => f.id);
          
          if (subfolderIds.length > 0) {
            return [...subfolderIds, ...getAllSubfolderIds(subfolderIds)];
          }
          return [];
        };

        const allFolderIds = [...filters.folderIds, ...getAllSubfolderIds(filters.folderIds)];
        filtered = filtered.filter(word => allFolderIds.includes(word.folderId));
      } else {
        filtered = filtered.filter(word => filters.folderIds.includes(word.folderId));
      }
    }

    // فلترة حسب الصعوبة
    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(word => 
        filters.difficulties.includes(word.difficulty as DifficultyFilter)
      );
    }

    // فلترة حسب التاجات
    if (filters.tags.length > 0) {
      filtered = filtered.filter(word => 
        word.tags && filters.tags.every(tag => word.tags!.includes(tag))
      );
    }

    // فلترة حسب التاريخ
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(word => {
        const wordDate = new Date(word.lastReviewed);
        const start = filters.dateRange.start;
        const end = filters.dateRange.end;
        
        if (start && wordDate < start) return false;
        if (end && wordDate > end) return false;
        return true;
      });
    }

    // فلترة حسب الحالة
    if (filters.masteredOnly) {
      filtered = filtered.filter(word => word.correctCount >= 3);
    }

    if (filters.needsReviewOnly) {
      filtered = filtered.filter(word => word.nextReview <= Date.now());
    }

    return filtered;
  }, [words, folders, filters]);

  // معالج تحديث الفلاتر
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  // تطبيق النتائج
  React.useEffect(() => {
    onSearchResults(searchResults);
  }, [searchResults, onSearchResults]);

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      folderIds: [],
      difficulties: [],
      tags: [],
      dateRange: {},
      masteredOnly: false,
      needsReviewOnly: false,
      includeSubfolders: true,
      searchIn: ['word', 'meaning', 'note'],
    };
    setFilters(defaultFilters);
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = 
    filters.folderIds.length +
    filters.difficulties.length +
    filters.tags.length +
    (filters.masteredOnly ? 1 : 0) +
    (filters.needsReviewOnly ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.searchIn.length !== 3 ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pr-12 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
        />
        
        {/* Advanced Search Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all
            ${showAdvanced 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-400 hover:text-gray-300 hover:bg-gray-600'
            }
          `}
          title="بحث متقدم"
        >
          <Sliders size={18} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {searchResults.length} من {words.length} نتيجة
        </span>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-6">
          
          {/* Search In */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              البحث في:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'word', label: 'الكلمة', icon: Hash },
                { id: 'meaning', label: 'المعنى', icon: Search },
                { id: 'note', label: 'الملاحظة', icon: Tag }
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = filters.searchIn.includes(option.id as any);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newSearchIn = isSelected
                        ? filters.searchIn.filter(s => s !== option.id)
                        : [...filters.searchIn, option.id as any];
                      updateFilters({ searchIn: newSearchIn });
                    }}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all
                      ${isSelected
                        ? 'bg-blue-900/30 text-blue-400 border-blue-800/50'
                        : 'bg-gray-700 text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Folders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                المجلدات:
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includeSubfolders}
                  onChange={(e) => updateFilters({ includeSubfolders: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-400">تضمين المجلدات الفرعية</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {folders.map((folder) => {
                const isSelected = filters.folderIds.includes(folder.id);
                
                return (
                  <label key={folder.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newFolderIds = e.target.checked
                          ? [...filters.folderIds, folder.id]
                          : filters.folderIds.filter(id => id !== folder.id);
                        updateFilters({ folderIds: newFolderIds });
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${folder.color}40` }}
                    >
                      {folder.icon}
                    </div>
                    
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {folder.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Difficulties */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              مستوى الصعوبة:
            </label>
            <div className="flex flex-wrap gap-2">
              {(['سهل', 'متوسط', 'صعب'] as const).map((difficulty) => {
                const isSelected = filters.difficulties.includes(difficulty);
                const colors = {
                  'سهل': 'text-green-400 border-green-400 bg-green-900/30',
                  'متوسط': 'text-yellow-400 border-yellow-400 bg-yellow-900/30',
                  'صعب': 'text-red-400 border-red-400 bg-red-900/30'
                };

                return (
                  <button
                    key={difficulty}
                    onClick={() => {
                      const newDifficulties = isSelected
                        ? filters.difficulties.filter(d => d !== difficulty)
                        : [...filters.difficulties, difficulty];
                      updateFilters({ difficulties: newDifficulties });
                    }}
                    className={`
                      px-4 py-2 rounded-xl border transition-all
                      ${isSelected
                        ? colors[difficulty]
                        : 'bg-gray-700 text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
                      }
                    `}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                التاجات:
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = isSelected
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        updateFilters({ tags: newTags });
                      }}
                      className={`
                        px-3 py-1 rounded-full border text-sm transition-all
                        ${isSelected
                          ? 'bg-purple-900/30 text-purple-400 border-purple-800/50'
                          : 'bg-gray-700 text-gray-400 border-gray-600 hover:text-gray-300 hover:border-gray-500'
                        }
                      `}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              حالة الكلمات:
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.masteredOnly}
                  onChange={(e) => updateFilters({ masteredOnly: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-300">الكلمات المحفوظة فقط</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.needsReviewOnly}
                  onChange={(e) => updateFilters({ needsReviewOnly: e.target.checked })}
                  className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">تحتاج مراجعة فقط</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              onClick={resetFilters}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              إعادة تعيين جميع الفلاتر
            </button>
            
            <button
              onClick={() => setShowAdvanced(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;