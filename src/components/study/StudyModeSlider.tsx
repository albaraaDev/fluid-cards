// src/components/study/StudyModeSlider.tsx
'use client';

import { StudyFilters, StudyMode } from '@/types/flashcard';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Flame,
  RotateCcw,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import React, { useRef } from 'react';
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
  const swiperRef = useRef<SwiperType>();

  const studyModes = [
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
  ];

  const selectedModeData = studyModes.find((mode) => mode.id === selectedMode);

  // Handle mode selection from swiper
  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.activeIndex;
    if (studyModes[activeIndex]) {
      onModeSelect(studyModes[activeIndex].id);
    }
  };

  // Get initial slide index
  const initialSlide = studyModes.findIndex((mode) => mode.id === selectedMode);

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
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            initialSlide={initialSlide >= 0 ? initialSlide : 0}
            // onSlideChange={handleSlideChange}
            centeredSlides={true}
            grabCursor={true}
            loop={false}
            speed={400}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-gray-600 !opacity-50',
              bulletActiveClass:
                'swiper-pagination-bullet-active !bg-blue-500 !opacity-100',
              modifierClass: 'swiper-pagination-',
            }}
            className="!p-4"
          >
            {studyModes.map((mode, index) => (
              <SwiperSlide key={mode.id}>
                <div
                  className={`
                  relative overflow-hidden rounded-3xl border-2 transition-all duration-500 cursor-pointer
                  transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation
                  ${
                    selectedMode === mode.id
                      ? `${mode.borderColor} bg-gradient-to-br ${mode.bgColor} shadow-2xl ring-2 ring-blue-500/30`
                      : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600/50 hover:bg-gray-800/60'
                  }
                `}
                  onClick={() => onModeSelect(mode.id)}
                >
                  {/* Background Gradient */}
                  {selectedMode === mode.id && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5`}
                    />
                  )}

                  <div className="relative p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`
                        w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center
                        ${
                          selectedMode === mode.id
                            ? `bg-gradient-to-br ${mode.color}`
                            : 'bg-gray-700/50'
                        }
                      `}
                        >
                          <mode.icon
                            size={selectedMode === mode.id ? 32 : 28}
                            className="text-white"
                          />
                        </div>
                        <div>
                          <h3
                            className={`
                          text-xl lg:text-2xl font-bold mb-2 transition-colors
                          ${
                            selectedMode === mode.id
                              ? 'text-white'
                              : 'text-gray-300'
                          }
                        `}
                          >
                            {mode.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm">
                            <span
                              className={`
                            px-3 py-1 rounded-full font-medium
                            ${
                              mode.difficulty === 'سهل'
                                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                                : mode.difficulty === 'متوسط'
                                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                                : 'bg-red-900/30 text-red-400 border border-red-800/50'
                            }
                          `}
                            >
                              {mode.difficulty}
                            </span>
                            <span className="flex items-center space-x-1 text-gray-400">
                              <Timer size={14} />
                              <span>{mode.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedMode === mode.id && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl">✓</span>
                        </div>
                      )}
                    </div>
                    {/* Description */}
                    <p
                      className={`
                    text-base lg:text-lg leading-relaxed mb-6 transition-colors h-14
                    ${
                      selectedMode === mode.id
                        ? 'text-gray-200'
                        : 'text-gray-400'
                    }
                  `}
                    >
                      {mode.description}
                    </p>
                    {/* Features */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span
                            className={`
                          ${
                            selectedMode === mode.id
                              ? mode.id === 'classic'
                                ? 'text-blue-400'
                                : mode.id === 'speed'
                                ? 'text-yellow-400'
                                : mode.id === 'reverse'
                                ? 'text-green-400'
                                : mode.id === 'challenge'
                                ? 'text-purple-400'
                                : 'text-indigo-400'
                              : 'text-gray-500'
                          }
                        `}
                          >
                            ✓
                          </span>
                          <span
                            className={`
                          text-sm lg:text-base transition-colors
                          ${
                            selectedMode === mode.id
                              ? 'text-gray-300'
                              : 'text-gray-500'
                          }
                        `}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Select Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartStudy();
                      }}
                      disabled={wordsCount === 0 || selectedMode !== mode.id}
                      className={`
                        w-full flex items-center justify-center space-x-3 py-4 lg:py-5 rounded-2xl 
                        font-bold text-lg transition-all hover:scale-105 active:scale-95 touch-manipulation
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        bg-gradient-to-r ${mode.color}  text-white shadow-lg hover:shadow-xl
                      `}
                    >
                      <Flame size={20} />
                      <span>ابدأ الدراسة</span>
                      <span className="text-sm opacity-80">
                        ({wordsCount} كلمة)
                      </span>
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Session Preview - Only show for selected mode */}
        {selectedModeData && (
          <div className=" max-md:px-4 md:pt-4">
            <SessionPreview
              words={filteredWords}
              mode={selectedMode}
              filters={filters}
            />
          </div>
        )}
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .swiper-pagination {
          position: relative !important;
          margin-top: 2rem !important;
        }

        .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          margin: 0 6px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }

        .swiper-pagination-bullet-active {
          width: 32px !important;
          border-radius: 6px !important;
        }

        @media (max-width: 640px) {
          .swiper-slide {
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudyModeSlider;
