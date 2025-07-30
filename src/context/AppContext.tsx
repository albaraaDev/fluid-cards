// src/context/AppContext.tsx - النسخة الكاملة والأخيرة
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  AppData,
  AppStats,
  DifficultyFilter,
  StudySession,
  Test,
  TestQuestion,
  TestResults,
  TestSettings,
  TestType,
  Word,
} from '@/types/flashcard';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

// ==========================================
// Default Data
// ==========================================
const DEFAULT_WORDS: Word[] = [
  {
    id: 1,
    word: 'Ubiquitous',
    meaning: 'موجود في كل مكان، منتشر على نطاق واسع',
    note: 'من اللاتينية ubique تعني "في كل مكان"',
    category: 'مفردات أكاديمية',
    difficulty: 'صعب',
    lastReviewed: Date.now() - 86400000,
    correctCount: 2,
    incorrectCount: 1,
    nextReview: Date.now() - 3600000,
    easeFactor: 2.5,
    interval: 1,
    repetition: 2,
    quality: 4,
  },
  {
    id: 2,
    word: 'Ephemeral',
    meaning: 'مؤقت، زائل، قصير المدى',
    note: 'يُستخدم لوصف الأشياء التي تدوم لفترة قصيرة',
    category: 'مفردات أكاديمية',
    difficulty: 'متوسط',
    lastReviewed: Date.now() - 172800000,
    correctCount: 3,
    incorrectCount: 0,
    nextReview: Date.now() + 86400000,
    easeFactor: 2.6,
    interval: 3,
    repetition: 3,
    quality: 5,
  },
  {
    id: 3,
    word: 'Serendipity',
    meaning: 'اكتشاف شيء جميل بالصدفة',
    note: 'كلمة إنجليزية جميلة تعبر عن السعادة غير المتوقعة',
    category: 'مفردات عامة',
    difficulty: 'سهل',
    lastReviewed: Date.now() - 259200000,
    correctCount: 4,
    incorrectCount: 1,
    nextReview: Date.now() - 7200000,
    easeFactor: 2.4,
    interval: 2,
    repetition: 4,
    quality: 3,
  },
];

const DEFAULT_CATEGORIES = [
  'مفردات أكاديمية',
  'مفردات عامة',
  'مصطلحات تقنية',
  'تعبيرات شائعة',
];

// ==========================================
// Context Interface
// ==========================================
interface AppContextType {
  // Core Data
  words: Word[];
  categories: string[];
  stats: AppStats;
  isClient: boolean;

  // Word Management
  addWord: (word: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>) => void;
  updateWord: (id: number, updates: Partial<Word>) => void;
  deleteWord: (id: number) => void;
  
  // Progress Tracking (SM-2)
  updateProgress: (wordId: number, correct: boolean) => void;
  updateProgressWithQuality: (wordId: number, quality: number) => void;
  
  // Category Management
  addCategory: (category: string) => void;
  
  // Data Management
  exportData: () => void;
  importData: (data: any) => Promise<boolean>;
  
  // Test Management
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

// ==========================================
// SM-2 Algorithm Implementation
// ==========================================
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
    // تحديث easeFactor فقط للإجابات الصحيحة
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(easeFactor, 1.3);
  }

  // الحد الأقصى للفترة (6 أشهر)
  interval = Math.min(interval, 180);

  return { interval, repetition, easeFactor };
};

