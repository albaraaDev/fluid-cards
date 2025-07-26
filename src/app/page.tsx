'use client'
import { BarChart3, BookOpen, CheckCircle, Clock, Plus, RotateCcw, Search, Settings, Trophy, XCircle, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const FlashcardApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState(['عام']);
  const [currentWord, setCurrentWord] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [studyMode, setStudyMode] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', meaning: '', category: 'عام', difficulty: 'متوسط', note: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [selectedWordDetails, setSelectedWordDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, total: 0 });

  // حفظ البيانات في متغير مؤقت للحفاظ عليها أثناء الجلسة
  const [sessionData, setSessionData] = useState(() => {
    // محاولة استرجاع البيانات من متغير مؤقت إذا كانت موجودة
    if (typeof window !== 'undefined' && window.flashcardAppData) {
      return window.flashcardAppData;
    }
    return null;
  });

  // إضافة بعض الكلمات التجريبية أو استرجاع البيانات المحفوظة
  useEffect(() => {
    if (sessionData && sessionData.words) {
      setWords(sessionData.words);
      setCategories(sessionData.categories || ['عام']);
    } else if (words.length === 0) {
      const defaultWords = [
        {
          id: 1,
          word: 'Serendipity',
          meaning: 'اكتشاف شيء جميل بالصدفة',
          note: 'Finding my favorite book in that old library was pure serendipity.',
          category: 'عام',
          difficulty: 'صعب',
          lastReviewed: Date.now(),
          correctCount: 0,
          incorrectCount: 0,
          nextReview: Date.now()
        },
        {
          id: 2,
          word: 'Eloquent',
          meaning: 'فصيح، بليغ في الكلام',
          note: 'The speaker was so eloquent that everyone listened in silence.',
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
      setWords(defaultWords);
    }
  }, [sessionData]);

  // حفظ البيانات في متغير مؤقت عند تغيير الكلمات أو التصنيفات
  useEffect(() => {
    if (words.length > 0) {
      const dataToSave = {
        words,
        categories,
        savedAt: Date.now()
      };
      if (typeof window !== 'undefined') {
        window.flashcardAppData = dataToSave;
      }
      setSessionData(dataToSave);
    }
  }, [words, categories]);

  // تصدير البيانات - محسن
  const exportData = () => {
    try {
      const dataToExport = {
        words,
        categories,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0',
        totalWords: words.length,
        masteredWords: words.filter(w => w.correctCount >= 3).length
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      
      // إنشاء وتنزيل الملف
      const element = document.createElement('a');
      const file = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `بطاقات_تعليمية_${new Date().toISOString().split('T')[0]}.json`;
      
      // التأكد من أن العنصر مخفي
      element.style.display = 'none';
      document.body.appendChild(element);
      
      // محاولة النقر
      element.click();
      
      // تنظيف
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }, 100);
      
      console.log('تم تصدير البيانات بنجاح!', dataToExport);
      
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      
      // بديل في حالة فشل التحميل التلقائي
      const dataToExport = {
        words,
        categories,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0'
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      
      // إنشاء نافذة جديدة مع البيانات
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head><title>بيانات البطاقات التعليمية</title></head>
          <body>
            <h2>بيانات البطاقات التعليمية</h2>
            <p>انسخ النص التالي واحفظه في ملف بامتداد .json:</p>
            <textarea style="width: 100%; height: 400px; font-family: monospace;">${dataStr}</textarea>
            <br><br>
            <button onclick="
              const textarea = document.querySelector('textarea');
              textarea.select();
              document.execCommand('copy');
              alert('تم نسخ البيانات!');
            ">نسخ البيانات</button>
          </body>
        </html>
      `);
    }
  };

  // استيراد البيانات
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // التحقق من صحة البيانات
        if (importedData.words && Array.isArray(importedData.words)) {
          setWords(importedData.words);
          setCategories(importedData.categories || ['عام']);
          setShowImportModal(false);
          
          // إعادة تعيين input file
          event.target.value = '';
        } else {
          alert('ملف غير صالح! تأكد من أنه ملف نسخة احتياطية صحيح.');
        }
      } catch (error) {
        alert('خطأ في قراءة الملف! تأكد من أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  // إغلاق قائمة الخيارات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(null);
    };

    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptionsMenu]);

  // إعادة حساب الإحصائيات عند تغيير الكلمات
  useEffect(() => {
    // إجبار إعادة الرندر للإحصائيات
    const updateStats = () => {
      setStudyStats(prev => ({...prev})); // تحديث dummy للإجبار على re-render
    };
    updateStats();
  }, [words]);

  // فلترة الكلمات حسب البحث والتصنيف
  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // إضافة كلمة جديدة
  const addWord = () => {
    if (newWord.word && newWord.meaning) {
      const word = {
        id: Date.now(),
        ...newWord,
        lastReviewed: Date.now(),
        correctCount: 0,
        incorrectCount: 0,
        nextReview: Date.now()
      };
      
      setWords([...words, word]);
      
      if (!categories.includes(newWord.category)) {
        setCategories([...categories, newWord.category]);
      }
      
      setNewWord({ word: '', meaning: '', category: 'عام', difficulty: 'متوسط', note: '' });
      setCurrentView('home');
    }
  };

  // بدء جلسة المراجعة
  const startStudySession = () => {
    const wordsToReview = filteredWords.filter(word => word.nextReview <= Date.now());
    if (wordsToReview.length > 0) {
      setCurrentWord(wordsToReview[0]);
      setStudyMode(true);
      setShowAnswer(false);
      setStudyStats({ correct: 0, incorrect: 0, total: 0 });
    }
  };

  // تسجيل الإجابة
  const recordAnswer = (correct) => {
    if (!currentWord) return;

    const updatedWords = words.map(word => {
      if (word.id === currentWord.id) {
        const newCorrectCount = correct ? word.correctCount + 1 : word.correctCount;
        const newIncorrectCount = correct ? word.incorrectCount : word.incorrectCount + 1;
        
        // حساب موعد المراجعة التالية بناءً على الأداء
        let nextReviewDelay = 1; // يوم واحد افتراضياً
        if (correct) {
          if (newCorrectCount >= 3) nextReviewDelay = 7; // أسبوع
          else if (newCorrectCount >= 1) nextReviewDelay = 3; // 3 أيام
        } else {
          nextReviewDelay = 0.5; // نصف يوم للمراجعة السريعة
        }

        return {
          ...word,
          correctCount: newCorrectCount,
          incorrectCount: newIncorrectCount,
          lastReviewed: Date.now(),
          nextReview: Date.now() + (nextReviewDelay * 24 * 60 * 60 * 1000)
        };
      }
      return word;
    });

    setWords(updatedWords);
    setStudyStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
      total: prev.total + 1
    }));

    // الانتقال للكلمة التالية
    const remainingWords = updatedWords.filter(word => 
      word.id !== currentWord.id && word.nextReview <= Date.now()
    );
    
    if (remainingWords.length > 0) {
      setCurrentWord(remainingWords[0]);
      setShowAnswer(false);
    } else {
      setStudyMode(false);
      setCurrentWord(null);
    }
  };

  // حذف كلمة مع التأكيد
  const confirmDelete = (word) => {
    setWordToDelete(word);
    setShowDeleteModal(true);
    setShowOptionsMenu(null);
  };

  const deleteWord = () => {
    if (wordToDelete) {
      setWords(words.filter(word => word.id !== wordToDelete.id));
      setShowDeleteModal(false);
      setWordToDelete(null);
    }
  };

  // عرض تفاصيل الكلمة
  const showWordDetailsModal = (word) => {
    setSelectedWordDetails(word);
    setShowWordDetails(true);
  };

  // فتح نافذة التعديل
  const openEditModal = (word) => {
    setEditingWord({...word});
    setShowEditModal(true);
    setShowOptionsMenu(null);
  };

  // حفظ التعديلات
  const saveEditedWord = () => {
    if (editingWord && editingWord.word && editingWord.meaning) {
      const updatedWords = words.map(word => 
        word.id === editingWord.id ? editingWord : word
      );
      setWords(updatedWords);
      
      // تحديث التصنيفات إذا كان هناك تصنيف جديد
      if (!categories.includes(editingWord.category)) {
        setCategories([...categories, editingWord.category]);
      }
      
      setShowEditModal(false);
      setEditingWord(null);
    }
  };

  // حساب الإحصائيات العامة - تحديث مستمر
  const totalWords = words.length;
  const masteredWords = words.filter(word => word.correctCount >= 3).length;
  const wordsToReview = words.filter(word => word.nextReview <= Date.now()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* الشريط العلوي */}
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">📚 مساعد الحفظ</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="p-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 transition-all"
                title="استيراد البيانات"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </button>
              <button
                onClick={exportData}
                className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all"
                title="تصدير البيانات"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentView('stats')}
                className={`p-3 rounded-xl transition-all ${currentView === 'stats' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <BarChart3 size={24} />
              </button>
              <button
                onClick={() => setCurrentView('add')}
                className={`p-3 rounded-xl transition-all ${currentView === 'add' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Plus size={24} />
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className={`p-3 rounded-xl transition-all ${currentView === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <BookOpen size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* وضع المراجعة */}
        {studyMode && currentWord ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">الجلسة الحالية</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✓ {studyStats.correct}</span>
                  <span className="text-red-600">✗ {studyStats.incorrect}</span>
                  <span className="text-gray-600">المجموع: {studyStats.total}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className={`inline-block px-4 py-2 rounded-full text-sm mb-4 ${
                currentWord.difficulty === 'سهل' ? 'bg-green-100 text-green-800' :
                currentWord.difficulty === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentWord.difficulty}
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-6">{currentWord.word}</h2>
              
              {showAnswer ? (
                <div className="mb-8">
                  <p className="text-2xl text-gray-700 mb-6">{currentWord.meaning}</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => recordAnswer(true)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
                    >
                      <CheckCircle size={24} />
                      أعرفها
                    </button>
                    <button
                      onClick={() => recordAnswer(false)}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
                    >
                      <XCircle size={24} />
                      لا أعرفها
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
                >
                  إظهار المعنى
                </button>
              )}
            </div>

            <button
              onClick={() => setStudyMode(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              إنهاء الجلسة
            </button>
          </div>
        ) : (

        // الواجهة الرئيسية
        <>
          {currentView === 'home' && (
            <>
              {/* إشعار حفظ البيانات */}
              {sessionData && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-800 text-sm font-medium">
                        البيانات محفوظة مؤقتاً • آخر حفظ: {new Date(sessionData.savedAt).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                    <button
                      onClick={exportData}
                      className="text-green-700 hover:text-green-900 text-sm font-medium underline"
                    >
                      تصدير نسخة احتياطية
                    </button>
                  </div>
                </div>
              )}

              {/* الإحصائيات السريعة - في سطر واحد */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <Trophy className="mx-auto text-yellow-500 mb-2" size={28} />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">محفوظة</h3>
                    <p className="text-2xl font-bold text-yellow-600">{masteredWords}</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="mx-auto text-blue-500 mb-2" size={28} />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">المجموع</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalWords}</p>
                  </div>
                  <div className="text-center">
                    <Clock className="mx-auto text-red-500 mb-2" size={28} />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">للمراجعة</h3>
                    <p className="text-2xl font-bold text-red-600">{wordsToReview}</p>
                  </div>
                </div>
              </div>

              {/* زر بدء المراجعة */}
              {wordsToReview > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 text-center">
                  <h3 className="text-white text-xl font-bold mb-2">جاهز للمراجعة!</h3>
                  <p className="text-purple-100 mb-4">لديك {wordsToReview} كلمة تحتاج للمراجعة</p>
                  <button
                    onClick={startStudySession}
                    className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Zap className="inline mr-2" size={20} />
                    ابدأ المراجعة
                  </button>
                </div>
              )}

              {/* البحث والفلترة */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="ابحث عن كلمة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="الكل">جميع التصنيفات</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* قائمة الكلمات - تصميم جديد */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">كلماتك</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredWords.length} كلمة
                  </span>
                </div>
                
                {filteredWords.map(word => (
                  <div key={word.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                    {/* خلفية متدرجة خفيفة */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        {/* محتوى الكلمة */}
                        <div 
                          className="flex-1 cursor-pointer" 
                          onClick={() => showWordDetailsModal(word)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {word.word}
                            </h3>
                            
                            {/* التصنيف */}
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                              {word.category}
                            </span>
                            
                            {/* مؤشر الصعوبة */}
                            <div className={`w-3 h-3 rounded-full ${
                              word.difficulty === 'سهل' ? 'bg-green-400' :
                              word.difficulty === 'متوسط' ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}></div>
                          </div>
                          
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {word.meaning}
                          </p>
                          
                          {/* مؤشر التقدم */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex gap-1">
                              {/* النقاط الخضراء للإجابات الصحيحة */}
                              {[...Array(Math.min(word.correctCount, 5))].map((_, i) => (
                                <div key={`correct-${i}`} className="w-2 h-2 rounded-full bg-green-400"></div>
                              ))}
                              {/* النقاط الحمراء للإجابات الخاطئة */}
                              {[...Array(Math.min(word.incorrectCount, 3))].map((_, i) => (
                                <div key={`incorrect-${i}`} className="w-2 h-2 rounded-full bg-red-400"></div>
                              ))}
                              {/* النقاط الرمادية للمساحات الفارغة */}
                              {[...Array(Math.max(0, 5 - word.correctCount - Math.min(word.incorrectCount, 3)))].map((_, i) => (
                                <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-gray-200"></div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {word.correctCount >= 3 ? '🏆 محفوظة' : `${word.correctCount}/3 مراجعات صحيحة`}
                            </span>
                          </div>
                        </div>
                        
                        {/* زر الخيارات */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOptionsMenu(showOptionsMenu === word.id ? null : word.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* قائمة الخيارات */}
                          {showOptionsMenu === word.id && (
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-28 overflow-visible">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(word);
                                }}
                                className="w-full px-3 py-2 text-right text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 rounded-t-xl text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                تعديل
                              </button>
                              <div className="w-full h-px bg-gray-100"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(word);
                                }}
                                className="w-full px-3 py-2 text-right text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 rounded-b-xl text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredWords.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                      <BookOpen size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد كلمات</h3>
                    <p className="text-gray-500">لا توجد كلمات مطابقة للبحث أو الفلتر</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* إضافة كلمة جديدة */}
          {currentView === 'add' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إضافة كلمة جديدة</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكلمة</label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل الكلمة الجديدة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المعنى أو الترجمة</label>
                  <textarea
                    value={newWord.meaning}
                    onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                    placeholder="أدخل معنى الكلمة أو ترجمتها"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظة أو جملة مثال (اختياري)</label>
                  <textarea
                    value={newWord.note}
                    onChange={(e) => setNewWord({...newWord, note: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                    placeholder="مثال: جملة تحتوي على الكلمة أو ملاحظة مفيدة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                    <input
                      type="text"
                      value={newWord.category}
                      onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: عمل، سفر، أكاديمي..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصعوبة</label>
                    <select
                      value={newWord.difficulty}
                      onChange={(e) => setNewWord({...newWord, difficulty: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="سهل">سهل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="صعب">صعب</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={addWord}
                    disabled={!newWord.word || !newWord.meaning}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    إضافة الكلمة
                  </button>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-8 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* الإحصائيات */}
          {currentView === 'stats' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">الإحصائيات التفصيلية</h2>
                
                {/* شرح نظام الحفظ */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 نظام الحفظ</h3>
                  <p className="text-blue-700 text-sm">
                    الكلمة تُعتبر <strong>محفوظة</strong> عندما تُجيب عليها بشكل صحيح <strong>3 مرات</strong>. 
                    الإجابات الخاطئة تُعيد العداد وتجعل الكلمة تظهر للمراجعة أكثر.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">الكلمات المحفوظة</h3>
                    <p className="text-3xl font-bold">{masteredWords}</p>
                    <p className="text-green-100 text-sm">من أصل {totalWords} كلمة</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">معدل النجاح</h3>
                    <p className="text-3xl font-bold">
                      {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}%
                    </p>
                    <p className="text-blue-100 text-sm">نسبة الكلمات المحفوظة</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">التوزيع حسب التصنيف</h3>
                  <div className="space-y-3">
                    {categories.map(category => {
                      const categoryWords = words.filter(word => word.category === category);
                      const masteredInCategory = categoryWords.filter(word => word.correctCount >= 3).length;
                      return (
                        <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              {masteredInCategory}/{categoryWords.length}
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{width: `${categoryWords.length > 0 ? (masteredInCategory / categoryWords.length) * 100 : 0}%`}}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* معلومات إضافية عن حفظ البيانات */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">💾 حفظ البيانات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">💡 نصائح هامة:</h4>
                      <ul className="space-y-1">
                        <li>• البيانات محفوظة مؤقتاً أثناء الجلسة</li>
                        <li>• قم بتصدير نسخة احتياطية بانتظام</li>
                        <li>• يمكن استيراد البيانات من أي جهاز</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">🔄 الاستيراد والتصدير:</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={exportData}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all text-sm"
                        >
                          تصدير الآن
                        </button>
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all text-sm"
                        >
                          استيراد ملف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
        )}
        
        {/* نافذة تأكيد الحذف */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
                <p className="text-gray-600 text-sm">
                  هل أنت متأكد من حذف الكلمة 
                  <span className="font-bold text-gray-800"> "{wordToDelete?.word}"</span>؟
                  <br />
                  لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={deleteWord}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  حذف
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مودال تفاصيل الكلمة */}
        {showWordDetails && selectedWordDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">تفاصيل الكلمة</h2>
                <button
                  onClick={() => setShowWordDetails(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* الكلمة والمعنى */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedWordDetails.word}</h3>
                  <p className="text-gray-700">{selectedWordDetails.meaning}</p>
                </div>
                
                {/* الملاحظة */}
                {selectedWordDetails.note && (
                  <div className="p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">مثال:</h4>
                    <p className="text-gray-700 italic text-sm">"{selectedWordDetails.note}"</p>
                  </div>
                )}
                
                {/* التصنيف والصعوبة */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">التصنيف</h4>
                    <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      {selectedWordDetails.category}
                    </span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">الصعوبة</h4>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedWordDetails.difficulty === 'سهل' ? 'bg-green-100 text-green-800' :
                      selectedWordDetails.difficulty === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedWordDetails.difficulty}
                    </span>
                  </div>
                </div>
                
                {/* إحصائيات الأداء */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">إحصائيات الأداء</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{selectedWordDetails.correctCount}</div>
                      <div className="text-xs text-gray-600">إجابات صحيحة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">{selectedWordDetails.incorrectCount}</div>
                      <div className="text-xs text-gray-600">إجابات خاطئة</div>
                    </div>
                  </div>
                  
                  {/* شريط التقدم */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>التقدم نحو الحفظ</span>
                      <span>{Math.min(selectedWordDetails.correctCount, 3)}/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                        style={{width: `${Math.min((selectedWordDetails.correctCount / 3) * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* معلومات التوقيت */}
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>آخر مراجعة:</span>
                      <span>{new Date(selectedWordDetails.lastReviewed).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المراجعة القادمة:</span>
                      <span className={selectedWordDetails.nextReview <= Date.now() ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {selectedWordDetails.nextReview <= Date.now() ? 'مطلوب الآن' : new Date(selectedWordDetails.nextReview).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* حالة الكلمة */}
                <div className="text-center">
                  {selectedWordDetails.correctCount >= 3 ? (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full">
                      <Trophy size={14} />
                      <span className="font-semibold text-sm">كلمة محفوظة!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
                      <Clock size={14} />
                      <span className="font-semibold text-sm">قيد التعلم</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* مودال التعديل */}
        {showEditModal && editingWord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">تعديل الكلمة</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكلمة</label>
                  <input
                    type="text"
                    value={editingWord.word}
                    onChange={(e) => setEditingWord({...editingWord, word: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المعنى أو الترجمة</label>
                  <textarea
                    value={editingWord.meaning}
                    onChange={(e) => setEditingWord({...editingWord, meaning: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظة أو جملة مثال</label>
                  <textarea
                    value={editingWord.note || ''}
                    onChange={(e) => setEditingWord({...editingWord, note: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                    <input
                      type="text"
                      value={editingWord.category}
                      onChange={(e) => setEditingWord({...editingWord, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الصعوبة</label>
                    <select
                      value={editingWord.difficulty}
                      onChange={(e) => setEditingWord({...editingWord, difficulty: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="سهل">سهل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="صعب">صعب</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveEditedWord}
                    disabled={!editingWord.word || !editingWord.meaning}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    حفظ التعديلات
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* مودال الاستيراد */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">استيراد البيانات</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <svg className="w-12 h-12 mx-auto text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">اختر ملف النسخة الاحتياطية</h3>
                  <p className="text-gray-600 text-sm mb-4">اختر ملف JSON الذي تم تصديره مسبقاً</p>
                  
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all"
                  >
                    اختيار ملف
                  </label>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800">تحذير</h4>
                      <p className="text-sm text-yellow-700">سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardApp;