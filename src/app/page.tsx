// src/app/page.tsx
'use client';

import AddWordForm from '@/components/AddWordForm';
import EditWordModal from '@/components/EditWordModal';
import Header from '@/components/Header';
import WordCard from '@/components/WordCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FilterState, Word } from '@/types/flashcard';
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
    nextReview: Date.now()
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
    nextReview: Date.now()
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
    nextReview: Date.now()
  }
];

export default function FlashcardApp() {
  // استخدام localStorage بدلاً من sessionStorage
  const [words, setWords] = useLocalStorage<Word[]>('flashcard_words', DEFAULT_WORDS);
  const [categories, setCategories] = useLocalStorage<string[]>('flashcard_categories', DEFAULT_CATEGORIES);
  
  // حالات الفلاتر والواجهة
  const [currentView, setCurrentView] = useState<'home' | 'study' | 'stats'>('home');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'الكل',
    difficulty: 'all',
    sortBy: 'newest'
  });
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // تصفية وترتيب الكلمات
  const filteredWords = useMemo(() => {
    const filtered = words.filter(word => {
      const searchMatch = word.word.toLowerCase().includes(filters.search.toLowerCase()) ||
                         word.meaning.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatch = filters.category === 'الكل' || word.category === filters.category;
      const difficultyMatch = filters.difficulty === 'all' || word.difficulty === filters.difficulty;
      
      return searchMatch && categoryMatch && difficultyMatch;
    });

    // ترتيب الكلمات
    switch (filters.sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'difficulty':
        const difficultyOrder = { 'سهل': 1, 'متوسط': 2, 'صعب': 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'nextReview':
        filtered.sort((a, b) => a.nextReview - b.nextReview);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      default: // newest
        filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [words, filters]);

  // إحصائيات
  const stats = useMemo(() => {
    const totalWords = words.length;
    const masteredWords = words.filter(w => w.correctCount >= 3).length;
    const wordsNeedingReview = words.filter(w => w.nextReview <= Date.now()).length;
    
    return {
      totalWords,
      masteredWords,
      wordsNeedingReview,
      progress: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0
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
      nextReview: Date.now()
    };
    
    setWords(prev => [newWord, ...prev]);
  };

  // إضافة تصنيف جديد
  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  // تحديث تقدم الكلمة
  const handleUpdateProgress = (wordId: number, correct: boolean) => {
    setWords(prev => prev.map(word => {
      if (word.id === wordId) {
        const correctCount = correct ? word.correctCount + 1 : word.correctCount;
        const incorrectCount = correct ? word.incorrectCount : word.incorrectCount + 1;
        
        // حساب الفترة التالية للمراجعة (خوارزمية تكرار متباعد بسيطة)
        const multiplier = correct ? Math.pow(2, correctCount) : 0.5;
        const nextReview = Date.now() + (multiplier * 24 * 60 * 60 * 1000); // بالأيام
        
        return {
          ...word,
          correctCount,
          incorrectCount,
          lastReviewed: Date.now(),
          nextReview
        };
      }
      return word;
    }));
  };

  // حذف كلمة
  const handleDeleteWord = (wordId: number) => {
    setWords(prev => prev.filter(word => word.id !== wordId));
  };

  // تعديل كلمة
  const handleEditWord = (updatedWord: Word) => {
    setWords(prev => prev.map(word => 
      word.id === updatedWord.id ? updatedWord : word
    ));
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
        masteredWords: stats.masteredWords
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const element = document.createElement('a');
      const file = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `بطاقات_تعليمية_${new Date().toISOString().split('T')[0]}.json`;
      
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }, 100);
      
    } catch (error) {
      console.error('خطأ في التصدير:', error);
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
        alert('خطأ في قراءة الملف! تأكد من أنه ملف JSON صالح.' + err);
      }
      
      // إعادة تعيين input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  // إعادة تعيين البيانات
  const handleResetData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      setWords(DEFAULT_WORDS);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  // بدء وضع الدراسة
  const startStudyMode = () => {
    const wordsToStudy = words.filter(w => w.nextReview <= Date.now());
    if (wordsToStudy.length === 0) {
      alert('لا توجد كلمات تحتاج للمراجعة الآن!');
      return;
    }
    setStudyMode(true);
    setStudyIndex(0);
  };

  if (studyMode) {
    const wordsToStudy = words.filter(w => w.nextReview <= Date.now());
    const currentWord = wordsToStudy[studyIndex];

    if (!currentWord) {
      setStudyMode(false);
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* شريط التقدم */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">
                {studyIndex + 1} من {wordsToStudy.length}
              </span>
              <button
                onClick={() => setStudyMode(false)}
                className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إنهاء المراجعة
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((studyIndex + 1) / wordsToStudy.length) * 100}%` }}
              />
            </div>
          </div>

          {/* بطاقة الدراسة */}
          <WordCard
            word={currentWord}
            onEdit={() => {}}
            onDelete={() => {}}
            onUpdateProgress={(id, correct) => {
              handleUpdateProgress(id, correct);
              if (studyIndex < wordsToStudy.length - 1) {
                setStudyIndex(prev => prev + 1);
              } else {
                setStudyMode(false);
                alert('تم إنهاء جلسة المراجعة! أحسنت 🎉');
              }
            }}
            isStudyMode={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* الهيدر */}
        <Header
          totalWords={stats.totalWords}
          masteredWords={stats.masteredWords}
          onExport={handleExport}
          onImport={() => setShowImportModal(true)}
          onResetData={handleResetData}
        />

        {/* أزرار التنقل */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📚 المجموعة
          </button>
          
          <button
            onClick={startStudyMode}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            🎯 مراجعة ({stats.wordsNeedingReview})
          </button>
          
          <button
            onClick={() => setCurrentView('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentView === 'stats'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 الإحصائيات
          </button>
        </div>

        {currentView === 'home' && (
          <>
            {/* نموذج إضافة كلمة */}
            <AddWordForm
              categories={categories}
              onAddWord={handleAddWord}
              onAddCategory={handleAddCategory}
            />

            {/* أدوات البحث والفلترة */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="🔍 البحث..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="الكل">جميع التصنيفات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as FilterState['difficulty'] }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                  <option value="alphabetical">أبجدياً</option>
                  <option value="difficulty">حسب الصعوبة</option>
                  <option value="nextReview">حسب موعد المراجعة</option>
                </select>
              </div>
            </div>

            {/* عرض الكلمات */}
            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد كلمات</h3>
                <p className="text-gray-600">ابدأ بإضافة كلمة جديدة!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWords.map(word => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onEdit={setEditingWord}
                    onDelete={handleDeleteWord}
                    onUpdateProgress={handleUpdateProgress}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'stats' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 الإحصائيات</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalWords}</div>
                <div className="text-gray-600">إجمالي الكلمات</div>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.masteredWords}</div>
                <div className="text-gray-600">كلمات محفوظة</div>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.progress.toFixed(0)}%</div>
                <div className="text-gray-600">نسبة الإتقان</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">التقدم العام</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {stats.masteredWords} من {stats.totalWords} كلمات محفوظة
              </div>
            </div>
          </div>
        )}

        {/* مودال الاستيراد */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">استيراد البيانات</h3>
                <p className="text-gray-600 text-sm">اختر ملف JSON الذي تم تصديره مسبقاً</p>
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
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold cursor-pointer transition-all mb-4"
              >
                اختيار ملف
              </label>
              
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-xl font-semibold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
        {/* مودال التعديل */}
        {editingWord && (
          <EditWordModal
            word={editingWord}
            categories={categories}
            onSave={handleEditWord}
            onCancel={() => setEditingWord(null)}
            onAddCategory={handleAddCategory}
          />
        )}
      </div>
    </div>
  );
}