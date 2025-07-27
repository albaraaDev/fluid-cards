// src/context/AppContext.tsx - تحديث لدعم نظام المجلدات
'use client';

import { createDefaultFolders, migrateCategoryToFolder } from '@/data/defaultFolders';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Folder, FolderStats, Word } from '@/types/flashcard';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';

// الكلمات الافتراضية المحدثة للمجلدات
const DEFAULT_WORDS: Word[] = [
  {
    id: 1,
    word: 'Serendipity',
    meaning: 'صدفة سعيدة، اكتشاف غير متوقع لشيء جميل',
    note: 'Finding this app was pure serendipity!',
    folderId: 'general', // 🔄 تغيير من category إلى folderId
    difficulty: 'متوسط',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
    tags: ['إيجابي', 'مشاعر'], // 🆕 إضافة tags
  },
  {
    id: 2,
    word: 'Resilience',
    meaning: 'المرونة، القدرة على التعافي من الصعوبات',
    note: 'Her resilience helped her overcome all challenges.',
    folderId: 'general',
    difficulty: 'متوسط',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
    tags: ['قوة', 'تحدي'],
  },
  {
    id: 3,
    word: 'Ephemeral',
    meaning: 'عابر، مؤقت، يدوم لفترة قصيرة',
    note: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks.',
    folderId: 'general',
    difficulty: 'صعب',
    lastReviewed: Date.now(),
    correctCount: 0,
    incorrectCount: 0,
    nextReview: Date.now(),
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
    tags: ['وقت', 'طبيعة'],
  },
];

// Types للـ Context المحدث
interface AppContextType {
  // البيانات الأساسية
  words: Word[];
  folders: Folder[];        // 🔄 تغيير من categories إلى folders
  
  // الإحصائيات المحسوبة
  stats: {
    totalWords: number;
    masteredWords: number;
    wordsNeedingReview: number;
    progress: number;
    totalFolders: number;   // 🆕 إضافة عدد المجلدات
  };
  
  // إحصائيات المجلدات
  folderStats: FolderStats[]; // 🆕 إحصائيات تفصيلية للمجلدات
  
