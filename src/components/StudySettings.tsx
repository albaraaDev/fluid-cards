// src/components/StudySettings.tsx
'use client';

import { useApp } from '@/context/AppContext';
import { StudyFilters, StudyMode } from '@/types/flashcard';
import {
  Brain,
  Eye,
  Filter,
  RotateCcw,
  Settings,
  Shuffle,
  Target,
  Timer,
  TrendingDown,
  X,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';

interface StudySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStudy: (mode: StudyMode, filters: StudyFilters) => void;
  availableWordsCount: number;
}

const StudySettings: React.FC<StudySettingsProps> = ({ 
  isOpen, 
  onClose, 
  onStartStudy,
  availableWordsCount 
}) => {
  const { categories } = useApp();
  
  const [selectedMode, setSelectedMode] = useState<StudyMode>('classic');
  const [filters, setFilters] = useState<StudyFilters>({
    categories: [],
    difficulties: ['all'],
    needsReview: false,
    masteredOnly: false,
    hardestFirst: false,
    randomOrder: true,
  });

  // أنماط الدراسة المتاحة
  const studyModes = [
    {
      id: 'classic' as StudyMode,
      name: 'النمط الكلاسيكي',
      description: 'مراجعة تقليدية مع تقييم متدرج',
      icon: Brain,
      color: 'from-blue-500 to-purple-600',
      features: ['تقييم 0-5', 'خوارزمية SM-2', 'مناسب للمبتدئين'],
    },
    {
      id: 'speed' as StudyMode,
      name: 'التحدي السريع',
      description: 'مراجعة محدودة بالوقت لزيادة التركيز',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      features: ['5 ثواني لكل كلمة', 'تحفيز الاستجابة السريعة', 'مناسب للمتقدمين'],
    },
    {
      id: 'reverse' as StudyMode,
      name: 'المراجعة العكسية',
      description: 'من المعنى إلى الكلمة لتعزيز الفهم',
      icon: RotateCcw,
      color: 'from-green-500 to-teal-600',
      features: ['عرض المعنى أولاً', 'تخمين الكلمة', 'تحسين الاستيعاب'],
    },
    {
      id: 'challenge' as StudyMode,
      name: 'وضع التحدي',
      description: 'تجميع نقاط والحفاظ على streak',
      icon: Target,
      color: 'from-red-500 to-pink-600',
      features: ['نظام نقاط', 'streak counter', 'تحديات يومية'],
    },
    {
      id: 'reading' as StudyMode,
      name: 'القراءة السريعة',
      description: 'مرور سريع على الكلمات للمراجعة الخفيفة',
      icon: Eye,
      color: 'from-indigo-500 to-blue-600',
      features: ['عرض تلقائي', 'بدون تقييم', 'مراجعة سريعة'],
    },
  ];

  // معالج التغيير في الفلاتر
  const handleFilterChange = (key: keyof StudyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // معالج اختيار التصنيفات
  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // معالج اختيار الصعوبة
  const handleDifficultyToggle = (difficulty: string) => {
    setFilters(prev => {
      const newDifficulties = prev.difficulties.includes(difficulty as any)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties.filter(d => d !== 'all'), difficulty as any];
      
      return {
        ...prev,
        difficulties: newDifficulties.length === 0 ? ['all'] : newDifficulties
      };
    });
  };

  // حساب عدد الكلمات المفلترة (محاكاة)
  const getFilteredCount = () => {
    // هنا يمكن حساب العدد الفعلي بناءً على الفلاتر
    let count = availableWordsCount;
    if (filters.needsReview) count = Math.floor(count * 0.3);
    if (filters.masteredOnly) count = Math.floor(count * 0.6);
    if (filters.categories.length > 0) count = Math.floor(count * 0.8);
    return Math.max(1, count);
  };

  const handleStartStudy = () => {
    onStartStudy(selectedMode, filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-6 lg:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation"
          >
            <X size={24} />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-4">
              <Settings size={28} />
              <h2 className="text-2xl lg:text-3xl font-bold">إعداد جلسة الدراسة</h2>
            </div>
            <p className="text-blue-100 text-lg">
              اختر نمط الدراسة والفلاتر لتخصيص تجربة التعلم
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          
          {/* Study Modes */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">اختر نمط الدراسة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                
                return (
                  <div
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`
                      relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105 touch-manipulation
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-500/50' 
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }
                    `}
                  >
                    {/* Icon & Gradient */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center mb-4`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-lg font-bold text-white mb-2">{mode.name}</h4>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{mode.description}</p>
                    
                    {/* Features */}
                    <div className="space-y-1">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Filter className="text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-white">فلترة الكلمات</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Content Filters */}
              <div className="space-y-6">
                
                {/* Categories */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">التصنيفات</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all touch-manipulation
                          ${filters.categories.includes(category)
                            ? 'bg-blue-600 text-white ring-2 ring-blue-500/50'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }
                        `}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {filters.categories.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2">جميع التصنيفات محددة</p>
                  )}
                </div>

                {/* Difficulties */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">مستوى الصعوبة</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'سهل', color: 'bg-green-600', label: '🟢 سهل' },
                      { id: 'متوسط', color: 'bg-yellow-600', label: '🟡 متوسط' },
                      { id: 'صعب', color: 'bg-red-600', label: '🔴 صعب' },
                    ].map((diff) => (
                      <button
                        key={diff.id}
                        onClick={() => handleDifficultyToggle(diff.id)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all touch-manipulation
                          ${filters.difficulties.includes(diff.id as any)
                            ? `${diff.color} text-white ring-2 ring-white/50`
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }
                        `}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Behavior Filters */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-3">خيارات الدراسة</h4>
                
                {/* Toggle Options */}
                {[
                  {
                    key: 'needsReview' as keyof StudyFilters,
                    label: 'الكلمات التي تحتاج مراجعة فقط',
                    description: 'حسب جدولة SM-2',
                    icon: Timer,
                    color: 'text-orange-400',
                  },
                  {
                    key: 'masteredOnly' as keyof StudyFilters,
                    label: 'الكلمات المحفوظة فقط',
                    description: 'للمراجعة السريعة',
                    icon: Target,
                    color: 'text-green-400',
                  },
                  {
                    key: 'hardestFirst' as keyof StudyFilters,
                    label: 'الأصعب أولاً',
                    description: 'ترتيب حسب عامل السهولة',
                    icon: TrendingDown,
                    color: 'text-red-400',
                  },
                  {
                    key: 'randomOrder' as keyof StudyFilters,
                    label: 'ترتيب عشوائي',
                    description: 'خلط البطاقات',
                    icon: Shuffle,
                    color: 'text-purple-400',
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.key} className="flex items-start space-x-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={filters[option.key] as boolean}
                          onChange={(e) => handleFilterChange(option.key, e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon size={16} className={option.color} />
                          <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">ملخص الجلسة</h4>
              <div className="text-2xl font-bold text-blue-400">
                {getFilteredCount()} كلمة
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-gray-400 mb-1">النمط</div>
                <div className="text-white font-semibold">
                  {studyModes.find(m => m.id === selectedMode)?.name}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">التصنيفات</div>
                <div className="text-white font-semibold">
                  {filters.categories.length || 'الكل'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">الصعوبة</div>
                <div className="text-white font-semibold">
                  {filters.difficulties.includes('all') ? 'الكل' : filters.difficulties.length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">الترتيب</div>
                <div className="text-white font-semibold">
                  {filters.randomOrder ? 'عشوائي' : filters.hardestFirst ? 'صعب أولاً' : 'عادي'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-8 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              💡 يمكنك تغيير الإعدادات في أي وقت أثناء الدراسة
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-2xl font-semibold transition-all touch-manipulation"
              >
                إلغاء
              </button>
              
              <button
                onClick={handleStartStudy}
                disabled={getFilteredCount() === 0}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-2xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
              >
                🚀 ابدأ الدراسة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySettings;