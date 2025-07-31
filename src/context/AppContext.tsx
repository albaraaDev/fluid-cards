// src/context/AppContext.tsx - النسخة المحسنة والمطورة
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  AppData,
  AppStats,
  DifficultyFilter,
  MatchingData,
  StudySession,
  Test,
  TestQuestion,
  TestResults,
  TestSettings,
  TestType,
  TestValidation,
  TimerRef,
  Word,
} from '@/types/flashcard';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  addWord: (
    word: Omit<
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
  updateWord: (id: number, updates: Partial<Word>) => void;
  deleteWord: (id: number) => void;

  // Progress Tracking (SM-2)
  updateProgress: (wordId: number, correct: boolean) => void;
  updateProgressWithQuality: (wordId: number, quality: number) => void;

  // Category Management
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;

  // Data Management
  exportData: () => void;
  importData: (data: any) => Promise<boolean>;

  // Test Management - محسن
  createTest: (settings: TestSettings) => Test;
  validateTest: (settings: TestSettings) => TestValidation;
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
// Enhanced SM-2 Algorithm Implementation
// ==========================================
const calculateSM2Enhanced = (
  word: Word,
  quality: number,
  questionType?: TestType,
  timeSpent?: number
): { interval: number; repetition: number; easeFactor: number } => {
  let { interval, repetition, easeFactor } = word;

  // تعديل الجودة حسب نوع السؤال
  let adjustedQuality = quality;
  
  if (questionType) {
    switch (questionType) {
      case 'multiple_choice':
        // اختيار متعدد أسهل - تقليل المكافأة قليلاً
        adjustedQuality = Math.max(0, quality - 0.3);
        break;
      case 'typing':
        // الكتابة أصعب - زيادة المكافأة
        adjustedQuality = Math.min(5, quality + 0.5);
        break;
      case 'matching':
        // المطابقة متوسطة
        adjustedQuality = quality;
        break;
      case 'true_false':
        // صح/خطأ أسهل
        adjustedQuality = Math.max(0, quality - 0.2);
        break;
    }
  }

  // تعديل الجودة حسب وقت الإجابة
  if (timeSpent && timeSpent > 0) {
    const expectedTime = 30; // وقت متوقع بالثواني
    const timeRatio = timeSpent / expectedTime;
    
    if (quality >= 3) { // إجابة صحيحة
      if (timeRatio <= 0.3) adjustedQuality += 0.5; // سريع جداً
      else if (timeRatio >= 1.5) adjustedQuality -= 0.3; // بطيء
    }
  }

  // تطبيق خوارزمية SM-2 المحسنة
  if (adjustedQuality < 3) {
    // إجابة صعبة - إعادة البداية
    repetition = 0;
    interval = 1;
  } else {
    // إجابة صحيحة - تقدم في التكرار
    repetition += 1;

    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }

    // تحديث easeFactor
    easeFactor =
      easeFactor + (0.1 - (5 - adjustedQuality) * (0.08 + (5 - adjustedQuality) * 0.02));
    easeFactor = Math.max(easeFactor, 1.3);
  }

  // الحد الأقصى للفترة (6 أشهر)
  interval = Math.min(interval, 180);

  return { interval, repetition, easeFactor };
};

