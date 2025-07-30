// src/context/AppContext.tsx - النسخة المحسنة للأداء
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Test, TestResults, TestSettings, Word } from '@/types/flashcard';
import { QuestionGenerator } from '@/utils/QuestionGenerator';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';

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

const DEFAULT_CATEGORIES = ['عام', 'تقنية', 'علوم', 'أدب'];

// Types للـ Context
interface AppContextType {
  // البيانات الأساسية
  words: Word[];
  categories: string[];

  // الإحصائيات المحسوبة (memoized)
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

  // الأفعال - Words (memoized callbacks)
  addWord: (
    newWordData: Omit<
      Word,
      | 'id'
      | 'lastReviewed'
      | 'correctCount'
      | 'incorrectCount'
      | 'nextReview'
      | 'easeFactor'
      | 'interval'
      | 'repetition'
    >
  ) => void;
  updateWord: (updatedWord: Word) => void;
  deleteWord: (id: number) => void;
  updateProgress: (wordId: number, correct: boolean) => void;
  updateProgressWithQuality: (wordId: number, quality: number) => void;

  // الأفعال - Categories (memoized callbacks)
  addCategory: (newCategory: string) => void;

  // الأفعال - البيانات (memoized callbacks)
  exportData: () => void;
  importData: (data: any) => Promise<boolean>;
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

// SM-2 Algorithm Implementation (مُحسن للأداء)
const calculateSM2 = (
  word: Word,
  quality: number
): { interval: number; repetition: number; easeFactor: number } => {
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

    // تحديث easeFactor فقط للإجابات الصحيحة
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(easeFactor, 1.3);
  }

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
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);
  const [tests, setTests] = useLocalStorage<Test[]>('flashcard_tests', []);

  // ⚡ Memoized timestamp function لتجنب تكرار الحسابات
  const getCurrentTimestamp = useCallback(() => Date.now(), []);

  // ⚡ Memoized إحصائيات محسوبة لتجنب re-computation في كل render
  const stats = useMemo(() => {
    const currentTime = getCurrentTimestamp();
    const totalWords = words.length;

    const masteredWords = words.filter(
      (w) => w.repetition >= 3 && w.interval >= 21
    ).length;

    const wordsNeedingReview = words.filter(
      (w) => w.nextReview <= currentTime
    ).length;
    
    const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
    
    // إحصائيات الاختبارات
    const completedTestsList = tests.filter(t => t.completedAt && t.results);
    const totalTests = tests.length;
    
    let averageScore = 0;
    let bestScore = 0;
    let totalTestTime = 0;
    
    if (completedTestsList.length > 0) {
      const totalScore = completedTestsList.reduce((sum, test) => sum + (test.results?.percentage || 0), 0);
      averageScore = Math.round(totalScore / completedTestsList.length);
      bestScore = Math.max(...completedTestsList.map(test => test.results?.percentage || 0));
      totalTestTime = completedTestsList.reduce((sum, test) => sum + (test.results?.timeSpent || 0), 0);
    }

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
      totalTests,
      completedTests: completedTestsList.length,
      averageScore,
      bestScore,
      totalTestTime
    };
  }, [words, tests, getCurrentTimestamp]);

  // ⚡ Memoized إضافة كلمة جديدة
  const addWord = useCallback((
    newWordData: Omit<
      Word,
      | 'id'
      | 'lastReviewed'
      | 'correctCount'
      | 'incorrectCount'
      | 'nextReview'
      | 'easeFactor'
      | 'interval'
      | 'repetition'
    >
  ) => {
    const currentTime = getCurrentTimestamp();
    const newWord: Word = {
      ...newWordData,
      id: currentTime, // استخدام timestamp كـ ID فريد
      lastReviewed: currentTime,
      correctCount: 0,
      incorrectCount: 0,
      nextReview: currentTime,
      easeFactor: 2.5,
      interval: 1,
      repetition: 0,
    };

    setWords((prev) => [...prev, newWord]);
  }, [getCurrentTimestamp, setWords]);

  // ⚡ Memoized تحديث كلمة موجودة
  const updateWord = useCallback((updatedWord: Word) => {
    setWords((prev) =>
      prev.map((word) => (word.id === updatedWord.id ? updatedWord : word))
    );
  }, [setWords]);

  // ⚡ Memoized حذف كلمة
  const deleteWord = useCallback((id: number) => {
    setWords((prev) => prev.filter((word) => word.id !== id));
  }, [setWords]);

  // ⚡ Memoized تحديث التقدم مع الجودة
  const updateProgressWithQuality = useCallback((wordId: number, quality: number) => {
    const currentTime = getCurrentTimestamp();
    
    setWords((prev) =>
      prev.map((word) => {
        if (word.id !== wordId) return word;

        // حساب الفترة الجديدة باستخدام SM-2
        const sm2Result = calculateSM2(word, quality);
        const nextReviewDelay = sm2Result.interval * 24 * 60 * 60 * 1000;

        return {
          ...word,
          correctCount: quality >= 3 ? word.correctCount + 1 : word.correctCount,
          incorrectCount: quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
          lastReviewed: currentTime,
          nextReview: currentTime + nextReviewDelay,
          quality: Math.max(0, Math.min(5, Number(quality))),
          ...sm2Result,
        };
      })
    );
  }, [getCurrentTimestamp, setWords]);

  // ⚡ Memoized تحديث بسيط (صحيح/خطأ)
  const updateProgress = useCallback((wordId: number, correct: boolean) => {
    updateProgressWithQuality(wordId, correct ? 4 : 1);
  }, [updateProgressWithQuality]);

  // ⚡ Memoized إضافة تصنيف
  const addCategory = useCallback((newCategory: string) => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories((prev) => [...prev, trimmedCategory]);
    }
  }, [categories, setCategories]);

  // ⚡ Memoized تصدير البيانات
  const exportData = useCallback(() => {
    const currentTime = getCurrentTimestamp();
    
    const exportData = {
      words,
      categories,
      savedAt: currentTime,
      version: '2.0',
      exportedAt: new Date(currentTime).toISOString(),
      appVersion: '2.0.0',
      totalWords: words.length,
      masteredWords: words.filter((w) => w.repetition >= 3 && w.interval >= 21).length,
      studySessions: [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluid-cards-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [words, categories, getCurrentTimestamp]);

  // ⚡ Memoized استيراد البيانات (simplified)
  const importData = useCallback(async (data: any): Promise<boolean> => {
    try {
      if (!data || !data.words || !Array.isArray(data.words)) {
        return false;
      }

      const validWords = data.words.filter((word: any) => 
        word && 
        typeof word === 'object' && 
        word.word && 
        word.meaning &&
        word.category &&
        word.difficulty
      );

      if (validWords.length === 0) {
        return false;
      }

      setWords(validWords);
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, [setWords, setCategories]);

  // ⚡ Memoized دوال الاختبارات
  const createTest = useCallback((settings: TestSettings): Test => {
    const currentTime = getCurrentTimestamp();
    
    const test: Test = {
      id: `test_${currentTime}`,
      name: `اختبار ${new Date(currentTime).toLocaleString('ar')}`,
      settings,
      questions: [], // سيتم ملؤها من QuestionGenerator
      createdAt: currentTime,
      isActive: false,
    };

    return test;
  }, [getCurrentTimestamp]);

  const getTestHistory = useCallback(() => tests, [tests]);

  const saveTestToHistory = useCallback((test: Test) => {
    setTests((prev) => {
      const existingIndex = prev.findIndex(t => t.id === test.id);
      if (existingIndex >= 0) {
        const newTests = [...prev];
        newTests[existingIndex] = test;
        return newTests;
      } else {
        return [...prev, test];
      }
    });
  }, [setTests]);

  const submitTestResults = useCallback((testId: string, results: TestResults) => {
    setTests((prev) =>
      prev.map((test) =>
        test.id === testId
          ? { ...test, results, completedAt: getCurrentTimestamp() }
          : test
      )
    );
  }, [setTests, getCurrentTimestamp]);

  const deleteTest = useCallback((testId: string) => {
    setTests((prev) => prev.filter((test) => test.id !== testId));
  }, [setTests]);

  const getActiveTest = useCallback(() => {
    return tests.find((test) => test.isActive) || null;
  }, [tests]);

  const startTest = useCallback((testId: string) => {
    setTests((prev) =>
      prev.map((test) => ({
        ...test,
        isActive: test.id === testId,
      }))
    );
  }, [setTests]);

  const getTestStats = useCallback(() => {
    const completedTests = tests.filter(t => t.completedAt && t.results);
    
    return {
      totalTests: tests.length,
      completedTests: completedTests.length,
      averageScore: completedTests.length > 0 
        ? Math.round(completedTests.reduce((sum, test) => sum + (test.results?.percentage || 0), 0) / completedTests.length)
        : 0,
      bestScore: completedTests.length > 0 
        ? Math.max(...completedTests.map(test => test.results?.percentage || 0))
        : 0,
      totalTestTime: completedTests.reduce((sum, test) => sum + (test.results?.timeSpent || 0), 0)
    };
  }, [tests]);

  // ⚡ Memoized القيمة النهائية للـ Context
  const value: AppContextType = useMemo(() => ({
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
  }), [
    words,
    categories,
    stats,
    addWord,
    updateWord,
    deleteWord,
    updateProgress,
    updateProgressWithQuality,
    addCategory,
    exportData,
    importData,
    createTest,
    startTest,
    submitTestResults,
    getTestHistory,
    deleteTest,
    getActiveTest,
    getTestStats,
    saveTestToHistory,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
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