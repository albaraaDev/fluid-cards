// src/context/AppContext.tsx
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Word } from '@/types/flashcard';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';

const DEFAULT_CATEGORIES = ['عام', 'أعمال', 'تقنية', 'طبيعة', 'رياضة'];

const DEFAULT_WORDS: Word[] = [
  {
    id: 1,
    word: 'Serendipity',
    meaning: 'صدفة سعيدة، اكتشاف غير متوقع لشيء جميل',
    note: 'Finding this app was pure serendipity!',
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
    word: 'Resilience',
    meaning: 'المرونة، القدرة على التعافي من الصعوبات',
    note: 'Her resilience helped her overcome all challenges.',
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

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
    };
  }, [words]);

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

  // تحديث كلمة
  const updateWord = (updatedWord: Word) => {
    setWords((prev) =>
      prev.map((word) => (word.id === updatedWord.id ? updatedWord : word))
    );
  };

  // حذف كلمة
  const deleteWord = (id: number) => {
    setWords((prev) => prev.filter((word) => word.id !== id));
  };

  // تحديث تقدم الكلمة بنظام Quality (SM-2)
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
    // تحويل true/false إلى نظام 0-5
    const quality = correct ? 4 : 2; // 4 = جيد، 2 = صعب
    updateProgressWithQuality(wordId, quality);
  };

  // إضافة تصنيف جديد
  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  // تصدير البيانات
  const exportData = () => {
    try {
      const dataToExport = {
        words,
        categories,
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

  const value: AppContextType = {
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
