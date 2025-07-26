// src/app/page.tsx
'use client';

import BottomNavigation from '@/components/BottomNavigation';
import CardsView from '@/components/CardsView';
import Dashboard from '@/components/Dashboard';
import EditWordModal from '@/components/EditWordModal';
import SimpleHeader from '@/components/SimpleHeader';
import SlideUpAddForm from '@/components/SlideUpAddForm';
import StudyView from '@/components/StudyView';
import WordDetailsModal from '@/components/WordDetailsModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Word } from '@/types/flashcard';
import React, { useMemo, useState } from 'react';

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
  },
];

type NavigationTab = 'home' | 'cards' | 'study' | 'stats';

export default function FlashcardApp() {
  // localStorage hooks
  const [words, setWords] = useLocalStorage<Word[]>(
    'flashcard_words',
    DEFAULT_WORDS
  );
  const [categories, setCategories] = useLocalStorage<string[]>(
    'flashcard_categories',
    DEFAULT_CATEGORIES
  );

  // UI state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  // إحصائيات
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter((w) => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter(
      (w) => w.nextReview <= Date.now()
    ).length;

    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0,
    };
  }, [words]);

  // إضافة كلمة جديدة
  const handleAddWord = (newWordData: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview'>) => {
    const newWord: Word = {
      ...newWordData,
      id: Date.now(),
      lastReviewed: Date.now(),
      correctCount: 0,
      incorrectCount: 0,
      nextReview: Date.now(),
    };

    setWords(prev => [...prev, newWord]);
  };

  // إضافة تصنيف جديد
  const handleAddCategory = (newCategory: string) => {
    setCategories(prev => [...prev, newCategory]);
  };

  // حذف كلمة
  const handleDeleteWord = (id: number) => {
    setWords(prev => prev.filter(word => word.id !== id));
  };

  // تحديث تقدم الكلمة
  const handleUpdateProgress = (wordId: number, correct: boolean) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;

      const nextReviewDelay = correct ? 
        Math.min(24 * 60 * 60 * 1000 * Math.pow(2, word.correctCount), 30 * 24 * 60 * 60 * 1000) :
        60 * 60 * 1000;

      return {
        ...word,
        correctCount: correct ? word.correctCount + 1 : word.correctCount,
        incorrectCount: correct ? word.incorrectCount : word.incorrectCount + 1,
        lastReviewed: Date.now(),
        nextReview: Date.now() + nextReviewDelay,
      };
    }));
  };

  // تحديث كلمة
  const handleEditWord = (updatedWord: Word) => {
    setWords(prev => 
      prev.map(word => word.id === updatedWord.id ? updatedWord : word)
    );
    setEditingWord(null);
  };

  // تصدير البيانات
  const handleExport = () => {
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
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        if (importedData.words && Array.isArray(importedData.words)) {
          setWords(importedData.words);
          setCategories(importedData.categories || DEFAULT_CATEGORIES);
          setShowImportModal(false);
          alert('تم استيراد البيانات بنجاح!');
        } else {
          alert('ملف غير صالح! تأكد من أنه ملف نسخة احتياطية صحيح.');
        }
      } catch (err) {
        alert(
          'خطأ في قراءة الملف! تأكد من أنه ملف JSON صالح.' +
            (err instanceof Error ? `: ${err.message}` : '')
        );
        console.error('خطأ في استيراد البيانات:', err);
        setShowImportModal(false);
      }

      // إعادة تعيين input
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  // render المحتوى حسب التاب المحدد
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Dashboard
            words={words}
            onWordClick={setSelectedWord}
            onEditWord={setEditingWord}
            onDeleteWord={handleDeleteWord}
          />
        );

      case 'cards':
        return (
          <CardsView
            words={words}
            categories={categories}
            onWordClick={setSelectedWord}
            onEditWord={setEditingWord}
            onDeleteWord={handleDeleteWord}
          />
        );

      case 'study':
        return (
          <StudyView words={words} onUpdateProgress={handleUpdateProgress} />
        );

      case 'stats':
        return (
          <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-8">
                الإحصائيات التفصيلية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-900/30 rounded-2xl border border-blue-800/50">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {stats.totalWords}
                  </div>
                  <div className="text-gray-300">إجمالي الكلمات</div>
                </div>

                <div className="text-center p-6 bg-green-900/30 rounded-2xl border border-green-800/50">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {stats.masteredWords}
                  </div>
                  <div className="text-gray-300">كلمات محفوظة</div>
                </div>

                <div className="text-center p-6 bg-orange-900/30 rounded-2xl border border-orange-800/50">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {stats.wordsNeedingReview}
                  </div>
                  <div className="text-gray-300">تحتاج مراجعة</div>
                </div>

                <div className="text-center p-6 bg-purple-900/30 rounded-2xl border border-purple-800/50">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {stats.progress.toFixed(0)}%
                  </div>
                  <div className="text-gray-300">نسبة الإتقان</div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">
                  توزيع الكلمات حسب التصنيف
                </h3>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryWords = words.filter(w => w.category === category);
                    const percentage = stats.totalWords > 0 ? 
                      (categoryWords.length / stats.totalWords) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-300">{category}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">
                            {categoryWords.length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <SimpleHeader
        onTabChange={setCurrentTab}
        onExport={handleExport}
        onImport={() => setShowImportModal(true)}
      />

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddWord={() => setShowAddForm(true)}
        wordsNeedingReview={stats.wordsNeedingReview}
      />

      {/* Add Word Form */}
      <SlideUpAddForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        categories={categories}
        onAddWord={handleAddWord}
        onAddCategory={handleAddCategory}
      />

      {/* Edit Word Modal */}
      {editingWord && (
        <EditWordModal
          word={editingWord}
          categories={categories}
          onSave={handleEditWord}
          onCancel={() => setEditingWord(null)}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* Word Details Modal */}
      {selectedWord && (
        <WordDetailsModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl p-6 max-w-md w-full border border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                استيراد البيانات
              </h3>
              <p className="text-gray-400 text-sm">
                اختر ملف JSON الذي تم تصديره مسبقاً
              </p>
            </div>

            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-4 rounded-2xl font-semibold cursor-pointer transition-all mb-4"
            >
              اختيار ملف
            </label>

            <button
              onClick={() => setShowImportModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-4 rounded-2xl font-semibold transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}