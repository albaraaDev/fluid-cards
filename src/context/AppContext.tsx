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
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter((w) => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter((w) => w.nextReview <= Date.now()).length;
    const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
    };
  }, [words]);

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

    setWords(prev => [...prev, newWord]);
  };

  // تحديث كلمة
  const updateWord = (updatedWord: Word) => {
    setWords(prev => prev.map(word => word.id === updatedWord.id ? updatedWord : word));
  };

  // حذف كلمة
  const deleteWord = (id: number) => {
    setWords(prev => prev.filter(word => word.id !== id));
  };

  // تحديث تقدم الكلمة بنظام Quality (SM-2)
  const updateProgressWithQuality = (wordId: number, quality: number) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;

      // حساب الفترة الجديدة باستخدام SM-2
      const sm2Result = calculateSM2(word, quality);
      
      // تحويل الفترة من أيام إلى ميلي ثانية
      const nextReviewDelay = sm2Result.interval * 24 * 60 * 60 * 1000;

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
    // تحويل true/false إلى نظام 0-5
    const quality = correct ? 4 : 2; // 4 = جيد، 2 = صعب
    updateProgressWithQuality(wordId, quality);
  };

  // إضافة تصنيف جديد
  const addCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
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

  // استيراد البيانات
  const importData = async (data: any): Promise<boolean> => {
    try {
      if (data.words && Array.isArray(data.words)) {
        // تحديث الكلمات القديمة لتشمل حقول SM-2
        const updatedWords = data.words.map((word: any) => ({
          ...word,
          easeFactor: word.easeFactor || 2.5,
          interval: word.interval || 1,
          repetition: word.repetition || 0,
        }));
        
        setWords(updatedWords);
        setCategories(data.categories || DEFAULT_CATEGORIES);
        return true;
      } else {
        throw new Error('ملف غير صالح');
      }
    } catch (err) {
      console.error('خطأ في استيراد البيانات:', err);
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