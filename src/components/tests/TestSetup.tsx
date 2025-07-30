// src/components/tests/TestSetup.tsx
'use client';

import {
  DifficultyFilter,
  TestSettings,
  TestType,
  Word,
} from '@/types/flashcard';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  HelpCircle,
  Link,
  PenTool,
  PlayCircle,
  Settings,
  Shuffle,
  SkipForward,
  Target,
  Timer,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface TestSetupProps {
  onStartTest: (settings: TestSettings) => void;
  onCancel: () => void;
  availableWords: Word[];
  categories: string[];
}

type SetupStep = 'type' | 'settings' | 'words' | 'options' | 'preview';

export default function TestSetup({
  onStartTest,
  onCancel,
  availableWords,
  categories,
}: TestSetupProps) {
  // ==========================================
  // State Management
  // ==========================================
  const [currentStep, setCurrentStep] = useState<SetupStep>('type');
  const [settings, setSettings] = useState<TestSettings>({
    type: 'multiple_choice', // تغيير: من 'mixed' إلى 'multiple_choice' كافتراضي
    timeLimit: 300,
    questionTimeLimit: 30,
    questionCount: 10,
    categories: [],
    difficulties: ['all'],
    randomOrder: true,
    showCorrectAnswer: true,
    instantFeedback: false,
    allowSkip: true,
  });

  useEffect(() => {
    console.log('🎯 TestSetup: Current settings type:', settings.type);
  }, [settings.type]);

  // ==========================================
  // Test Types Configuration
  // ==========================================
  const testTypes = [
    {
      type: 'multiple_choice' as TestType,
      title: 'اختيار متعدد',
      description: 'اختر الإجابة الصحيحة من 4 خيارات',
      icon: CheckCircle2,
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-600/50',
      textColor: 'text-blue-400',
      difficulty: 'متوسط',
      timePerQuestion: 20,
    },
    {
      type: 'typing' as TestType,
      title: 'كتابة الإجابة',
      description: 'اكتب الإجابة الصحيحة بنفسك',
      icon: PenTool,
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-600/50',
      textColor: 'text-green-400',
      difficulty: 'صعب',
      timePerQuestion: 45,
    },
    {
      type: 'matching' as TestType,
      title: 'مطابقة',
      description: 'اربط بين الكلمات ومعانيها',
      icon: Link,
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-600/50',
      textColor: 'text-purple-400',
      difficulty: 'متوسط',
      timePerQuestion: 60,
    },
    {
      type: 'true_false' as TestType,
      title: 'صح أم خطأ',
      description: 'حدد ما إذا كانت الجملة صحيحة أم خاطئة',
      icon: HelpCircle,
      color: 'from-orange-600 to-orange-800',
      borderColor: 'border-orange-600/50',
      textColor: 'text-orange-400',
      difficulty: 'سهل',
      timePerQuestion: 15,
    },
    {
      type: 'mixed' as TestType,
      title: 'مختلط',
      description: 'مزيج من جميع أنواع الأسئلة',
      icon: Shuffle,
      color: 'from-pink-600 to-pink-800',
      borderColor: 'border-pink-600/50',
      textColor: 'text-pink-400',
      difficulty: 'متقدم',
      timePerQuestion: 35,
    },
  ];

  // ==========================================
  // Computed Properties
  // ==========================================
  const filteredWords = useMemo(() => {
    return availableWords.filter((word) => {
      const categoryMatch =
        settings.categories.length === 0 ||
        settings.categories.includes(word.category);

      const difficultyMatch =
        settings.difficulties.includes('all') ||
        settings.difficulties.includes(word.difficulty as DifficultyFilter);

      return categoryMatch && difficultyMatch;
    });
  }, [availableWords, settings.categories, settings.difficulties]);

  const estimatedTime = useMemo(() => {
    const selectedType = testTypes.find((t) => t.type === settings.type);
    const timePerQuestion = selectedType?.timePerQuestion || 30;
    return Math.ceil((settings.questionCount * timePerQuestion) / 60); // في الدقائق
  }, [settings.type, settings.questionCount]);

  const canStartTest = useMemo(() => {
    return (
      filteredWords.length >= settings.questionCount &&
      settings.questionCount > 0
    );
  }, [filteredWords.length, settings.questionCount]);

  // ==========================================
  // Event Handlers
  // ==========================================
  const handleStartTest = () => {
    console.log('🚀 TestSetup: Starting test with final settings:', settings);
    
    if (canStartTest) {
      // التأكد من أن النوع محدد بشكل صحيح
      if (!settings.type || settings.type === '') {
        console.error('❌ TestSetup: Test type is not set');
        alert('يرجى اختيار نوع الاختبار');
        return;
      }
      
      console.log('✅ TestSetup: All validations passed, creating test');
      onStartTest(settings);
    } else {
      console.error('❌ TestSetup: Cannot start test - validation failed');
      alert('تأكد من وجود كلمات كافية للاختبار');
    }
  };

  const updateSettings = (updates: Partial<TestSettings>) => {
    console.log('🔄 TestSetup: Updating settings with:', updates);

    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      console.log('✅ TestSetup: New settings:', newSettings);
      return newSettings;
    });
  };

  // ==========================================
  // Step Navigation
  // ==========================================
  const steps = [
    { id: 'type', title: 'نوع الاختبار', icon: Target },
    { id: 'settings', title: 'الإعدادات', icon: Settings },
    { id: 'words', title: 'الكلمات', icon: BookOpen },
    { id: 'options', title: 'خيارات إضافية', icon: Zap },
    { id: 'preview', title: 'معاينة', icon: Eye },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const nextStep = () => {
    console.log('➡️ TestSetup: Moving to next step. Current type:', settings.type);
    
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex].id as SetupStep);
  };

  const prevStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex].id as SetupStep);
  };

  // ==========================================
  // Step Components
  // ==========================================

  // 3.2.1 اختيار نوع الاختبار
  const renderTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">اختر نوع الاختبار</h2>
        <p className="text-gray-400 text-lg">كل نوع له طريقة مختلفة لاختبار معرفتك</p>
        
        {/* Debug info - سيختفي في production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-sm text-gray-400">
            النوع المحدد حالياً: {settings.type}
          </div>
        )}
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {testTypes.map((testType) => {
          const Icon = testType.icon;
          const isSelected = settings.type === testType.type;
          
          return (
            <button
              key={testType.type}
              onClick={() => {
                console.log('👆 TestSetup: Clicked on type:', testType.type);
                updateSettings({ type: testType.type });
              }}
              className={`
                relative p-6 lg:p-8 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 text-right
                hover:scale-[1.02] active:scale-[0.98] touch-manipulation
                ${isSelected 
                  ? `bg-gradient-to-br ${testType.color} ${testType.borderColor} shadow-2xl` 
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-gray-900" />
                  </div>
                </div>
              )}
  
              {/* Icon */}
              <div className={`mb-4 ${isSelected ? 'text-white' : testType.textColor}`}>
                <Icon size={32} className="lg:w-10 lg:h-10" />
              </div>
  
              {/* Content */}
              <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {testType.title}
              </h3>
              <p className={`text-sm lg:text-base mb-4 ${isSelected ? 'text-gray-100' : 'text-gray-400'}`}>
                {testType.description}
              </p>
  
              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs lg:text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {testType.difficulty}
                </span>
                <span className={`flex items-center space-x-1 ${isSelected ? 'text-gray-100' : 'text-gray-400'}`}>
                  <Clock size={14} />
                  <span>{testType.timePerQuestion}ث/سؤال</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
  
      {/* Additional Info for Selected Type */}
      <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-3">معلومات إضافية:</h3>
        {settings.type === 'multiple_choice' && (
          <p className="text-gray-300">
            ستواجه أسئلة مع 4 خيارات، واحد منها صحيح. هذا النوع مناسب للمبتدئين ولقياس المعرفة الأساسية.
          </p>
        )}
        {settings.type === 'typing' && (
          <p className="text-gray-300">
            ستحتاج لكتابة الإجابة بنفسك. هذا النوع أكثر صعوبة ويقيس مدى حفظك الدقيق للكلمات.
          </p>
        )}
        {settings.type === 'matching' && (
          <p className="text-gray-300">
            ستربط بين الكلمات ومعانيها عن طريق السحب والإفلات أو النقر. مناسب لتعلم مجموعات من الكلمات.
          </p>
        )}
        {settings.type === 'true_false' && (
          <p className="text-gray-300">
            ستحدد ما إذا كانت جملة معينة صحيحة أم خاطئة. هذا النوع سريع ومناسب للمراجعة السريعة.
          </p>
        )}
        {settings.type === 'mixed' && (
          <p className="text-gray-300">
            ستواجه مزيج من جميع أنواع الأسئلة. هذا يوفر تجربة متنوعة ويختبر معرفتك بطرق مختلفة.
          </p>
        )}
      </div>
    </div>
  );

  // 3.2.2 إعدادات الوقت والأسئلة
  const renderSettingsStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
          إعدادات الاختبار
        </h2>
        <p className="text-gray-400 text-lg">حدد عدد الأسئلة والوقت المخصص</p>
      </div>

      {/* عدد الأسئلة */}
      <div className="bg-gray-800/50 rounded-2xl p-6 lg:p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">عدد الأسئلة</h3>
            <p className="text-gray-400">
              من {Math.min(5, filteredWords.length)} إلى{' '}
              {Math.min(50, filteredWords.length)} سؤال
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {settings.questionCount}
          </div>
        </div>

        <input
          type="range"
          min={Math.min(5, filteredWords.length)}
          max={Math.min(50, filteredWords.length)}
          value={settings.questionCount}
          onChange={(e) =>
            updateSettings({ questionCount: parseInt(e.target.value) })
          }
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />

        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>أقل</span>
          <span>أكثر</span>
        </div>
      </div>

      {/* إعدادات الوقت */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الوقت الإجمالي */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Timer className="text-green-400" size={24} />
            <h3 className="text-lg font-bold text-white">الوقت الإجمالي</h3>
          </div>

          <div className="space-y-4">
            <div className="text-2xl font-bold text-green-400">
              {Math.floor((settings.timeLimit || 0) / 60)}:
              {String((settings.timeLimit || 0) % 60).padStart(2, '0')}
            </div>

            <input
              type="range"
              min={60}
              max={1800}
              step={30}
              value={settings.timeLimit || 300}
              onChange={(e) =>
                updateSettings({ timeLimit: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between text-xs text-gray-400">
              <span>1 دقيقة</span>
              <span>30 دقيقة</span>
            </div>
          </div>
        </div>

        {/* وقت السؤال الواحد */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-orange-400" size={24} />
            <h3 className="text-lg font-bold text-white">وقت كل سؤال</h3>
          </div>

          <div className="space-y-4">
            <div className="text-2xl font-bold text-orange-400">
              {settings.questionTimeLimit}ث
            </div>

            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={settings.questionTimeLimit || 30}
              onChange={(e) =>
                updateSettings({ questionTimeLimit: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between text-xs text-gray-400">
              <span>10ث</span>
              <span>2 دقيقة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3.2.3 اختيار الكلمات
  const renderWordsStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
          اختيار الكلمات
        </h2>
        <p className="text-gray-400 text-lg">حدد الفئات والصعوبة للاختبار</p>
      </div>

      {/* الفئات */}
      <div className="bg-gray-800/50 rounded-2xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <Filter className="text-purple-400" size={24} />
          <span>الفئات</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => updateSettings({ categories: [] })}
            className={`p-3 rounded-xl border transition-all touch-manipulation ${
              settings.categories.length === 0
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            جميع الفئات
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                const isSelected = settings.categories.includes(category);
                const newCategories = isSelected
                  ? settings.categories.filter((c) => c !== category)
                  : [...settings.categories, category];
                updateSettings({ categories: newCategories });
              }}
              className={`p-3 rounded-xl border transition-all touch-manipulation ${
                settings.categories.includes(category)
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* الصعوبة */}
      <div className="bg-gray-800/50 rounded-2xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
          <TrendingUp className="text-yellow-400" size={24} />
          <span>مستوى الصعوبة</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { value: 'all', label: 'جميع المستويات', color: 'bg-gray-600' },
            { value: 'سهل', label: 'سهل', color: 'bg-green-600' },
            { value: 'متوسط', label: 'متوسط', color: 'bg-yellow-600' },
            { value: 'صعب', label: 'صعب', color: 'bg-red-600' },
          ].map((diff) => (
            <button
              key={diff.value}
              onClick={() => {
                const isSelected = settings.difficulties.includes(
                  diff.value as DifficultyFilter
                );
                let newDifficulties: DifficultyFilter[];

                if (diff.value === 'all') {
                  newDifficulties = ['all'];
                } else {
                  newDifficulties = isSelected
                    ? settings.difficulties.filter(
                        (d) => d !== diff.value && d !== 'all'
                      )
                    : [
                        ...settings.difficulties.filter((d) => d !== 'all'),
                        diff.value as DifficultyFilter,
                      ];

                  if (newDifficulties.length === 0) {
                    newDifficulties = ['all'];
                  }
                }

                updateSettings({ difficulties: newDifficulties });
              }}
              className={`p-3 rounded-xl border transition-all touch-manipulation ${
                settings.difficulties.includes(diff.value as DifficultyFilter)
                  ? `${diff.color} border-opacity-50 text-white`
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* معلومات الكلمات المتاحة */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-800/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">
              الكلمات المتاحة
            </h4>
            <p className="text-gray-400">حسب الفلترة الحالية</p>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {filteredWords.length}
          </div>
        </div>
      </div>
    </div>
  );

  // 3.2.4 خيارات إضافية
  const renderOptionsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
          خيارات إضافية
        </h2>
        <p className="text-gray-400 text-lg">خصص تجربة الاختبار حسب تفضيلاتك</p>
      </div>

      <div className="space-y-4">
        {[
          {
            key: 'randomOrder',
            title: 'ترتيب عشوائي',
            description: 'خلط ترتيب الأسئلة والخيارات',
            icon: Shuffle,
            color: 'text-purple-400',
          },
          {
            key: 'showCorrectAnswer',
            title: 'إظهار الإجابة الصحيحة',
            description: 'عرض الإجابة الصحيحة بعد كل سؤال',
            icon: Eye,
            color: 'text-green-400',
          },
          {
            key: 'instantFeedback',
            title: 'تغذية راجعة فورية',
            description: 'إظهار النتيجة فوراً بعد كل إجابة',
            icon: Zap,
            color: 'text-yellow-400',
          },
          {
            key: 'allowSkip',
            title: 'السماح بالتخطي',
            description: 'إمكانية تخطي الأسئلة الصعبة',
            icon: SkipForward,
            color: 'text-blue-400',
          },
        ].map((option) => {
          const Icon = option.icon;
          const isEnabled = settings[
            option.key as keyof TestSettings
          ] as boolean;

          return (
            <div
              key={option.key}
              className={`bg-gray-800/50 rounded-2xl p-6 border transition-all ${
                isEnabled ? 'border-gray-600 bg-gray-800/70' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl bg-gray-700/50 ${option.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {option.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => updateSettings({ [option.key]: !isEnabled })}
                  className={`relative w-14 h-8 rounded-full transition-all touch-manipulation ${
                    isEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                      isEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 3.2.5 معاينة الاختبار
  const renderPreviewStep = () => {
    const selectedType = testTypes.find((t) => t.type === settings.type);

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            معاينة الاختبار
          </h2>
          <p className="text-gray-400 text-lg">تأكد من إعداداتك قبل البدء</p>
        </div>

        {/* ملخص الاختبار */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-8 border border-blue-800/30">
          <div className="flex items-center space-x-4 mb-6">
            {selectedType && (
              <selectedType.icon size={32} className="text-blue-400" />
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {selectedType?.title}
              </h3>
              <p className="text-gray-400">{selectedType?.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {settings.questionCount}
              </div>
              <div className="text-gray-400 text-sm">سؤال</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {estimatedTime}
              </div>
              <div className="text-gray-400 text-sm">دقيقة تقريباً</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {filteredWords.length}
              </div>
              <div className="text-gray-400 text-sm">كلمة متاحة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {settings.questionTimeLimit}ث
              </div>
              <div className="text-gray-400 text-sm">لكل سؤال</div>
            </div>
          </div>
        </div>

        {/* تفاصيل الإعدادات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الفئات والصعوبة */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">نطاق الكلمات</h4>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">الفئات: </span>
                <span className="text-white">
                  {settings.categories.length === 0
                    ? 'جميع الفئات'
                    : settings.categories.join('، ')}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">الصعوبة: </span>
                <span className="text-white">
                  {settings.difficulties.includes('all')
                    ? 'جميع المستويات'
                    : settings.difficulties.join('، ')}
                </span>
              </div>
            </div>
          </div>

          {/* الخيارات المفعلة */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">
              الخيارات المفعلة
            </h4>
            <div className="space-y-2">
              {settings.randomOrder && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 size={16} />
                  <span>ترتيب عشوائي</span>
                </div>
              )}
              {settings.showCorrectAnswer && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 size={16} />
                  <span>إظهار الإجابة الصحيحة</span>
                </div>
              )}
              {settings.instantFeedback && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 size={16} />
                  <span>تغذية راجعة فورية</span>
                </div>
              )}
              {settings.allowSkip && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 size={16} />
                  <span>السماح بالتخطي</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* تحذيرات */}
        {!canStartTest && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <X className="text-red-400" size={24} />
              <div>
                <h4 className="text-red-400 font-bold mb-1">
                  لا يمكن بدء الاختبار
                </h4>
                <p className="text-gray-400 text-sm">
                  عدد الكلمات المتاحة ({filteredWords.length}) أقل من عدد
                  الأسئلة المطلوبة ({settings.questionCount})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header مع التقدم */}
        <div className="p-6 lg:p-8 border-b border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              إعداد اختبار جديد
            </h1>
            <button
              onClick={onCancel}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all touch-manipulation"
            >
              <X size={24} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center space-x-2 ${
                      index < steps.length - 1 ? 'flex-1' : ''
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : isCompleted
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span
                      className={`hidden lg:block text-sm font-medium ${
                        isActive
                          ? 'text-white'
                          : isCompleted
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden lg:block w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 overflow-y-auto max-h-[60vh]">
          {currentStep === 'type' && renderTypeStep()}
          {currentStep === 'settings' && renderSettingsStep()}
          {currentStep === 'words' && renderWordsStep()}
          {currentStep === 'options' && renderOptionsStep()}
          {currentStep === 'preview' && renderPreviewStep()}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 lg:p-8 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all touch-manipulation ${
              currentStepIndex === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronRight size={20} />
            <span>السابق</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep !== 'preview' ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all touch-manipulation"
              >
                <span>التالي</span>
                <ChevronLeft size={20} />
              </button>
            ) : (
              <button
                onClick={handleStartTest}
                disabled={!canStartTest}
                className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg transition-all touch-manipulation ${
                  canStartTest
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PlayCircle size={24} />
                <span>ابدأ الاختبار</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
