// src/context/AppContext.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Test, TestResults, TestSettings, Word } from '@/types/flashcard';
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';

// الكلمات الافتراضية
const DEFAULT_WORDS: Word[] = [
  {
    id: 1,
    word: 'Serendipity',
    meaning: 'المصادفة السعيدة، اكتشاف شيء جميل بالصدفة',
    note: 'Finding something wonderful when you were not looking for it.',
    category: 'عام',
    difficulty: 'متوسط',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
  },
  {
    id: 2,
    word: 'Ubiquitous',
    meaning: 'موجود في كل مكان، منتشر على نطاق واسع',
    note: 'Technology has become ubiquitous in modern life.',
    category: 'عام',
    difficulty: 'متوسط',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
  },
  {
    id: 3,
    word: 'Ephemeral',
    meaning: 'عابر، مؤقت، يدوم لفترة قصيرة',
    note: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks.',
    category: 'عام',
    difficulty: 'صعب',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
  },
];

// الفئات الافتراضية
const DEFAULT_CATEGORIES = ['عام', 'تقنية', 'علوم', 'أدب'];

// Types للـ Context
interface AppContextType {
  // البيانات الأساسية
  words: Word[];
  categories: string[];
  
  // الإحصائيات المحسوبة
  stats: {
    totalWords: number;
    masteredWords: number;
    wordsNeedingReview: number;
    progress: number;
    totalTests: number;
    completedTests: number;
    averageScore: number;
    bestScore: number;
    totalTestTime: number;
  };
  
  // الأفعال - Words
  addWord: (newWordData: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>) => void;
  updateWord: (updatedWord: Word) => void;
  deleteWord: (id: number) => void;
  updateProgress: (wordId: number, correct: boolean) => void;
  updateProgressWithQuality: (wordId: number, quality: number) => void;
  
  // الأفعال - Categories  
  addCategory: (newCategory: string) => void;
  
  // الأفعال - البيانات
  exportData: () => void;
  importData: (data: any) => Promise<boolean>;

  // دوال الاختبارات الجديدة
  createTest: (settings: TestSettings) => Test;
  startTest: (testId: string) => void;
  submitTestResults: (testId: string, results: TestResults) => void;
  getTestHistory: () => Test[];
  deleteTest: (testId: string) => void;
  getActiveTest: () => Test | null;
  getTestStats: () => {
    totalTests: number;
    completedTests: number;
    averageScore: number;
    bestScore: number;
    totalTestTime: number;
  };
  saveTestToHistory: (test: Test) => void;
}

// SM-2 Algorithm Implementation
const calculateSM2 = (word: Word, quality: number): { interval: number; repetition: number; easeFactor: number } => {
  let { interval, repetition, easeFactor } = word;
  
  // إذا كانت الإجابة صعبة (quality < 3)، إعادة البداية
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    // الإجابة صحيحة، تقدم في التكرار
    repetition += 1;
    
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
  }
  
  // تحديث عامل السهولة
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // الحد الأدنى لعامل السهولة
  easeFactor = Math.max(easeFactor, 1.3);
  
  // الحد الأقصى للفترة (6 أشهر)
  interval = Math.min(interval, 180);
  
  return { interval, repetition, easeFactor };
};