// ==========================================
// Context Creation
// ==========================================
const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// Provider Component
// ==========================================
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);
  const [tests, setTests] = useLocalStorage<Test[]>('flashcard_tests', []);
  const [isClient, setIsClient] = useState(false);

  // التأكد من client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ⚡ Memoized timestamp function
  const getCurrentTimestamp = useCallback(() => Date.now(), []);

  // ⚡ Memoized إحصائيات محسوبة
  const stats = useMemo(() => {
    if (!isClient) {
      // Return default stats for server-side rendering
      return {
        totalWords: 0,
        masteredWords: 0,
        wordsNeedingReview: 0,
        progress: 0,
        totalReviews: 0,
        averageCorrectRate: 0,
        streak: { current: 0, longest: 0 },
        categoryStats: [],
        difficultyStats: [],
      };
    }

    const currentTime = getCurrentTimestamp();
    const totalWords = words.length;

    const masteredWords = words.filter(
      (w) => w.repetition >= 3 && w.interval >= 21
    ).length;

    const wordsNeedingReview = words.filter(
      (w) => w.nextReview <= currentTime
    ).length;
    
    const progress = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

    const totalReviews = words.reduce(
      (sum, w) => sum + w.correctCount + w.incorrectCount,
      0
    );

    const totalCorrect = words.reduce(
      (sum, w) => sum + w.correctCount,
      0
    );

    const averageCorrectRate = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // إحصائيات التصنيفات
    const categoryMap = new Map<string, { total: number; mastered: number; needReview: number }>();
    words.forEach((word) => {
      const category = word.category;
      const current = categoryMap.get(category) || { total: 0, mastered: 0, needReview: 0 };
      current.total++;
      if (word.repetition >= 3 && word.interval >= 21) current.mastered++;
      if (word.nextReview <= currentTime) current.needReview++;
      categoryMap.set(category, current);
    });

    const categoryStats = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      progress: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
    }));

    // إحصائيات الصعوبة
    const difficultyMap = new Map<'سهل' | 'متوسط' | 'صعب', { total: number; mastered: number }>();
    words.forEach((word) => {
      const difficulty = word.difficulty;
      const current = difficultyMap.get(difficulty) || { total: 0, mastered: 0 };
      current.total++;
      if (word.repetition >= 3 && word.interval >= 21) current.mastered++;
      difficultyMap.set(difficulty, current);
    });

    const difficultyStats = Array.from(difficultyMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      progress: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
      averageReviews: data.total > 0 ? totalReviews / data.total : 0,
    }));
    
    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
      totalReviews,
      averageCorrectRate,
      streak: { current: 0, longest: 0 }, // يمكن تطويرها لاحقاً
      categoryStats,
      difficultyStats,
    };
  }, [words, getCurrentTimestamp, isClient]);

  // ==========================================
  // Word Management Functions
  // ==========================================

  // ⚡ إضافة كلمة جديدة
  const addWord = useCallback((newWord: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>) => {
    if (!isClient) return;

    const currentTime = getCurrentTimestamp();
    const id = Math.max(0, ...words.map(w => w.id)) + 1;
    
    const word: Word = {
      ...newWord,
      id,
      lastReviewed: currentTime,
      correctCount: 0,
      incorrectCount: 0,
      nextReview: currentTime, // متاحة للمراجعة فوراً
      easeFactor: 2.5, // القيمة الافتراضية لـ SM-2
      interval: 1,
      repetition: 0,
    };

    setWords(prevWords => [...prevWords, word]);

    // إضافة التصنيف إذا لم يكن موجوداً
    if (!categories.includes(newWord.category)) {
      setCategories(prevCategories => [...prevCategories, newWord.category]);
    }
  }, [words, categories, setWords, setCategories, getCurrentTimestamp, isClient]);

  // ⚡ تحديث كلمة
  const updateWord = useCallback((id: number, updates: Partial<Word>) => {
    if (!isClient) return;
    
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === id ? { ...word, ...updates } : word
      )
    );
  }, [setWords, isClient]);

  // ⚡ حذف كلمة
  const deleteWord = useCallback((id: number) => {
    if (!isClient) return;
    
    setWords(prevWords => prevWords.filter(word => word.id !== id));
  }, [setWords, isClient]);

  // ==========================================
  // Progress Tracking (SM-2 Algorithm)
  // ==========================================

  // ⚡ تحديث التقدم مع تقييم الجودة (0-5)
  const updateProgressWithQuality = useCallback((wordId: number, quality: number) => {
    if (!isClient) return;
    
    const currentTime = getCurrentTimestamp();
    
    setWords(prevWords => 
      prevWords.map(word => {
        if (word.id !== wordId) return word;

        const sm2Result = calculateSM2(word, quality);
        const nextReviewDelay = sm2Result.interval * 24 * 60 * 60 * 1000; // تحويل أيام إلى ميللي ثانية

        return {
          ...word,
          correctCount: quality >= 3 ? word.correctCount + 1 : word.correctCount,
          incorrectCount: quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
          lastReviewed: currentTime,
          nextReview: currentTime + nextReviewDelay,
          quality: Math.max(0, Math.min(5, Number(quality))),
          ...sm2Result,
          correctCount: quality >= 3 ? word.correctCount + 1 : word.correctCount,
          incorrectCount: quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
          lastReviewed: currentTime,
          nextReview: currentTime + nextReviewDelay,
          quality: Math.max(0, Math.min(5, Number(quality))),
          ...sm2Result,
        };
      })
    );
  }, [getCurrentTimestamp, setWords, isClient]);

  // ⚡ تحديث بسيط (صحيح/خطأ)
  const updateProgress = useCallback((wordId: number, correct: boolean) => {
    updateProgressWithQuality(wordId, correct ? 4 : 1);
  }, [updateProgressWithQuality]);

  // ==========================================
  // Category Management
  // ==========================================

  // ⚡ إضافة تصنيف
  const addCategory = useCallback((newCategory: string) => {
    if (!isClient) return;
    
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories((prev) => [...prev, trimmedCategory]);
    }
  }, [categories, setCategories, isClient]);

  // ==========================================
  // Data Management
  // ==========================================

  // ⚡ تصدير البيانات
  const exportData = useCallback(() => {
    if (!isClient) return;
    
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
      studySessions: [], // يمكن إضافة بيانات الجلسات لاحقاً
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
  }, [words, categories, getCurrentTimestamp, isClient]);

  // ⚡ استيراد البيانات
  const importData = useCallback(async (data: any): Promise<boolean> => {
    if (!isClient) return false;
    
    try {
      if (!data || !data.words || !Array.isArray(data.words)) {
        return false;
      }

      // التحقق من صحة البيانات
      const validWords = data.words.filter((word: any) => 
        word && 
        typeof word === 'object' && 
        word.word && 
        word.meaning &&
        word.category &&
        word.difficulty &&
        typeof word.id === 'number'
      ).map((word: any) => ({
        ...word,
        // التأكد من وجود حقول SM-2
        easeFactor: word.easeFactor || 2.5,
        interval: word.interval || 1,
        repetition: word.repetition || 0,
        lastReviewed: word.lastReviewed || Date.now(),
        nextReview: word.nextReview || Date.now(),
        correctCount: word.correctCount || 0,
        incorrectCount: word.incorrectCount || 0,
      }));

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
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, [setWords, setCategories, isClient]);

  // ==========================================
  // Test Management
  // ==========================================

  // ⚡ إنشاء اختبار جديد
  const createTest = useCallback((settings: TestSettings): Test => {
    if (!isClient) throw new Error('Not on client side');

    // فلترة الكلمات حسب الإعدادات
    let filteredWords = words;

    if (settings.categories.length > 0) {
      filteredWords = filteredWords.filter(w => settings.categories.includes(w.category));
    }

    if (settings.difficulties.length > 0 && !settings.difficulties.includes('all')) {
      filteredWords = filteredWords.filter(w => 
        settings.difficulties.includes(w.difficulty as DifficultyFilter)
      );
    }

    // اختيار عدد محدود من الكلمات
    const selectedWords = settings.randomOrder 
      ? filteredWords.sort(() => Math.random() - 0.5).slice(0, settings.questionCount)
      : filteredWords.slice(0, settings.questionCount);

    // إنشاء أسئلة الاختبار
    const questions: TestQuestion[] = selectedWords.map((word, index) => ({
      id: `q_${Date.now()}_${index}`,
      wordId: word.id,
      type: settings.type,
      question: settings.type === 'multiple_choice' 
        ? `ما معنى "${word.word}"؟`
        : settings.type === 'typing'
        ? `اكتب معنى "${word.word}"`
        : settings.type === 'true_false'
        ? `هل "${word.word}" تعني "${word.meaning}"؟`
        : `اربط "${word.word}" بمعناها`,
      correctAnswer: word.meaning,
      options: settings.type === 'multiple_choice' 
        ? generateMultipleChoiceOptions(word, words)
        : undefined,
      difficulty: 1,
    }));

    const test: Test = {
      id: `test_${Date.now()}`,
      name: `اختبار ${settings.type} - ${new Date().toLocaleDateString('ar-SA')}`,
      description: `اختبار يحتوي على ${questions.length} سؤال`,
      settings,
      questions,
      createdAt: Date.now(),
      isActive: false,
    };

    return test;
  }, [words, isClient]);

  // ⚡ بدء اختبار
  const startTest = useCallback((testId: string) => {
    if (!isClient) return;
    
    setTests(prevTests => 
      prevTests.map(test => ({
        ...test,
        isActive: test.id === testId
      }))
    );
  }, [setTests, isClient]);

  // ⚡ حفظ نتائج الاختبار
  const submitTestResults = useCallback((testId: string, results: TestResults) => {
    if (!isClient) return;
    
    setTests(prevTests => 
      prevTests.map(test => 
        test.id === testId 
          ? { ...test, results, completedAt: Date.now(), isActive: false }
          : test
      )
    );
  }, [setTests, isClient]);

  // ⚡ الحصول على تاريخ الاختبارات
  const getTestHistory = useCallback((): Test[] => {
    if (!isClient) return [];
    return tests.filter(test => test.completedAt).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [tests, isClient]);

  // ⚡ حذف اختبار
  const deleteTest = useCallback((testId: string) => {
    if (!isClient) return;
    
    setTests(prevTests => prevTests.filter(test => test.id !== testId));
  }, [setTests, isClient]);

  // ⚡ الحصول على الاختبار النشط
  const getActiveTest = useCallback((): Test | null => {
    if (!isClient) return null;
    return tests.find(test => test.isActive) || null;
  }, [tests, isClient]);

  // ⚡ إحصائيات الاختبارات
  const getTestStats = useCallback(() => {
    if (!isClient) {
      return {
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTestTime: 0,
      };
    }

    const completedTests = tests.filter(test => test.completedAt && test.results);
    const totalTests = tests.length;
    
    const scores = completedTests.map(test => test.results!.percentage);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    const totalTestTime = completedTests.reduce((sum, test) => sum + (test.results!.timeSpent || 0), 0);

    return {
      totalTests: tests.length,
      completedTests: completedTests.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      totalTestTime,
    };
  }, [tests, isClient]);

  // ⚡ حفظ اختبار في التاريخ
  const saveTestToHistory = useCallback((test: Test) => {
    if (!isClient) return;
    
    setTests(prevTests => [...prevTests, test]);
  }, [setTests, isClient]);

  // ==========================================
  // Context Value
  // ==========================================
  const value: AppContextType = {
    // Core Data
    words,
    categories,
    stats,
    isClient,

    // Word Management
    addWord,
    updateWord,
    deleteWord,

    // Progress Tracking
    updateProgress,
    updateProgressWithQuality,

    // Category Management
    addCategory,

    // Data Management
    exportData,
    importData,

    // Test Management
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

// ==========================================
// Custom Hook
// ==========================================
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// ==========================================
// Helper Functions
// ==========================================

// دالة مساعدة لإنشاء خيارات الاختيار المتعدد
function generateMultipleChoiceOptions(correctWord: Word, allWords: Word[]): string[] {
  const options = [correctWord.meaning];
  
  // إضافة 3 خيارات خاطئة عشوائية
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const randomWords = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
  
  randomWords.forEach(word => {
    if (options.length < 4) {
      options.push(word.meaning);
    }
  });

  // إذا لم نجد كلمات كافية، أضف خيارات وهمية
  while (options.length < 4) {
    options.push(`خيار وهمي ${options.length}`);
  }

  // خلط الخيارات
  return options.sort(() => Math.random() - 0.5);
}