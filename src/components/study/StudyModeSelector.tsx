// src/components/study/StudyModeSelector.tsx
'use client';

import { StudyFilters, StudyMode } from '@/types/flashcard';
import {
  BookOpen,
  Brain,
  Flame,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import React from 'react';
import SessionPreview from './SessionPreview';

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onModeSelect: (mode: StudyMode) => void;
  onStartStudy: () => void;
  wordsCount: number;
  filteredWords: any[];
  filters: StudyFilters;
  className?: string;
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  onStartStudy,
  wordsCount,
  filteredWords,
  filters,
  className = '',
}) => {
  const studyModes = [
    {
      id: 'classic' as StudyMode,
      name: 'النمط الكلاسيكي',
      description: 'مراجعة تقليدية مع تقييم متدرج',
      icon: Brain,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-800/30',
      difficulty: 'سهل',
      time: '5-10 دقائق',
      emoji: '🧠',
    },
    {
      id: 'speed' as StudyMode,
      name: 'السرعة',
      description: 'مراجعة سريعة محدودة بالوقت',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-800/30',
      difficulty: 'متوسط',
      time: '3-5 دقائق',
      emoji: '⚡',
    },
    {
      id: 'reverse' as StudyMode,
      name: 'العكسي',
      description: 'من المعنى إلى الكلمة',
      icon: RotateCcw,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-800/30',
      difficulty: 'متوسط',
      time: '8-12 دقائق',
      emoji: '🔄',
    },
    {
      id: 'challenge' as StudyMode,
      name: 'التحدي',
      description: 'وضع مكثف مع عداد الإنجازات',
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-800/30',
      difficulty: 'صعب',
      time: '10-15 دقيقة',
      emoji: '🏆',
    },
    {
      id: 'reading' as StudyMode,
      name: 'القراءة السريعة',
      description: 'مراجعة سريعة للذاكرة البصرية',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-800/30',
      difficulty: 'سهل',
      time: '2-4 دقائق',
      emoji: '📚',
    },
  ];

  const selectedModeData = studyModes.find((mode) => mode.id === selectedMode);

  return (
    <div className={`max-w-7xl mx-auto space-y-6 lg:space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
          اختر نمط الدراسة
        </h2>
        <p className="text-gray-400 text-lg lg:text-xl">
          {wordsCount} كلمة جاهزة للمراجعة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Mode Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {studyModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => onModeSelect(mode.id)}
                  className={`
                    relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 
                    hover:scale-105 active:scale-95 touch-manipulation text-start
                    ${
                      isSelected
                        ? `${mode.borderColor} ${mode.bgColor} ring-2 ring-white/20`
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }
                  `}
                >
                  {/* Selection Indicator */}
                  {/* {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                  )} */}

                  <div className="flex justify-between items-center mb-4">
                    {/* Content */}
                    <div className="space-y-3">
                      <h3
                        className={`text-lg lg:text-xl font-bold ${
                          isSelected ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {mode.name}
                      </h3>

                      <p
                        className={`text-sm lg:text-base ${
                          isSelected ? 'text-gray-300' : 'text-gray-400'
                        }`}
                      >
                        {mode.description}
                      </p>
                    </div>
                    {/* Icon & Emoji */}
                    <div className="flex items-center">
                      <div
                        className={`
                      p-3 lg:p-4 rounded-xl lg:rounded-2xl 
                      ${isSelected ? mode.bgColor : 'bg-gray-700/50'}
                      ${isSelected ? mode.borderColor : 'border-gray-600/50'}
                      border
                    `}
                      >
                        <Icon
                          size={20}
                          className={`lg:w-6 lg:h-6 ${
                            isSelected ? 'text-white' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      {/* <span className="text-2xl lg:text-3xl">{mode.emoji}</span> */}
                    </div>
                  </div>
                  {/* Meta Info */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-4 text-xs lg:text-sm">
                      <div className="flex items-center space-x-1">
                        <Timer size={14} />
                        <span
                          className={
                            isSelected ? 'text-gray-300' : 'text-gray-500'
                          }
                        >
                          {mode.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span
                          className={`
                            ${
                              mode.difficulty === 'سهل'
                                ? 'text-green-400'
                                : mode.difficulty === 'متوسط'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }
                          `}
                        >
                          {mode.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Border Effect للمحدد */}
                  {isSelected && (
                    <div
                      className={`
                      absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-r ${mode.color} opacity-20 -z-10
                    `}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Mode Details */}
          {selectedModeData && (
            <div
              className={`
              ${selectedModeData.bgColor} rounded-2xl lg:rounded-3xl p-6 lg:p-8 
              border ${selectedModeData.borderColor}
            `}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl lg:text-4xl">
                    {selectedModeData.emoji}
                  </span>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                      {selectedModeData.name}
                    </h3>
                    <p className="text-gray-300 text-sm lg:text-base">
                      {selectedModeData.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm lg:text-base text-gray-400 mb-1">
                    الوقت المتوقع
                  </div>
                  <div className="text-lg lg:text-xl font-bold text-white">
                    {selectedModeData.time}
                  </div>
                </div>
              </div>

              {/* Mode-specific features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm lg:text-base">
                {selectedMode === 'classic' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-blue-400">✓</span>
                      <span>تقييم متدرج من 0-5</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-blue-400">✓</span>
                      <span>خوارزمية SM-2 الذكية</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-blue-400">✓</span>
                      <span>مناسب للمبتدئين</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-blue-400">✓</span>
                      <span>تتبع مفصل للتقدم</span>
                    </div>
                  </>
                )}

                {selectedMode === 'speed' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-yellow-400">⚡</span>
                      <span>مؤقت للكلمة الواحدة</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-yellow-400">⚡</span>
                      <span>مراجعة سريعة</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-yellow-400">⚡</span>
                      <span>يحسن سرعة التذكر</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-yellow-400">⚡</span>
                      <span>مثالي للمراجعة السريعة</span>
                    </div>
                  </>
                )}

                {selectedMode === 'reverse' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-green-400">🔄</span>
                      <span>يبدأ بالمعنى</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-green-400">🔄</span>
                      <span>يقوي الذاكرة النشطة</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-green-400">🔄</span>
                      <span>أصعب من النمط الكلاسيكي</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-green-400">🔄</span>
                      <span>يختبر الفهم العميق</span>
                    </div>
                  </>
                )}

                {selectedMode === 'challenge' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-purple-400">🏆</span>
                      <span>عداد الإنجازات المتتالية</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-purple-400">🏆</span>
                      <span>نقاط وشارات</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-purple-400">🏆</span>
                      <span>تحدي قوي للذات</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-purple-400">🏆</span>
                      <span>للمستخدمين المتقدمين</span>
                    </div>
                  </>
                )}

                {selectedMode === 'reading' && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-indigo-400">📚</span>
                      <span>عرض سريع للكلمات</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-indigo-400">📚</span>
                      <span>يقوي الذاكرة البصرية</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-indigo-400">📚</span>
                      <span>مثالي للمراجعة السريعة</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <span className="text-indigo-400">📚</span>
                      <span>لا يحتاج تفاعل كثير</span>
                    </div>
                  </>
                )}
              </div>

              {/* Start Button */}
              <button
                onClick={onStartStudy}
                disabled={wordsCount === 0}
                className={`
                  w-full flex items-center justify-center space-x-3 py-4 lg:py-6 rounded-2xl lg:rounded-3xl 
                  font-bold text-lg lg:text-xl transition-all hover:scale-105 active:scale-95 touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${
                    selectedModeData.color
                      ? `bg-gradient-to-r ${selectedModeData.color}`
                      : 'bg-blue-600'
                  } 
                  text-white shadow-lg hover:shadow-xl
                `}
              >
                <Flame size={24} />
                <span>ابدأ الدراسة الآن</span>
                <span className="text-sm opacity-80">({wordsCount} كلمة)</span>
              </button>
            </div>
          )}
        </div>

        {/* Session Preview */}
        <div className="lg:col-span-1">
          <SessionPreview
            words={filteredWords}
            mode={selectedMode}
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyModeSelector;