// إنشاء الـ Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider المكون
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // الـ States الأساسية
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);
  
  // الـ States للاختبارات
  const [tests, setTests] = useLocalStorage<Test[]>('flashcard_tests', []);

  // Debug logging
  useEffect(() => {
    console.log('🔄 AppContext: Tests state changed. Current tests count:', tests.length);
    tests.forEach((test, index) => {
      console.log(`Test ${index + 1}:`, test.name, '- Completed:', !!test.completedAt);
    });
  }, [tests]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter((w) => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter((w) => w.nextReview <= Date.now()).length;
    const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
    
    // إحصائيات الاختبارات
    const completedTests = tests.filter(t => t.completedAt && t.results);
    const totalTests = tests.length;
    
    let averageScore = 0;
    let bestScore = 0;
    let totalTestTime = 0;
    
    if (completedTests.length > 0) {
      const totalScore = completedTests.reduce((sum, test) => sum + (test.results?.percentage || 0), 0);
      averageScore = Math.round(totalScore / completedTests.length);
      bestScore = Math.max(...completedTests.map(test => test.results?.percentage || 0));
      totalTestTime = completedTests.reduce((sum, test) => sum + (test.results?.timeSpent || 0), 0);
    }

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
      totalTests,
      completedTests: completedTests.length,
      averageScore,
      bestScore,
      totalTestTime
    };
  }, [words, tests]);

  // ==========================================
  // دوال إدارة الكلمات
  // ==========================================

  // إضافة كلمة جديدة
  const addWord = (newWordData: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>) => {
    const newWord: Word = {
      ...newWordData,
      id: Date.now(),
      lastReviewed: Date.now(),
      correctCount: 0,
      incorrectCount: 0,
      nextReview: Date.now(),
      easeFactor: 2.5,
      interval: 1,
      repetition: 0,
    };

    setWords(prev => [newWord, ...prev]);
  };

  // تحديث كلمة موجودة
  const updateWord = (updatedWord: Word) => {
    setWords(prev => prev.map(word => word.id === updatedWord.id ? updatedWord : word));
  };

  // حذف كلمة
  const deleteWord = (id: number) => {
    setWords(prev => prev.filter(word => word.id !== id));
  };

  // تحديث تقدم الكلمة مع خوارزمية SM-2 المحسنة
  const updateProgressWithQuality = (wordId: number, quality: number) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;

      const sm2Result = calculateSM2(word, quality);
      const nextReviewDelay = sm2Result.interval * 24 * 60 * 60 * 1000; // تحويل الأيام إلى ميلي ثانية

      return {
        ...word,
        correctCount: quality >= 3 ? word.correctCount + 1 : word.correctCount,
        incorrectCount: quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
        lastReviewed: Date.now(),
        nextReview: Date.now() + nextReviewDelay,
        quality,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetition: sm2Result.repetition,
      };
    }));
  };

  // تحديث تقدم الكلمة (للتوافق مع النظام القديم)
  const updateProgress = (wordId: number, correct: boolean) => {
    const quality = correct ? 4 : 2;
    updateProgressWithQuality(wordId, quality);
  };

  // إضافة تصنيف جديد
  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  // ==========================================
  // دوال تصدير واستيراد البيانات
  // ==========================================

  // تصدير البيانات
  const exportData = () => {
    try {
      const dataToExport = {
        words,
        categories,
        tests,
        exportedAt: new Date().toISOString(),
        appVersion: '2.0',
        totalWords: words.length,
        masteredWords: stats.masteredWords,
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const element = document.createElement('a');
      const file = new Blob([dataStr], {
        type: 'application/json;charset=utf-8',
      });
      element.href = URL.createObjectURL(file);
      element.download = `بطاقات_تعليمية_${
        new Date().toISOString().split('T')[0]
      }.json`;

      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();

      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }, 100);
    } catch (err) {
      console.error('خطأ في التصدير:', err);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  // استيراد البيانات
  const importData = async (data: any): Promise<boolean> => {
    try {
      if (data.words && Array.isArray(data.words)) {
        const updatedWords = data.words.map((word: any) => ({
          ...word,
          easeFactor: word.easeFactor || 2.5,
          interval: word.interval || 1,
          repetition: word.repetition || 0,
        }));
        
        setWords(updatedWords);
        setCategories(data.categories || DEFAULT_CATEGORIES);
        
        if (data.tests && Array.isArray(data.tests)) {
          setTests(data.tests);
        }
        
        return true;
      } else {
        throw new Error('ملف غير صالح');
      }
    } catch (err) {
      console.error('خطأ في استيراد البيانات:', err);
      return false;
    }
  };

  // ==========================================
  // دوال إدارة الاختبارات
  // ==========================================

  // Helper function للحصول على اسم نوع الاختبار
  const getTestTypeName = (type: string): string => {
    const names = {
      'multiple_choice': 'الاختيار المتعدد',
      'typing': 'الكتابة',
      'matching': 'المطابقة',
      'true_false': 'صح وخطأ',
      'mixed': 'مختلط'
    };
    return names[type as keyof typeof names] || 'عام';
  };

  // إنشاء اختبار جديد
  const createTest = (settings: TestSettings): Test => {
    try {
      console.log('🎯 AppContext: Creating test with settings:', settings);
      
      // Import QuestionGenerator
      const { QuestionGenerator } = require('@/utils/QuestionGenerator');
      
      // Filter words based on settings
      const availableWords = QuestionGenerator.filterWordsForTest(
        words,
        settings.categories,
        settings.difficulties
      );

      // Ensure we have enough words
      const questionsCount = Math.min(settings.questionCount, availableWords.length);
      if (questionsCount === 0) {
        throw new Error('لا توجد كلمات متاحة للاختبار');
      }

      console.log(`📚 Found ${availableWords.length} available words, creating ${questionsCount} questions`);

      // Generate questions based on test type
      let questions;
      if (settings.type === 'mixed') {
        questions = QuestionGenerator.generateMixedQuestions(
          availableWords.slice(0, questionsCount),
          questionsCount
        );
      } else {
        questions = availableWords.slice(0, questionsCount).map((word: any) => {
          switch (settings.type) {
            case 'multiple_choice':
              return QuestionGenerator.generateMultipleChoice(word, availableWords);
            case 'typing':
              return QuestionGenerator.generateTypingQuestion(word);
            case 'true_false':
              return QuestionGenerator.generateTrueFalseQuestion(word, availableWords);
            case 'matching':
              const groupStart = availableWords.indexOf(word);
              const matchingGroup = availableWords.slice(groupStart, groupStart + 4);
              return QuestionGenerator.generateMatchingQuestion(matchingGroup);
            default:
              return QuestionGenerator.generateMultipleChoice(word, availableWords);
          }
        });
      }

      // Shuffle questions if randomOrder is enabled
      if (settings.randomOrder) {
        questions.sort(() => Math.random() - 0.5);
      }

      const newTest: Test = {
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `اختبار ${getTestTypeName(settings.type)}`,
        description: `${questions.length} أسئلة • اختبار ${getTestTypeName(settings.type)}`,
        settings,
        questions,
        createdAt: Date.now(),
        isActive: false
      };

      console.log('✅ AppContext: Test created successfully:', newTest.id);
      return newTest;
      
    } catch (error) {
      console.error('❌ AppContext: Error creating test:', error);
      throw error;
    }
  };

  // بدء اختبار
  const startTest = (testId: string) => {
    console.log('🚀 AppContext: Starting test:', testId);
    
    const test = tests.find(t => t.id === testId);
    if (test) {
      const updatedTest = { ...test, isActive: true };
      setTests(prev => prev.map(t => t.id === testId ? updatedTest : t));
      console.log('✅ Test marked as active');
    } else {
      console.error('❌ Test not found:', testId);
    }
  };

  // حفظ نتائج الاختبار
  const submitTestResults = (testId: string, results: TestResults) => {
    console.log('📊 AppContext: Submitting test results for test ID:', testId);
    
    setTests(prev => {
      const updatedTests = prev.map(test => {
        if (test.id === testId) {
          const updatedTest = {
            ...test,
            results,
            completedAt: Date.now(),
            isActive: false
          };
          
          console.log('📝 Test updated with results');
          
          // Update words progress from test results
          updateWordsProgressFromTest(updatedTest);
          
          return updatedTest;
        }
        return test;
      });
      
      console.log('✅ Test results submitted successfully');
      return updatedTests;
    });
  };

  // تحديث تقدم الكلمات بناءً على نتائج الاختبار
  const updateWordsProgressFromTest = (test: Test) => {
    console.log('🔄 Updating words progress from test results');
    
    test.questions.forEach(question => {
      const word = words.find(w => w.id === question.wordId);
      if (word && question.isCorrect !== undefined) {
        // Convert boolean to quality score (0-5 scale)
        let quality = question.isCorrect ? 4 : 2;
        
        // Apply time bonus/penalty
        const timeSpent = question.timeSpent || 30;
        const expectedTime = test.settings.questionTimeLimit || 30;
        const timeRatio = timeSpent / expectedTime;
        
        if (question.isCorrect) {
          // Bonus for fast correct answers
          if (timeRatio < 0.5) quality = 5;
          else if (timeRatio < 0.8) quality = 4;
          else quality = 3;
        } else {
          // Less penalty for quick wrong answers (might be guess)
          if (timeRatio < 0.3) quality = 1;
          else quality = 2;
        }
        
        // Update word progress
        updateProgressWithQuality(word.id, quality);
      }
    });
  };

  // الحصول على تاريخ الاختبارات
  const getTestHistory = (): Test[] => {
    console.log('📚 AppContext: Getting test history. Total tests:', tests.length);
    return tests.sort((a, b) => b.createdAt - a.createdAt);
  };

  // حذف اختبار
  const deleteTest = (testId: string) => {
    console.log('🗑️ AppContext: Deleting test:', testId);
    setTests(prev => prev.filter(t => t.id !== testId));
  };

  // الحصول على الاختبار النشط
  const getActiveTest = (): Test | null => {
    const activeTest = tests.find(t => t.isActive);
    return activeTest || null;
  };

  // إحصائيات الاختبارات
  const getTestStats = () => {
    const completedTests = tests.filter(t => t.completedAt && t.results);
    const totalTests = tests.length;
    
    if (completedTests.length === 0) {
      return {
        totalTests,
        completedTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTestTime: 0
      };
    }
    
    const totalScore = completedTests.reduce((sum, test) => sum + (test.results?.percentage || 0), 0);
    const averageScore = totalScore / completedTests.length;
    const bestScore = Math.max(...completedTests.map(test => test.results?.percentage || 0));
    const totalTestTime = completedTests.reduce((sum, test) => sum + (test.results?.timeSpent || 0), 0);
    
    return {
      totalTests,
      completedTests: completedTests.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      totalTestTime
    };
  };

  // حفظ اختبار في التاريخ
  const saveTestToHistory = (test: Test) => {
    console.log('💾 AppContext: Saving test to history:', test.name);
    
    setTests(prev => {
      // تأكد من عدم وجود نسخ مكررة
      const filtered = prev.filter(t => t.id !== test.id);
      const newTests = [test, ...filtered];
      
      console.log('📈 Test history updated. Total tests:', newTests.length);
      return newTests;
    });
  };

  // ==========================================
  // إنشاء القيمة النهائية للـ Context
  // ==========================================
  const value: AppContextType = {
    // البيانات الأساسية
    words,
    categories,
    stats,
    
    // دوال إدارة الكلمات
    addWord,
    updateWord,
    deleteWord,
    updateProgress,
    updateProgressWithQuality,
    addCategory,
    
    // دوال تصدير واستيراد
    exportData,
    importData,
    
    // دوال إدارة الاختبارات
    createTest,
    startTest,
    submitTestResults,
    getTestHistory,
    deleteTest,
    getActiveTest,
    getTestStats,
    saveTestToHistory,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook لاستخدام الـ Context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;