// ==========================================
// Question Generation Utils - محسن
// ==========================================
class EnhancedQuestionGenerator {
  // 🔥 إنشاء أسئلة متعددة الخيارات محسن
  static generateMultipleChoice(word: Word, allWords: Word[]): TestQuestion {
    const isWordToMeaning = Math.random() > 0.5;
    
    const question = isWordToMeaning 
      ? `ما معنى كلمة "${word.word}"؟`
      : `ما الكلمة التي تعني "${word.meaning}"؟`;
    
    const correctAnswer = isWordToMeaning ? word.meaning : word.word;
    
    // 🔥 تحسين: اختيار خيارات خاطئة ذكية
    const wrongAnswers = this.getSmartWrongAnswers(word, allWords, 3, isWordToMeaning);
    const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: `mcq_${word.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wordId: word.id,
      type: 'multiple_choice',
      question,
      correctAnswer,
      options,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // 🔥 إنشاء أسئلة كتابة
  static generateTypingQuestion(word: Word): TestQuestion {
    const isWordToMeaning = Math.random() > 0.5;
    
    const question = isWordToMeaning
      ? `اكتب معنى كلمة "${word.word}"`
      : `اكتب الكلمة التي تعني "${word.meaning}"`;
    
    const correctAnswer = isWordToMeaning ? word.meaning : word.word;
    
    return {
      id: `typing_${word.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wordId: word.id,
      type: 'typing',
      question,
      correctAnswer,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // 🔥 إنشاء أسئلة مطابقة محسن - يحل مشكلة JSON
  static generateMatchingQuestion(words: Word[]): TestQuestion {
    const selectedWords = words.slice(0, Math.min(6, words.length));
    
    const wordsList = selectedWords.map(w => w.word);
    const meaningsList = selectedWords.map(w => w.meaning);
    const shuffledMeanings = this.shuffleArray([...meaningsList]);
    
    // 🔥 إصلاح: استخدام matchingData بدلاً من JSON في question
    const correctMatches = selectedWords.reduce((acc, word) => {
      acc[word.word] = word.meaning;
      return acc;
    }, {} as Record<string, string>);

    const matchingData: MatchingData = {
      words: wordsList,
      meanings: shuffledMeanings,
      correctMatches,
    };
    
    return {
      id: `matching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wordId: selectedWords[0].id,
      type: 'matching',
      question: `اربط كل كلمة بمعناها الصحيح`,
      correctAnswer: JSON.stringify(correctMatches),
      matchingData, // 🔥 البيانات المنظمة
      difficulty: Math.round(
        selectedWords.reduce((sum, w) => sum + this.getDifficultyNumber(w.difficulty), 0) / selectedWords.length
      ),
    };
  }

  // 🔥 إنشاء أسئلة صح/خطأ
  static generateTrueFalseQuestion(word: Word, allWords: Word[]): TestQuestion {
    const isCorrect = Math.random() > 0.5;
    
    let statement: string;
    let correctAnswer: string;
    
    if (isCorrect) {
      statement = `كلمة "${word.word}" تعني "${word.meaning}"`;
      correctAnswer = 'true';
    } else {
      const wrongMeaning = this.generateFalseStatement(word, allWords);
      statement = `كلمة "${word.word}" تعني "${wrongMeaning}"`;
      correctAnswer = 'false';
    }
    
    return {
      id: `tf_${word.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wordId: word.id,
      type: 'true_false',
      question: statement,
      correctAnswer,
      difficulty: this.getDifficultyNumber(word.difficulty),
    };
  }

  // 🔥 اختيار خيارات خاطئة ذكية
  private static getSmartWrongAnswers(
    correctWord: Word,
    allWords: Word[],
    count: number,
    isWordToMeaning: boolean
  ): string[] {
    const availableWords = allWords.filter(w => w.id !== correctWord.id);
    
    // أولوية للكلمات من نفس الفئة والصعوبة
    const sameCategory = availableWords.filter(w => w.category === correctWord.category);
    const sameDifficulty = availableWords.filter(w => w.difficulty === correctWord.difficulty);
    const similarLength = availableWords.filter(w => 
      Math.abs(w.word.length - correctWord.word.length) <= 2
    );
    
    let candidatePool: Word[] = [];
    
    // بناء pool ذكي
    if (sameCategory.length >= count) {
      candidatePool = sameCategory;
    } else if (sameDifficulty.length >= count) {
      candidatePool = sameDifficulty;
    } else if (similarLength.length >= count) {
      candidatePool = similarLength;
    } else {
      candidatePool = availableWords;
    }
    
    if (candidatePool.length === 0) {
      return ['خيار بديل 1', 'خيار بديل 2', 'خيار بديل 3'].slice(0, count);
    }
    
    const shuffled = this.shuffleArray([...candidatePool]);
    const selectedWords = shuffled.slice(0, count);
    
    return selectedWords.map(w => isWordToMeaning ? w.meaning : w.word);
  }

  // دوال مساعدة
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static getDifficultyNumber(difficulty: string): number {
    switch (difficulty) {
      case 'سهل': return 1;
      case 'متوسط': return 3;
      case 'صعب': return 5;
      default: return 3;
    }
  }

  private static generateFalseStatement(word: Word, allWords: Word[]): string {
    const sameCategory = allWords.filter(w => 
      w.id !== word.id && w.category === word.category
    );
    
    const candidateWords = sameCategory.length > 0 ? sameCategory : 
      allWords.filter(w => w.id !== word.id);
    
    if (candidateWords.length === 0) {
      return 'معنى غير صحيح';
    }
    
    const randomWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    return randomWord.meaning;
  }
}

// ==========================================
// Context Creation
// ==========================================
const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// App Provider Component
// ==========================================
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // ==========================================
  // State Management
  // ==========================================
  const [words, setWords] = useLocalStorage<Word[]>('flashcards-words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcards-categories', DEFAULT_CATEGORIES);
  const [tests, setTests] = useLocalStorage<Test[]>('flashcards-tests', []);
  const [isClient, setIsClient] = useState(false);

  // ==========================================
  // Client-side Mounting
  // ==========================================
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ==========================================
  // Helper Functions
  // ==========================================
  const getCurrentTimestamp = useCallback(() => Date.now(), []);

  const getNextWordId = useCallback(() => {
    return Math.max(0, ...words.map(w => w.id)) + 1;
  }, [words]);

  // ==========================================
  // Statistics Calculation - محسن
  // ==========================================
  const stats = useMemo((): AppStats => {
    if (!isClient || words.length === 0) {
      return {
        totalWords: 0,
        masteredWords: 0,
        wordsNeedingReview: 0,
        progress: 0,
      };
    }

    const now = getCurrentTimestamp();
    const masteredWords = words.filter(w => w.repetition >= 3 && w.interval >= 21);
    const wordsNeedingReview = words.filter(w => w.nextReview <= now);
    
    // إحصائيات متقدمة
    const categoryStats = categories.map(category => {
      const categoryWords = words.filter(w => w.category === category);
      const mastered = categoryWords.filter(w => w.repetition >= 3 && w.interval >= 21);
      const needReview = categoryWords.filter(w => w.nextReview <= now);
      
      return {
        name: category,
        total: categoryWords.length,
        mastered: mastered.length,
        needReview: needReview.length,
        progress: categoryWords.length > 0 ? Math.round((mastered.length / categoryWords.length) * 100) : 0,
      };
    });

    const difficultyStats = (['سهل', 'متوسط', 'صعب'] as const).map(difficulty => {
      const difficultyWords = words.filter(w => w.difficulty === difficulty);
      const mastered = difficultyWords.filter(w => w.repetition >= 3 && w.interval >= 21);
      
      return {
        name: difficulty,
        total: difficultyWords.length,
        mastered: mastered.length,
        progress: difficultyWords.length > 0 ? Math.round((mastered.length / difficultyWords.length) * 100) : 0,
      };
    });

    return {
      totalWords: words.length,
      masteredWords: masteredWords.length,
      wordsNeedingReview: wordsNeedingReview.length,
      progress: Math.round((masteredWords.length / words.length) * 100),
      categoryStats,
      difficultyStats,
    };
  }, [words, categories, isClient, getCurrentTimestamp]);

  // ==========================================
  // Word Management - بدون تغيير
  // ==========================================
  const addWord = useCallback((
    wordData: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>
  ) => {
    if (!isClient) return;

    const newWord: Word = {
      ...wordData,
      id: getNextWordId(),
      lastReviewed: getCurrentTimestamp(),
      correctCount: 0,
      incorrectCount: 0,
      nextReview: getCurrentTimestamp(),
      easeFactor: 2.5,
      interval: 1,
      repetition: 0,
    };

    setWords(prevWords => [...prevWords, newWord]);

    if (!categories.includes(wordData.category)) {
      setCategories(prev => [...prev, wordData.category]);
    }
  }, [isClient, getNextWordId, getCurrentTimestamp, setWords, categories, setCategories]);

  const updateWord = useCallback((id: number, updates: Partial<Word>) => {
    if (!isClient) return;

    setWords(prevWords =>
      prevWords.map(word =>
        word.id === id ? { ...word, ...updates } : word
      )
    );
  }, [isClient, setWords]);

  const deleteWord = useCallback((id: number) => {
    if (!isClient) return;
    setWords(prevWords => prevWords.filter(word => word.id !== id));
  }, [isClient, setWords]);

  // ==========================================
  // Progress Tracking - محسن
  // ==========================================
  const updateProgress = useCallback((wordId: number, correct: boolean) => {
    if (!isClient) return;

    const quality = correct ? 4 : 2;
    updateProgressWithQuality(wordId, quality);
  }, [isClient]);

  const updateProgressWithQuality = useCallback((wordId: number, quality: number) => {
    if (!isClient) return;

    setWords(prevWords =>
      prevWords.map(word => {
        if (word.id !== wordId) return word;

        const now = getCurrentTimestamp();
        const { interval, repetition, easeFactor } = calculateSM2Enhanced(word, quality);

        return {
          ...word,
          lastReviewed: now,
          nextReview: now + (interval * 24 * 60 * 60 * 1000),
          correctCount: quality >= 3 ? word.correctCount + 1 : word.correctCount,
          incorrectCount: quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
          interval,
          repetition,
          easeFactor,
          quality,
        };
      })
    );
  }, [isClient, setWords, getCurrentTimestamp]);

  // ==========================================
  // Category Management - بدون تغيير
  // ==========================================
  const addCategory = useCallback(
    (newCategory: string) => {
      if (!isClient) return;

      const trimmedCategory = newCategory.trim();
      if (trimmedCategory && !categories.includes(trimmedCategory)) {
        setCategories((prev) => [...prev, trimmedCategory]);
      }
    },
    [categories, setCategories, isClient]
  );

  //  حذف تصنيف 🗑️
  const deleteCategory = useCallback(
    (categoryToDelete: string) => {
      if (!isClient) return;

      // التحقق من وجود كلمات تستخدم هذا التصنيف
      const wordsUsingCategory = words.filter(
        (word) => word.category === categoryToDelete
      );

      if (wordsUsingCategory.length > 0) {
        const confirmDelete = confirm(
          `يوجد ${wordsUsingCategory.length} كلمات تستخدم تصنيف "${categoryToDelete}". هل تريد نقلها إلى "عام" وحذف التصنيف؟`
        );

        if (!confirmDelete) return;

        // نقل الكلمات إلى تصنيف "عام"
        setWords((prevWords) =>
          prevWords.map((word) =>
            word.category === categoryToDelete
              ? { ...word, category: 'عام' }
              : word
          )
        );

        // إضافة "عام" للتصنيفات إذا لم يكن موجود
        setCategories((prevCategories) => {
          const newCategories = prevCategories.filter(
            (cat) => cat !== categoryToDelete
          );
          if (!newCategories.includes('عام')) {
            newCategories.unshift('عام');
          }
          return newCategories;
        });
      } else {
        // حذف التصنيف مباشرة إذا لم تكن هناك كلمات تستخدمه
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat !== categoryToDelete)
        );
      }
    },
    [words, setWords, setCategories, isClient]
  );
  // ==========================================
  // Data Management
  // ==========================================
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
      masteredWords: words.filter((w) => w.repetition >= 3 && w.interval >= 21)
        .length,
      studySessions: [], // يمكن إضافة بيانات الجلسات لاحقاً
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluid-cards-backup-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [words, categories, getCurrentTimestamp, isClient]);

  // ⚡ استيراد البيانات
  const importData = useCallback(
    async (data: any): Promise<boolean> => {
      if (!isClient) return false;

      try {
        if (!data || !data.words || !Array.isArray(data.words)) {
          return false;
        }

        // التحقق من صحة البيانات
        const validWords = data.words
          .filter(
            (word: any) =>
              word &&
              typeof word === 'object' &&
              word.word &&
              word.meaning &&
              word.category &&
              word.difficulty &&
              typeof word.id === 'number'
          )
          .map((word: any) => ({
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
        return false;
      }
    },
    [setWords, setCategories, isClient]
  );

  // ==========================================
  // Test Management
  // ==========================================

  // 🔥 التحقق من صحة إعدادات الاختبار
  const validateTest = useCallback((settings: TestSettings): TestValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestedFixes: string[] = [];

    // التحقق من الكلمات المتاحة
    let availableWords = words;

    if (settings.categories.length > 0) {
      availableWords = availableWords.filter(w => settings.categories.includes(w.category));
    }

    if (settings.difficulties.length > 0 && !settings.difficulties.includes('all')) {
      availableWords = availableWords.filter(w => 
        settings.difficulties.includes(w.difficulty as DifficultyFilter)
      );
    }

    if (availableWords.length === 0) {
      errors.push('لا توجد كلمات تطابق المعايير المحددة');
      suggestedFixes.push('قم بتوسيع معايير الفلترة أو إضافة كلمات جديدة');
    }

    if (availableWords.length < settings.questionCount) {
      warnings.push(`عدد الكلمات المتاحة (${availableWords.length}) أقل من عدد الأسئلة المطلوب (${settings.questionCount})`);
      suggestedFixes.push(`قلل عدد الأسئلة إلى ${availableWords.length} أو أضف كلمات أكثر`);
    }

    // التحقق من إعدادات المطابقة
    if (settings.type === 'matching' && availableWords.length < 4) {
      errors.push('اختبار المطابقة يحتاج على الأقل 4 كلمات');
      suggestedFixes.push('أضف كلمات أكثر أو اختر نوع اختبار آخر');
    }

    // التحقق من الوقت
    if (settings.timeLimit && settings.timeLimit < 30) {
      warnings.push('الوقت المحدد قصير جداً');
      suggestedFixes.push('فكر في زيادة الوقت إلى دقيقتين على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestedFixes,
    };
  }, [words]);

  // 🔥 إنشاء اختبار محسن
  const createTest = useCallback((settings: TestSettings): Test => {
    if (!isClient) throw new Error('Not on client side');

    // التحقق من صحة الإعدادات
    const validation = validateTest(settings);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // فلترة الكلمات حسب الإعدادات
    let availableWords = [...words];

    if (settings.categories.length > 0) {
      availableWords = availableWords.filter(w =>
        settings.categories.includes(w.category)
      );
    }

    if (settings.difficulties.length > 0 && !settings.difficulties.includes('all')) {
      availableWords = availableWords.filter(w =>
        settings.difficulties.includes(w.difficulty as DifficultyFilter)
      );
    }

    // 🔥 تحسين: اختيار ذكي للكلمات
    let selectedWords: Word[] = [];

    if (settings.balanceDifficulty) {
      // توزيع متوازن للصعوبات
      const easyWords = availableWords.filter(w => w.difficulty === 'سهل');
      const mediumWords = availableWords.filter(w => w.difficulty === 'متوسط');
      const hardWords = availableWords.filter(w => w.difficulty === 'صعب');

      const perGroup = Math.ceil(settings.questionCount / 3);
      selectedWords = [
        ...easyWords.slice(0, perGroup),
        ...mediumWords.slice(0, perGroup),
        ...hardWords.slice(0, perGroup),
      ].slice(0, settings.questionCount);
    } else if (settings.prioritizeWeak) {
      // أولوية للكلمات الضعيفة
      availableWords.sort((a, b) => {
        const aScore = a.correctCount / Math.max(1, a.correctCount + a.incorrectCount);
        const bScore = b.correctCount / Math.max(1, b.correctCount + b.incorrectCount);
        return aScore - bScore;
      });
      selectedWords = availableWords.slice(0, settings.questionCount);
    } else {
      // الطريقة العادية مع تحسين
      if (settings.randomOrder) {
        // خلط ذكي يضمن عدم التكرار
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        selectedWords = shuffled.slice(0, settings.questionCount);
      } else {
        selectedWords = availableWords.slice(0, settings.questionCount);
      }
    }

    // 🔥 إنشاء أسئلة محسن
    let questions: TestQuestion[] = [];

    if (settings.type === 'mixed') {
      questions = generateMixedQuestions(selectedWords, settings.questionCount);
    } else {
      questions = selectedWords.map(word => generateQuestionByType(word, settings.type, selectedWords));
    }

    // إنشاء الاختبار
    const test: Test = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `اختبار ${getTestTypeName(settings.type)} - ${new Date().toLocaleDateString('ar-SA')}`,
      description: `اختبار يحتوي على ${questions.length} سؤال`,
      settings,
      questions,
      createdAt: Date.now(),
      isActive: false,
      attempts: 0,
    };

    return test;
  }, [words, isClient, validateTest]);

  // 🔥 دوال مساعدة لإنشاء الأسئلة
  const generateMixedQuestions = (words: Word[], questionCount: number): TestQuestion[] => {
    const questions: TestQuestion[] = [];
    const availableTypes: TestType[] = ['multiple_choice', 'typing', 'true_false'];

    if (words.length >= 4) {
      availableTypes.push('matching');
    }

    for (let i = 0; i < questionCount && i < words.length; i++) {
      const word = words[i];
      let questionType: TestType;

      // توزيع متوازن للأنواع
      if (i % 4 === 0) questionType = 'multiple_choice';
      else if (i % 4 === 1) questionType = 'typing';
      else if (i % 4 === 2) questionType = 'true_false';
      else questionType = availableTypes.includes('matching') ? 'matching' : 'multiple_choice';

      const question = generateQuestionByType(word, questionType, words);
      questions.push(question);
    }

    return questions;
  };

  const generateQuestionByType = (word: Word, type: TestType, allWords: Word[]): TestQuestion => {
    switch (type) {
      case 'multiple_choice':
        return EnhancedQuestionGenerator.generateMultipleChoice(word, allWords);
      case 'typing':
        return EnhancedQuestionGenerator.generateTypingQuestion(word);
      case 'true_false':
        return EnhancedQuestionGenerator.generateTrueFalseQuestion(word, allWords);
      case 'matching':
        return EnhancedQuestionGenerator.generateMatchingQuestion(allWords.slice(0, 6));
      default:
        return EnhancedQuestionGenerator.generateMultipleChoice(word, allWords);
    }
  };

  const getTestTypeName = (type: string): string => {
    const names = {
      multiple_choice: 'الاختيار المتعدد',
      typing: 'الكتابة',
      matching: 'المطابقة',
      true_false: 'صح وخطأ',
      mixed: 'مختلط',
    };
    return names[type as keyof typeof names] || 'عام';
  };

  // باقي وظائف إدارة الاختبارات - محسنة
  const startTest = useCallback((testId: string) => {
    if (!isClient) return;

    setTests(prevTests =>
      prevTests.map(test => ({
        ...test,
        isActive: test.id === testId,
      }))
    );
  }, [setTests, isClient]);

  const submitTestResults = useCallback((testId: string, results: TestResults) => {
    if (!isClient) return;

    setTests(prevTests =>
      prevTests.map(test =>
        test.id === testId
          ? {
              ...test,
              results,
              completedAt: Date.now(),
              isActive: false,
              attempts: (test.attempts || 0) + 1,
              bestScore: Math.max(test.bestScore || 0, results.percentage),
            }
          : test
      )
    );

    // تحديث تقدم الكلمات بناءً على النتائج
    results.questionsData.forEach(question => {
      if (question.isCorrect !== undefined) {
        const quality = calculateQuestionQuality(question, results);
        updateProgressWithQuality(question.wordId, quality);
      }
    });
  }, [setTests, isClient, updateProgressWithQuality]);

  // حساب جودة الإجابة للSM-2
  const calculateQuestionQuality = (question: TestQuestion, results: TestResults): number => {
    if (question.isCorrect === undefined) return 2;
    
    let baseQuality = question.isCorrect ? 4 : 2;
    
    // تعديل حسب وقت الإجابة
    if (question.timeSpent && results.averageTimePerQuestion > 0) {
      const timeRatio = question.timeSpent / results.averageTimePerQuestion;
      
      if (question.isCorrect) {
        if (timeRatio <= 0.5) baseQuality = 5;      // سريع جداً
        else if (timeRatio <= 0.8) baseQuality = 4; // سريع
        else if (timeRatio >= 1.5) baseQuality = 3; // بطيء
      }
    }
    
    // تعديل حسب نوع السؤال
    switch (question.type) {
      case 'typing':
        baseQuality += 0.5; // أصعب
        break;
      case 'multiple_choice':
        baseQuality -= 0.3; // أسهل
        break;
      case 'true_false':
        baseQuality -= 0.2; // أسهل
        break;
    }
    
    return Math.max(0, Math.min(5, baseQuality));
  };

  const getTestHistory = useCallback(() => tests, [tests]);

  const deleteTest = useCallback((testId: string) => {
    if (!isClient) return;
    setTests(prevTests => prevTests.filter(test => test.id !== testId));
  }, [isClient, setTests]);

  const getActiveTest = useCallback(() => {
    return tests.find(test => test.isActive) || null;
  }, [tests]);

  const getTestStats = useMemo(() => {
    if (!isClient) return {
      totalTests: 0,
      completedTests: 0,
      averageScore: 0,
      bestScore: 0,
      totalTestTime: 0,
    };

    const completedTests = tests.filter(test => test.results);
    const scores = completedTests.map(test => test.results!.percentage);
    
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const totalTestTime = completedTests.reduce(
      (sum, test) => sum + (test.results!.timeSpent || 0),
      0
    );

    return {
      totalTests: tests.length,
      completedTests: completedTests.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      totalTestTime,
    };
  }, [tests, isClient]);

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
    deleteCategory,

    // Data Management
    exportData,
    importData,

    // Test Management
    createTest,
    validateTest,
    startTest,
    submitTestResults,
    getTestHistory,
    deleteTest,
    getActiveTest,
    getTestStats,
    saveTestToHistory,
  };

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