  // الأفعال - Words
  addWord: (newWordData: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview' | 'easeFactor' | 'interval' | 'repetition'>) => void;
  updateWord: (updatedWord: Word) => void;
  deleteWord: (id: number) => void;
  updateProgress: (wordId: number, correct: boolean) => void;
  updateProgressWithQuality: (wordId: number, quality: number) => void;
  
  // 🆕 الأفعال - Folders
  addFolder: (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  deleteFolder: (folderId: string) => void;
  moveFolder: (folderId: string, newParentId?: string) => void;
  
  // 🆕 إدارة الكلمات في المجلدات
  moveWordToFolder: (wordId: number, folderId: string) => void;
  moveMultipleWords: (wordIds: number[], folderId: string) => void;
  getWordsInFolder: (folderId: string, includeSubfolders?: boolean) => Word[];
  
  // الأفعال - البيانات (محدثة)
  exportData: () => void;
  importData: (data: any) => Promise<boolean>;
  
  // 🆕 أفعال الترحيل
  migrateFromCategories: () => boolean;
  
  // للتوافق مع النظام القديم
  categories: string[];    // محسوبة من المجلدات
  addCategory: (newCategory: string) => void; // تحويل إلى مجلد
}

// SM-2 Algorithm Implementation (نفس التطبيق الأصلي)
const calculateSM2 = (word: Word, quality: number): { interval: number; repetition: number; easeFactor: number } => {
  let { interval, repetition, easeFactor } = word;
  
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
  }
  
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(easeFactor, 1.3);
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
  const [folders, setFolders] = useLocalStorage<Folder[]>('flashcard_folders', createDefaultFolders());
  const [migrationComplete, setMigrationComplete] = useLocalStorage<boolean>('migration_complete', false);

  // ترحيل البيانات القديمة تلقائياً عند التحميل
  React.useEffect(() => {
    if (!migrationComplete) {
      const legacyCategories = localStorage.getItem('flashcard_categories');
      if (legacyCategories) {
        try {
          const categories = JSON.parse(legacyCategories);
          if (Array.isArray(categories) && categories.length > 0) {
            migrateFromCategories();
          }
        } catch (error) {
          console.error('خطأ في قراءة التصنيفات القديمة:', error);
        }
      }
      setMigrationComplete(true);
    }
  }, [migrationComplete]);

  // حساب الإحصائيات العامة
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter((w) => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter((w) => w.nextReview <= Date.now()).length;
    const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
    const totalFolders = folders.length;

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress,
      totalFolders,
    };
  }, [words, folders]);

  // حساب إحصائيات المجلدات التفصيلية
  const folderStats = useMemo((): FolderStats[] => {
    const buildFolderStats = (parentId?: string): FolderStats[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => {
          const folderWords = words.filter(word => word.folderId === folder.id);
          const subFolderStats = buildFolderStats(folder.id);
          
          // حساب الإحصائيات الفرعية
          const subFolderTotals = subFolderStats.reduce(
            (acc, sub) => ({
              total: acc.total + sub.totalWords,
              mastered: acc.mastered + sub.masteredWords,
              needReview: acc.needReview + sub.needReview,
            }),
            { total: 0, mastered: 0, needReview: 0 }
          );

          const totalWords = folderWords.length + subFolderTotals.total;
          const masteredWords = folderWords.filter(w => w.correctCount >= 3).length + subFolderTotals.mastered;
          const needReview = folderWords.filter(w => w.nextReview <= Date.now()).length + subFolderTotals.needReview;
          const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

          return {
            id: folder.id,
            name: folder.name,
            totalWords,
            masteredWords,
            needReview,
            progress,
            color: folder.color,
            icon: folder.icon,
            subFolders: subFolderStats.length > 0 ? subFolderStats : undefined,
          };
        });
    };

    return buildFolderStats();
  }, [words, folders]);

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
    
    // تحديث عدد الكلمات في المجلد
    updateFolderWordCount(newWord.folderId);
  };

  // تحديث كلمة
  const updateWord = (updatedWord: Word) => {
    setWords(prev => prev.map(word => {
      if (word.id === updatedWord.id) {
        // إذا تغير المجلد، نحديث عدد الكلمات
        if (word.folderId !== updatedWord.folderId) {
          updateFolderWordCount(word.folderId);
          updateFolderWordCount(updatedWord.folderId);
        }
        return updatedWord;
      }
      return word;
    }));
  };

  // حذف كلمة
  const deleteWord = (id: number) => {
    const wordToDelete = words.find(w => w.id === id);
    setWords(prev => prev.filter(word => word.id !== id));
    
    // تحديث عدد الكلمات في المجلد
    if (wordToDelete) {
      updateFolderWordCount(wordToDelete.folderId);
    }
  };

  // تحديث تقدم الكلمة بنظام Quality (SM-2)
  const updateProgressWithQuality = (wordId: number, quality: number) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;

      const sm2Result = calculateSM2(word, quality);
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
    const quality = correct ? 4 : 2;
    updateProgressWithQuality(wordId, quality);
  };

  // 🆕 إضافة مجلد جديد
  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => {
    const now = Date.now();
    const newFolder: Folder = {
      ...folderData,
      id: `folder_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      wordCount: 0,
    };

    setFolders(prev => [...prev, newFolder]);
  };

  // 🆕 تحديث مجلد
  const updateFolder = (folderId: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, ...updates, updatedAt: Date.now() }
        : folder
    ));
  };

  // 🆕 حذف مجلد
  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    // لا يمكن حذف المجلدات الافتراضية
    if (folder.isDefault) {
      alert('❌ لا يمكن حذف المجلدات الافتراضية');
      return;
    }

    // التحقق من وجود كلمات في المجلد
    const wordsInFolder = words.filter(w => w.folderId === folderId);
    if (wordsInFolder.length > 0) {
      alert('❌ لا يمكن حذف مجلد يحتوي على كلمات');
      return;
    }

    // التحقق من وجود مجلدات فرعية
    const subFolders = folders.filter(f => f.parentId === folderId);
    if (subFolders.length > 0) {
      alert('❌ لا يمكن حذف مجلد يحتوي على مجلدات فرعية');
      return;
    }

    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  // 🆕 نقل مجلد
  const moveFolder = (folderId: string, newParentId?: string) => {
    // التحقق من عدم إنشاء دورة لانهائية
    if (newParentId) {
      const isDescendant = (checkId: string, ancestorId: string): boolean => {
        const folder = folders.find(f => f.id === checkId);
        if (!folder || !folder.parentId) return false;
        if (folder.parentId === ancestorId) return true;
        return isDescendant(folder.parentId, ancestorId);
      };

      if (isDescendant(newParentId, folderId)) {
        alert('❌ لا يمكن نقل المجلد إلى أحد مجلداته الفرعية');
        return;
      }
    }

    updateFolder(folderId, { parentId: newParentId });
  };

  // 🆕 نقل كلمة إلى مجلد
  const moveWordToFolder = (wordId: number, folderId: string) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    const oldFolderId = word.folderId;
    updateWord({ ...word, folderId });
    
    // تحديث عدد الكلمات في المجلدين
    updateFolderWordCount(oldFolderId);
    updateFolderWordCount(folderId);
  };

  // 🆕 نقل عدة كلمات إلى مجلد
  const moveMultipleWords = (wordIds: number[], folderId: string) => {
    const affectedFolders = new Set<string>();
    
    setWords(prev => prev.map(word => {
      if (wordIds.includes(word.id)) {
        affectedFolders.add(word.folderId);
        affectedFolders.add(folderId);
        return { ...word, folderId };
      }
      return word;
    }));

    // تحديث عدد الكلمات في جميع المجلدات المتأثرة
    affectedFolders.forEach(fId => updateFolderWordCount(fId));
  };

  // 🆕 الحصول على كلمات في مجلد
  const getWordsInFolder = (folderId: string, includeSubfolders: boolean = false): Word[] => {
    if (!includeSubfolders) {
      return words.filter(word => word.folderId === folderId);
    }

    // جمع جميع المجلدات الفرعية
    const getAllSubfolderIds = (parentId: string): string[] => {
      const subfolders = folders.filter(f => f.parentId === parentId);
      const ids = subfolders.map(f => f.id);
      subfolders.forEach(subfolder => {
        ids.push(...getAllSubfolderIds(subfolder.id));
      });
      return ids;
    };

    const folderIds = [folderId, ...getAllSubfolderIds(folderId)];
    return words.filter(word => folderIds.includes(word.folderId));
  };

  // دالة مساعدة لتحديث عدد الكلمات في المجلد
  const updateFolderWordCount = (folderId: string) => {
    setTimeout(() => {
      setFolders(prev => prev.map(folder => {
        if (folder.id === folderId) {
          const wordCount = words.filter(w => w.folderId === folderId).length;
          return { ...folder, wordCount, updatedAt: Date.now() };
        }
        return folder;
      }));
    }, 100);
  };

  // 🆕 ترحيل البيانات من التصنيفات إلى المجلدات
  const migrateFromCategories = (): boolean => {
    try {
      const legacyCategories = localStorage.getItem('flashcard_categories');
      const legacyWords = localStorage.getItem('flashcard_words');
      
      if (!legacyCategories || !legacyWords) {
        return false;
      }

      const categories: string[] = JSON.parse(legacyCategories);
      const oldWords: any[] = JSON.parse(legacyWords);

      // إنشاء مجلدات من التصنيفات القديمة
      const newFolders: Folder[] = [...createDefaultFolders()];
      const categoryToFolderMap = new Map<string, string>();

      categories.forEach(categoryName => {
        const folder = migrateCategoryToFolder(categoryName);
        // تجنب تكرار المجلدات الافتراضية
        if (!newFolders.some(f => f.name === folder.name)) {
          newFolders.push(folder);
        }
        categoryToFolderMap.set(categoryName, folder.id);
      });

      // ترحيل الكلمات
      const migratedWords: Word[] = oldWords.map(oldWord => {
        const folderId = categoryToFolderMap.get(oldWord.category) || 'general';
        return {
          ...oldWord,
          folderId,
          // إضافة الحقول المفقودة إذا لم تكن موجودة
          easeFactor: oldWord.easeFactor || 2.5,
          interval: oldWord.interval || 1,
          repetition: oldWord.repetition || 0,
          tags: oldWord.tags || [],
        };
      });

      // حفظ البيانات الجديدة
      setFolders(newFolders);
      setWords(migratedWords);

      // حفظ نسخة احتياطية من البيانات القديمة
      localStorage.setItem('backup_legacy_categories', legacyCategories);
      localStorage.setItem('backup_legacy_words', legacyWords);

      console.log('✅ تم ترحيل البيانات بنجاح');
      return true;
    } catch (error) {
      console.error('❌ خطأ في ترحيل البيانات:', error);
      return false;
    }
  };

  // إضافة تصنيف جديد (تحويل إلى مجلد للتوافق)
  const addCategory = (newCategory: string) => {
    const folder = migrateCategoryToFolder(newCategory);
    addFolder(folder);
  };

  // حساب التصنيفات للتوافق مع النظام القديم
  const categories = useMemo(() => {
    return folders.map(folder => folder.name);
  }, [folders]);

  // تصدير البيانات المحدث
  const exportData = () => {
    try {
      const dataToExport = {
        words,
        folders,
        exportedAt: new Date().toISOString(),
        appVersion: '2.1', // إصدار جديد يدعم المجلدات
        totalWords: words.length,
        masteredWords: stats.masteredWords,
        totalFolders: folders.length,
        migrationVersion: 1,
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const element = document.createElement('a');
      const file = new Blob([dataStr], {
        type: 'application/json;charset=utf-8',
      });
      element.href = URL.createObjectURL(file);
      element.download = `بطاقات_تعليمية_v2_${
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

  // استيراد البيانات المحدث
  const importData = async (data: any): Promise<boolean> => {
    try {
      // التحقق من نوع البيانات
      if (data.folders && Array.isArray(data.folders)) {
        // بيانات الإصدار الجديد (مع المجلدات)
        const updatedWords = data.words.map((word: any) => ({
          ...word,
          easeFactor: word.easeFactor || 2.5,
          interval: word.interval || 1,
          repetition: word.repetition || 0,
          tags: word.tags || [],
        }));

        setFolders(data.folders);
        setWords(updatedWords);
        return true;
      } else if (data.words && data.categories) {
        // بيانات الإصدار القديم (مع التصنيفات)
        // ترحيل تلقائي
        const newFolders = [...createDefaultFolders()];
        const categoryToFolderMap = new Map<string, string>();

        data.categories.forEach((categoryName: string) => {
          const folder = migrateCategoryToFolder(categoryName);
          if (!newFolders.some(f => f.name === folder.name)) {
            newFolders.push(folder);
          }
          categoryToFolderMap.set(categoryName, folder.id);
        });

        const migratedWords = data.words.map((oldWord: any) => {
          const folderId = categoryToFolderMap.get(oldWord.category) || 'general';
          return {
            ...oldWord,
            folderId,
            easeFactor: oldWord.easeFactor || 2.5,
            interval: oldWord.interval || 1,
            repetition: oldWord.repetition || 0,
            tags: oldWord.tags || [],
          };
        });

        setFolders(newFolders);
        setWords(migratedWords);
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
    folders,
    stats,
    folderStats,
    addWord,
    updateWord,
    deleteWord,
    updateProgress,
    updateProgressWithQuality,
    addFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    moveWordToFolder,
    moveMultipleWords,
    getWordsInFolder,
    exportData,
    importData,
    migrateFromCategories,
    // للتوافق مع النظام القديم
    categories,
    addCategory,
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