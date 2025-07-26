// src/components/StudyView.tsx
'use client';

import { Word } from '@/types/flashcard';
import { Brain, CheckCircle, Clock, RotateCcw, Target, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface StudyViewProps {
  words: Word[];
  onUpdateProgress: (wordId: number, correct: boolean) => void;
}

export default function StudyView({ words, onUpdateProgress }: StudyViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // كلمات تحتاج للمراجعة
  const wordsToStudy = useMemo(() => {
    return words.filter(w => w.nextReview <= Date.now());
  }, [words]);

  const currentWord = wordsToStudy[currentIndex];

  const handleAnswer = (correct: boolean) => {
    if (!currentWord) return;

    onUpdateProgress(currentWord.id, correct);
    setSessionStats(prev => ({
      ...prev,
      [correct ? 'correct' : 'incorrect']: prev[correct ? 'correct' : 'incorrect'] + 1
    }));

    // الانتقال للكلمة التالية
    if (currentIndex < wordsToStudy.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // انتهت الجلسة
      alert(`🎉 تم إنهاء جلسة المراجعة!\n\nالنتائج:\n✅ صحيح: ${sessionStats.correct + (correct ? 1 : 0)}\n❌ خطأ: ${sessionStats.incorrect + (correct ? 0 : 1)}`);
      setCurrentIndex(0);
      setSessionStats({ correct: 0, incorrect: 0 });
      setIsFlipped(false);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-green-500';
      case 'متوسط': return 'bg-yellow-500';
      case 'صعب': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // لا توجد كلمات للمراجعة
  if (wordsToStudy.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Target size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">أحسنت! 🎉</h3>
          <p className="text-gray-600 mb-6">
            جميع كلماتك محدثة ولا تحتاج لمراجعة الآن
          </p>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <CheckCircle size={20} />
              <span className="font-medium">
                ستظهر الكلمات هنا عندما تحتاج للمراجعة
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
      {/* Header مع الإحصائيات */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Brain size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">جلسة المراجعة</h2>
              <p className="text-gray-600 text-sm">
                {currentIndex + 1} من {wordsToStudy.length}
              </p>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="إعادة تشغيل الجلسة"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / wordsToStudy.length) * 100}%` }}
          />
        </div>

        {/* إحصائيات الجلسة */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600">صحيح: {sessionStats.correct}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600">خطأ: {sessionStats.incorrect}</span>
          </div>
        </div>
      </div>

      {/* البطاقة التفاعلية */}
      <div className="relative w-full h-96 perspective-1000 mb-8">
        <div
          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* الوجه الأمامي - الكلمة */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white">
            <div className="text-center">
              {/* مؤشر الصعوبة */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className={`w-4 h-4 rounded-full ${getDifficultyColor(currentWord.difficulty)}`} />
                <span className="text-blue-100 text-sm font-medium">
                  {currentWord.category}
                </span>
              </div>

              <h3 className="text-4xl font-bold mb-6">{currentWord.word}</h3>
              
              <div className="flex items-center justify-center space-x-2 text-blue-100 mb-4">
                <Clock size={16} />
                <span className="text-sm">انقر لرؤية المعنى</span>
              </div>

              {/* مؤشر الإتقان */}
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  ✓ {currentWord.correctCount}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  ✗ {currentWord.incorrectCount}
                </span>
              </div>
            </div>
          </div>

          {/* الوجه الخلفي - المعنى */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">{currentWord.word}</h4>
                <p className="text-xl text-gray-900 mb-6 leading-relaxed">{currentWord.meaning}</p>
                
                {currentWord.note && (
                  <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                    <p className="text-gray-700 italic">&quot;{currentWord.note}&quot;</p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  مستوى الصعوبة: <span className="font-medium">{currentWord.difficulty}</span>
                </div>
              </div>

              {/* أزرار التقييم */}
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <XCircle size={20} />
                  <span>صعب</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <CheckCircle size={20} />
                  <span>سهل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نصائح للمستخدم */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain size={16} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 mb-2">نصائح المراجعة</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• انقر على البطاقة لرؤية المعنى</li>
              <li>• اختر &quot;سهل&quot; إذا تذكرت المعنى بسهولة</li>
              <li>• اختر &quot;صعب&quot; إذا احتجت للتفكير أو أخطأت</li>
              <li>• الكلمات الصعبة ستظهر أكثر في المراجعات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}