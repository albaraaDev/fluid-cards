// src/components/study/StudyModeSlider.tsx - النسخة المحسنة للأداء
'use client';

import { StudyFilters, StudyMode } from '@/types/flashcard';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Zap,
} from 'lucide-react';
import React, { useCallback, useMemo, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import SessionPreview from './SessionPreview';

interface StudyModeSliderProps {
  selectedMode: StudyMode;
  onModeSelect: (mode: StudyMode) => void;
  onStartStudy: () => void;
  wordsCount: number;
  filteredWords: any[];
  filters: StudyFilters;
  className?: string;
}

const StudyModeSlider: React.FC<StudyModeSliderProps> = ({
  selectedMode,
  onModeSelect,
  onStartStudy,
  wordsCount,
  filteredWords,
  filters,
  className = '',
}) => {
  const swiperRef = useRef<SwiperType>(null);

  // ⚡ Memoized أنماط الدراسة لتجنب إعادة الإنشاء في كل render
  const studyModes = useMemo(() => [
    {
      id: 'classic' as StudyMode,
      name: 'النمط الكلاسيكي',
      description: 'مراجعة تقليدية مع تقييم متدرج وخوارزمية SM-2 الذكية',
      icon: Brain,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-800/30',
      difficulty: 'سهل',
      time: '5-10 دقائق',
      emoji: '🧠',
      features: [
        'تقييم متدرج من 0-5',
        'خوارزمية SM-2 الذكية',
        'مناسب للمبتدئين',
        'تتبع مفصل للتقدم',
      ],
    },
    {
      id: 'speed' as StudyMode,
      name: 'السرعة',
      description: 'مراجعة سريعة محدودة بالوقت لتحسين سرعة التذكر',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-800/30',
      difficulty: 'متوسط',
      time: '3-5 دقائق',
      emoji: '⚡',
      features: [
        'مؤقت للكلمة الواحدة',
        'مراجعة سريعة',
        'يحسن سرعة التذكر',
        'مثالي للمراجعة السريعة',
      ],
    },
    {
      id: 'reverse' as StudyMode,
      name: 'العكسي',
      description: 'من المعنى إلى الكلمة لتقوية الذاكرة النشطة',
      icon: RotateCcw,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-800/30',
      difficulty: 'متوسط',
      time: '8-12 دقيقة',
      emoji: '🔄',
      features: [
        'يبدأ بالمعنى',
        'يقوي الذاكرة النشطة',
        'أصعب من النمط الكلاسيكي',
        'يختبر الفهم العميق',
      ],
    },
    {
      id: 'challenge' as StudyMode,
      name: 'التحدي',
      description: 'وضع مكثف مع عداد الإنجازات للمستخدمين المتقدمين',
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-800/30',
      difficulty: 'صعب',
      time: '10-15 دقيقة',
      emoji: '🏆',
      features: [
        'عداد الإنجازات المتتالية',
        'نقاط وشارات',
        'تحدي قوي للذات',
        'للمستخدمين المتقدمين',
      ],
    },
    {
      id: 'reading' as StudyMode,
      name: 'القراءة السريعة',
      description: 'مراجعة سريعة للذاكرة البصرية بدون تفاعل كثير',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-800/30',
      difficulty: 'سهل',
      time: '2-4 دقائق',
      emoji: '📚',
      features: [
        'عرض سريع للكلمات',
        'يقوي الذاكرة البصرية',
        'مثالي للمراجعة السريعة',
        'لا يحتاج تفاعل كثير',
      ],
    },
  ], []);

  // ⚡ Memoized البحث عن النمط المختار
  const selectedModeData = useMemo(() => 
    studyModes.find((mode) => mode.id === selectedMode), 
    [studyModes, selectedMode]
  );

  // ⚡ Memoized معالج تغيير الشريحة
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const activeIndex = swiper.activeIndex;
    if (studyModes[activeIndex]) {
      onModeSelect(studyModes[activeIndex].id);
    }
  }, [studyModes, onModeSelect]);

  // ⚡ Memoized الفهرس الابتدائي
  const initialSlide = useMemo(() => 
    studyModes.findIndex((mode) => mode.id === selectedMode), 
    [studyModes, selectedMode]
  );

  // ⚡ Memoized أزرار التنقل
  const navigationButtons = useMemo(() => ({
    prevButton: (
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center border border-gray-600 hover:border-gray-500 transition-all touch-manipulation"
        aria-label="النمط السابق"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
    ),
    nextButton: (
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-700/80 rounded-full flex items-center justify-center border border-gray-600 hover:border-gray-500 transition-all touch-manipulation"
        aria-label="النمط التالي"
      >
        <ChevronRight size={20} className="text-white" />
      </button>
    )
  }), []);

  // ⚡ Memoized تكوين Swiper
  const swiperConfig = useMemo(() => ({
    onBeforeInit: (swiper: SwiperType) => {
      swiperRef.current = swiper;
    },
    modules: [Pagination],
    spaceBetween: 24,
    slidesPerView: 1,
    initialSlide: initialSlide >= 0 ? initialSlide : 0,
    onSlideChange: handleSlideChange,
    pagination: {
      clickable: true,
      bulletClass: 'swiper-pagination-bullet !bg-gray-600 !opacity-50',
      bulletActiveClass: 'swiper-pagination-bullet-active !bg-purple-500 !opacity-100',
    },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: 1,
        spaceBetween: 32,
      },
    },
  }), [initialSlide, handleSlideChange]);

  return (
    <div className={`max-w-7xl mx-auto space-y-6 lg:space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
          اختر نمط الدراسة المناسب
        </h2>
        <p className="text-gray-400 text-lg">
          كل نمط مُصمم لتحسين جانب مختلف من التعلم
        </p>
      </div>

      <div className="md:grid gap-5 md:grid-cols-2">
        {/* Study Modes Slider */}
        <div className="relative">
          <Swiper
            {...swiperConfig}
            className="study-modes-swiper pb-12"
          >
            {studyModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;

              return (
                <SwiperSlide key={mode.id}>
                  <div
                    className={`
                      ${mode.bgColor} rounded-3xl p-6 lg:p-8 border-2 transition-all duration-300 cursor-pointer touch-manipulation h-full
                      ${
                        isSelected
                          ? `${mode.borderColor} shadow-2xl scale-105`
                          : 'border-gray-700 hover:border-gray-600'
                      }
                    `}
                    onClick={() => onModeSelect(mode.id)}
                  >
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`
                        w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${mode.color} rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg
                      `}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                          {mode.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${mode.difficulty === 'سهل' ? 'bg-green-600/20 text-green-400' :
                              mode.difficulty === 'متوسط' ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-red-600/20 text-red-400'}
                          `}>
                            {mode.difficulty}
                          </span>
                          <span className="text-gray-400">{mode.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-base lg:text-lg mb-6 leading-relaxed">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm lg:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-6 flex items-center justify-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          ✅ مختار حالياً
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Buttons */}
          {navigationButtons.prevButton}
          {navigationButtons.nextButton}
        </div>

        {/* Session Preview */}
        <div className="mt-6 md:mt-0">
          <SessionPreview
            selectedMode={selectedMode}
            wordsCount={wordsCount}
            filteredWords={filteredWords}
            filters={filters}
            onStartStudy={onStartStudy}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyModeSlider;