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

  // الأفعال - Categories
  addCategory: (newCategory: string) => void;

  // الأفعال - البيانات
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

// Types للتعامل مع المكررات
interface DuplicateMatch {
  importedWord: Word;
  existingWord: Word;
  matchType: 'exact' | 'word' | 'meaning';
  similarity: number;
}

interface DuplicateResolution {
  action: 'merge' | 'replace' | 'skip' | 'keep_both';
  wordId: number;
}

// دالة للتحقق من صحة بيانات الكلمة
const validateWord = (word: any): boolean => {
  if (!word || typeof word !== 'object') return false;
  if (typeof word.id !== 'number') return false;
  if (typeof word.word !== 'string' || word.word.trim() === '') return false;
  if (typeof word.meaning !== 'string' || word.meaning.trim() === '')
    return false;
  if (typeof word.category !== 'string' || word.category.trim() === '')
    return false;

  const validDifficulties = ['سهل', 'متوسط', 'صعب'];
  if (!validDifficulties.includes(word.difficulty)) return false;

  if (typeof word.lastReviewed !== 'number' || word.lastReviewed < 0)
    return false;
  if (typeof word.correctCount !== 'number' || word.correctCount < 0)
    return false;
  if (typeof word.incorrectCount !== 'number' || word.incorrectCount < 0)
    return false;
  if (typeof word.nextReview !== 'number' || word.nextReview < 0) return false;

  return true;
};

// دالة للبحث عن المكررات
const findDuplicates = (
  importedWords: Word[],
  existingWords: Word[]
): DuplicateMatch[] => {
  const duplicates: DuplicateMatch[] = [];

  importedWords.forEach((importedWord) => {
    existingWords.forEach((existingWord) => {
      let matchType: DuplicateMatch['matchType'] | null = null;
      let similarity = 0;

      const importedWordLower = importedWord.word.toLowerCase().trim();
      const existingWordLower = existingWord.word.toLowerCase().trim();
      const importedMeaningLower = importedWord.meaning.toLowerCase().trim();
      const existingMeaningLower = existingWord.meaning.toLowerCase().trim();

      // مقارنة دقيقة (نفس الكلمة والمعنى)
      if (
        importedWordLower === existingWordLower &&
        importedMeaningLower === existingMeaningLower
      ) {
        matchType = 'exact';
        similarity = 100;
      }
      // مقارنة الكلمة فقط
      else if (importedWordLower === existingWordLower) {
        matchType = 'word';
        similarity = 80;
      }
      // مقارنة المعنى فقط
      else if (importedMeaningLower === existingMeaningLower) {
        matchType = 'meaning';
        similarity = 70;
      }

      if (matchType) {
        duplicates.push({
          importedWord,
          existingWord,
          matchType,
          similarity,
        });
      }
    });
  });

  return duplicates;
};

// دالة لدمج بيانات كلمتين
const mergeWords = (importedWord: Word, existingWord: Word): Word => {
  return {
    ...existingWord, // نحتفظ بالـ ID الأصلي
    word: importedWord.word || existingWord.word,
    meaning: importedWord.meaning || existingWord.meaning,
    note: importedWord.note || existingWord.note,
    category: importedWord.category || existingWord.category,
    difficulty: importedWord.difficulty || existingWord.difficulty,

    // نأخذ أفضل إحصائيات
    correctCount: Math.max(
      importedWord.correctCount,
      existingWord.correctCount
    ),
    incorrectCount: Math.min(
      importedWord.incorrectCount,
      existingWord.incorrectCount
    ),
    lastReviewed: Math.max(
      importedWord.lastReviewed,
      existingWord.lastReviewed
    ),

    // نأخذ أفضل بيانات SM-2
    easeFactor: Math.max(importedWord.easeFactor, existingWord.easeFactor),
    interval: Math.max(importedWord.interval, existingWord.interval),
    repetition: Math.max(importedWord.repetition, existingWord.repetition),
    nextReview: Math.min(importedWord.nextReview, existingWord.nextReview),
    quality: importedWord.quality || existingWord.quality,
  };
};

// دالة لعرض dialog المكررات
const showDuplicatesDialog = (
  duplicates: DuplicateMatch[]
): Promise<DuplicateResolution[]> => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4';

    modal.innerHTML = `
      <div class="bg-gray-800 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">كلمات مكررة محتملة</h2>
          <p class="text-gray-400">وُجدت ${
            duplicates.length
          } كلمات قد تكون مكررة. اختر الإجراء لكل كلمة:</p>
        </div>
        
        <div class="space-y-4 mb-6" id="duplicates-list">
          ${duplicates
            .map(
              (duplicate, index) => `
            <div class="bg-gray-700/50 rounded-2xl p-4 border border-gray-600/50">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div class="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30">
                  <h4 class="text-blue-400 font-semibold mb-2">🆕 الكلمة المستوردة</h4>
                  <p class="text-white font-bold text-lg">${
                    duplicate.importedWord.word
                  }</p>
                  <p class="text-gray-300 mb-2">${
                    duplicate.importedWord.meaning
                  }</p>
                  <div class="text-xs text-gray-400">
                    ${duplicate.importedWord.category} • ${
                duplicate.importedWord.difficulty
              } • تكرارات: ${duplicate.importedWord.repetition}
                  </div>
                </div>
                
                <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
                  <h4 class="text-gray-400 font-semibold mb-2">📚 الكلمة الموجودة</h4>
                  <p class="text-white font-bold text-lg">${
                    duplicate.existingWord.word
                  }</p>
                  <p class="text-gray-300 mb-2">${
                    duplicate.existingWord.meaning
                  }</p>
                  <div class="text-xs text-gray-400">
                    ${duplicate.existingWord.category} • ${
                duplicate.existingWord.difficulty
              } • تكرارات: ${duplicate.existingWord.repetition}
                  </div>
                </div>
              </div>
              
              <div class="mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm ${
                  duplicate.matchType === 'exact'
                    ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                    : duplicate.matchType === 'word'
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                    : 'bg-orange-900/30 text-orange-400 border border-orange-800/50'
                }">
                  ${
                    duplicate.matchType === 'exact'
                      ? '🎯 تطابق كامل'
                      : duplicate.matchType === 'word'
                      ? '📝 نفس الكلمة'
                      : '💭 نفس المعنى'
                  } (${duplicate.similarity}%)
                </span>
              </div>
              
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <button type="button" class="action-btn bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-xl text-sm font-medium transition-all" 
                        data-action="merge" data-index="${index}">
                  🔄 دمج البيانات
                </button>
                <button type="button" class="action-btn bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-sm font-medium transition-all" 
                        data-action="replace" data-index="${index}">
                  ⚡ استبدال
                </button>
                <button type="button" class="action-btn bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-sm font-medium transition-all" 
                        data-action="skip" data-index="${index}">
                  ❌ تجاهل
                </button>
                <button type="button" class="action-btn bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-xl text-sm font-medium transition-all" 
                        data-action="keep_both" data-index="${index}">
                  👥 إبقاء الاثنين
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        
        <div class="border-t border-gray-600 pt-4 mb-4">
          <p class="text-gray-400 text-sm mb-3">إجراءات سريعة:</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" id="merge-all" class="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all">
              🔄 دمج الكل
            </button>
            <button type="button" id="skip-all" class="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all">
              ❌ تجاهل الكل
            </button>
            <button type="button" id="keep-all" class="bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-xl text-sm font-medium transition-all">
              👥 إبقاء الكل
            </button>
          </div>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button type="button" id="confirm-duplicates" class="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-8 py-3 rounded-2xl font-semibold transition-all">
            ✅ تطبيق الإجراءات
          </button>
          <button type="button" id="cancel-import" class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-8 py-3 rounded-2xl font-semibold transition-all">
            ❌ إلغاء الاستيراد
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const userChoices: { [key: number]: DuplicateResolution['action'] } = {};

    const updateAllButtons = (action: string) => {
      modal.querySelectorAll('.action-btn').forEach((btn) => {
        btn.classList.remove('ring-2', 'ring-white/50');
        if (btn.getAttribute('data-action') === action) {
          btn.classList.add('ring-2', 'ring-white/50');
        }
      });
    };

    modal.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains('action-btn')) {
        const action = target.dataset.action as DuplicateResolution['action'];
        const index = parseInt(target.dataset.index!);

        userChoices[index] = action;

        const container = target.parentElement!;
        container.querySelectorAll('.action-btn').forEach((btn) => {
          btn.classList.remove('ring-2', 'ring-white/50');
        });
        target.classList.add('ring-2', 'ring-white/50');
      } else if (target.id === 'merge-all') {
        duplicates.forEach((_, index) => {
          userChoices[index] = 'merge';
        });
        updateAllButtons('merge');
      } else if (target.id === 'skip-all') {
        duplicates.forEach((_, index) => {
          userChoices[index] = 'skip';
        });
        updateAllButtons('skip');
      } else if (target.id === 'keep-all') {
        duplicates.forEach((_, index) => {
          userChoices[index] = 'keep_both';
        });
        updateAllButtons('keep_both');
      } else if (target.id === 'confirm-duplicates') {
        const missingChoices = duplicates.filter(
          (_, index) => !userChoices[index]
        );
        if (missingChoices.length > 0) {
          alert(
            `يرجى اختيار إجراء لجميع الكلمات المكررة (${missingChoices.length} متبقية)`
          );
          return;
        }

        const resolutions: DuplicateResolution[] = duplicates.map(
          (duplicate, index) => ({
            action: userChoices[index],
            wordId: duplicate.existingWord.id,
          })
        );

        document.body.removeChild(modal);
        resolve(resolutions);
      } else if (target.id === 'cancel-import') {
        document.body.removeChild(modal);
        resolve([]);
      }
    });
  });
};

// SM-2 Algorithm Implementation
const calculateSM2 = (
  word: Word,
  quality: number
): { interval: number; repetition: number; easeFactor: number } => {
  let { interval, repetition, easeFactor } = word;

  // إذا كانت الإجابة صعبة (quality < 3)، إعادة البداية
  if (quality < 3) {
    repetition = 0;
    interval = 1;
    // 🔥 إصلاح: لا نُحدث easeFactor للإجابات الصعبة!
    // easeFactor يبقى كما هو عند الفشل
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

    // 🔥 إصلاح: حدث easeFactor فقط للإجابات الصحيحة (quality >= 3)
    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // الحد الأدنى لعامل السهولة
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
  const [words, setWords] = useLocalStorage<Word[]>(
    'flashcard_words',
    DEFAULT_WORDS
  );
  const [categories, setCategories] = useLocalStorage<string[]>(
    'flashcard_categories',
    DEFAULT_CATEGORIES
  );

  const getCurrentTimestamp = () => Date.now();
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
    const currentTime = getCurrentTimestamp();
    const totalWords = words.length;

    const masteredWords = words.filter(
      (w) => w.repetition >= 3 && w.interval >= 21
    ).length;

    // 🔥 إصلاح: استخدام currentTime موحد
    const wordsNeedingReview = words.filter(
      (w) => w.nextReview <= currentTime
    ).length;
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
  const addWord = (
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

    setWords((prev) => [...prev, newWord]);
  };

  // تحديث كلمة موجودة
  const updateWord = (updatedWord: Word) => {
    setWords((prev) =>
      prev.map((word) => (word.id === updatedWord.id ? updatedWord : word))
    );
  };

  // حذف كلمة
  const deleteWord = (id: number) => {
    setWords((prev) => prev.filter((word) => word.id !== id));
  };

  // تحديث تقدم الكلمة مع خوارزمية SM-2 المحسنة
  const updateProgressWithQuality = (wordId: number, quality: number) => {
    setWords((prev) =>
      prev.map((word) => {
        if (word.id !== wordId) return word;

        // حساب الفترة الجديدة باستخدام SM-2
        const sm2Result = calculateSM2(word, quality);

        // تحويل الفترة من أيام إلى ميلي ثانية
        const nextReviewDelay = sm2Result.interval * 24 * 60 * 60 * 1000;

        return {
          ...word,
          correctCount:
            quality >= 3 ? word.correctCount + 1 : word.correctCount,
          incorrectCount:
            quality < 3 ? word.incorrectCount + 1 : word.incorrectCount,
          lastReviewed: Date.now(),
          nextReview: Date.now() + nextReviewDelay,
          quality,
          easeFactor: sm2Result.easeFactor,
          interval: sm2Result.interval,
          repetition: sm2Result.repetition,
        };
      })
    );
  };

  // تحديث تقدم الكلمة (للتوافق مع النظام القديم)
  const updateProgress = (wordId: number, correct: boolean) => {
    const quality = correct ? 4 : 2;
    updateProgressWithQuality(wordId, quality);
  };

  // إضافة تصنيف جديد
  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
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

  // دالة لتصحيح وتحديث بيانات الكلمة
  const sanitizeWord = (word: any): Word => {
    return {
      id: Number(word.id),
      word: String(word.word).trim(),
      meaning: String(word.meaning).trim(),
      note: word.note ? String(word.note).trim() : undefined,
      category: String(word.category).trim(),
      difficulty: word.difficulty || 'متوسط',
      lastReviewed: Number(word.lastReviewed) || Date.now(),
      correctCount: Math.max(0, Number(word.correctCount) || 0),
      incorrectCount: Math.max(0, Number(word.incorrectCount) || 0),
      nextReview: Number(word.nextReview) || Date.now(),

      // SM-2 Algorithm Fields - مع قيم افتراضية آمنة
      easeFactor: Math.max(1.3, Math.min(3.0, Number(word.easeFactor) || 2.5)),
      interval: Math.max(1, Math.min(180, Number(word.interval) || 1)),
      repetition: Math.max(0, Number(word.repetition) || 0),
      quality:
        word.quality !== undefined
          ? Math.max(0, Math.min(5, Number(word.quality)))
          : undefined,
    };
  };

  // استيراد البيانات - النسخة المحسنة

  const importData = async (data: any): Promise<boolean> => {
    try {
      // التحقق من البنية الأساسية
      if (!data || typeof data !== 'object') {
        throw new Error('ملف غير صالح: البيانات مفقودة');
      }

      if (!data.words || !Array.isArray(data.words)) {
        throw new Error('ملف غير صالح: قائمة الكلمات مفقودة أو غير صحيحة');
      }

      // تحقق من إصدار التطبيق
      const appVersion = data.appVersion || data.version || '1.0';
      console.log(`استيراد بيانات من إصدار: ${appVersion}`);

      // فلترة الكلمات الصحيحة فقط
      const validWords: Word[] = [];
      const invalidWords: any[] = [];

      for (let i = 0; i < data.words.length; i++) {
        const word = data.words[i];

        if (validateWord(word)) {
          validWords.push(sanitizeWord(word));
        } else {
          invalidWords.push({ index: i, word });
          console.warn(`كلمة غير صحيحة في الفهرس ${i}:`, word);
        }
      }

      // التحقق من وجود كلمات صحيحة
      if (validWords.length === 0) {
        throw new Error('لا توجد كلمات صحيحة في الملف');
      }

      // التحقق من التصنيفات
      let categories = DEFAULT_CATEGORIES;
      if (data.categories && Array.isArray(data.categories)) {
        const validCategories = data.categories.filter(
          (cat: any) => typeof cat === 'string' && cat.trim() !== ''
        );
        categories =
          validCategories.length > 0 ? validCategories : DEFAULT_CATEGORIES;
      }

      // فحص المكررات
      const duplicates = findDuplicates(validWords, words);

      let finalWordsToImport = validWords;
      const wordsToUpdate: Word[] = [];
      let duplicatesCount = 0;

      if (duplicates.length > 0) {
        // عرض dialog للمستخدم
        const resolutions = await showDuplicatesDialog(duplicates);

        // إذا ألغى المستخدم
        if (resolutions.length === 0) {
          console.log('تم إلغاء الاستيراد من قبل المستخدم');
          return false;
        }

        // تطبيق قرارات المستخدم
        const processedWordIds = new Set<number>();
        duplicatesCount = resolutions.length;

        resolutions.forEach((resolution, index) => {
          const duplicate = duplicates[index];

          switch (resolution.action) {
            case 'merge':
              const mergedWord = mergeWords(
                duplicate.importedWord,
                duplicate.existingWord
              );
              wordsToUpdate.push(mergedWord);
              processedWordIds.add(duplicate.importedWord.id);
              break;

            case 'replace':
              const replacementWord = {
                ...duplicate.importedWord,
                id: duplicate.existingWord.id,
              };
              wordsToUpdate.push(replacementWord);
              processedWordIds.add(duplicate.importedWord.id);
              break;

            case 'skip':
              processedWordIds.add(duplicate.importedWord.id);
              break;

            case 'keep_both':
              // لا نضيف للـ processedWordIds عشان تبقى في القائمة
              break;
          }
        });

        // إزالة الكلمات المعالجة من قائمة الاستيراد
        finalWordsToImport = validWords.filter(
          (word) => !processedWordIds.has(word.id)
        );
      }

      // حل تداخل الـ IDs للكلمات المتبقية
      const existingIds = new Set(words.map((w) => w.id));
      let maxId = words.length > 0 ? Math.max(...words.map((w) => w.id)) : 0;

      const importedWords = finalWordsToImport.map((word) => {
        if (existingIds.has(word.id)) {
          maxId += 1;
          return { ...word, id: maxId };
        }
        return word;
      });

      // تحديث البيانات
      if (wordsToUpdate.length > 0) {
        // تحديث الكلمات المدموجة/المستبدلة
        setWords((prevWords) =>
          prevWords.map((word) => {
            const update = wordsToUpdate.find((w) => w.id === word.id);
            return update || word;
          })
        );
      }

      if (importedWords.length > 0) {
        // إضافة الكلمات الجديدة
        setWords((prevWords) => [...prevWords, ...importedWords]);
      }

      // دمج التصنيفات
      setCategories((prevCategories) => {
        const newCategories = categories.filter(
          (cat) => !prevCategories.includes(cat)
        );
        return [...prevCategories, ...newCategories];
      });

      // إظهار تقرير مفصل
      const totalProcessed = importedWords.length + wordsToUpdate.length;
      const message = `
✅ تم استيراد البيانات بنجاح!

📊 الإحصائيات:
• كلمات جديدة: ${importedWords.length}
• كلمات محدثة/مدموجة: ${wordsToUpdate.length}
• مجموع المعالج: ${totalProcessed}
${
  duplicatesCount > 0 ? `• كلمات مكررة تم التعامل معها: ${duplicatesCount}` : ''
}
${invalidWords.length > 0 ? `• كلمات مرفوضة: ${invalidWords.length}` : ''}

${duplicatesCount > 0 ? '🔄 تم التعامل مع الكلمات المكررة حسب اختيارك' : ''}
${invalidWords.length > 0 ? '⚠️ تم تجاهل الكلمات غير الصحيحة' : ''}
    `.trim();

      alert(message);

      console.log('تقرير الاستيراد:', {
        imported: importedWords.length,
        updated: wordsToUpdate.length,
        duplicates: duplicatesCount,
        rejected: invalidWords.length,
        newCategories: categories.filter(
          (cat) => !DEFAULT_CATEGORIES.includes(cat)
        ),
        invalidWords,
      });

      return true;
    } catch (err) {
      console.error('خطأ في استيراد البيانات:', err);

      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      alert(
        `❌ فشل استيراد البيانات!\n\n${errorMessage}\n\nتأكد من أن الملف تم تصديره من نفس التطبيق.`
      );

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
