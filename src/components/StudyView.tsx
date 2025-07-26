// src/components/StudyView.tsx
'use client';

import { Word } from '@/types/flashcard';
import { Brain, CheckCircle, Clock, RotateCcw, Target, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface StudyViewProps {
  words: Word[];
  onUpdateProgress: (wordId: number, correct: boolean) => void;
}

const StudyView: React.FC<StudyViewProps> = ({ words, onUpdateProgress }) => {
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
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Target size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">أحسنت!</h3>
          <p className="text-gray-400 mb-8 text-lg">
            لا توجد كلمات تحتاج للمراجعة في الوقت الحالي
          </p>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {words.length}
                </div>
                <div className="text-gray-400 text-sm">إجمالي الكلمات</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {words.filter(w => w.correctCount >= 3).length}
                </div>
                <div className="text-gray-400 text-sm">كلمات محفوظة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {words.length > 0 ? Math.round((words.filter(w => w.correctCount >= 3).length / words.length) * 100) : 0}%
                </div>
                <div className="text-gray-400 text-sm">نسبة الإتقان</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">جلسة المراجعة</h2>
          <p className="text-gray-400">
            {currentIndex + 1} من {wordsToStudy.length}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-900/30 px-3 py-2 rounded-xl border border-green-800/50">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 font-medium">{sessionStats.correct}</span>
          </div>
          <div className="flex items-center space-x-2 bg-red-900/30 px-3 py-2 rounded-xl border border-red-800/50">
            <XCircle size={16} className="text-red-400" />
            <span className="text-red-400 font-medium">{sessionStats.incorrect}</span>
          </div>
          <button
            onClick={resetSession}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors border border-gray-700"
          >
            <RotateCcw size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>التقدم</span>
          <span>{Math.round(((currentIndex + 1) / wordsToStudy.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / wordsToStudy.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-80 mb-8 perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* الوجه الأمامي - الكلمة */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-white border border-blue-500/30">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-3 h-3 rounded-full ${getDifficultyColor(currentWord.difficulty)} mr-3`} />
                <span className="text-blue-200 text-sm bg-white/20 px-3 py-1 rounded-full">
                  {currentWord.category}
                </span>
              </div>
              
              <h3 className="text-4xl font-bold mb-6">{currentWord.word}</h3>
              
              <div className="flex items-center justify-center text-blue-200 mb-4">
                <Brain size={20} className="mr-2" />
                <span>انقر لرؤية المعنى</span>
              </div>
              
              <div className="text-sm text-blue-300">
                المحاولات: {currentWord.correctCount} صحيح • {currentWord.incorrectCount} خطأ
              </div>
            </div>
          </div>

          {/* الوجه الخلفي - المعنى */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col justify-center border border-gray-700">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">{currentWord.word}</h4>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                {currentWord.meaning}
              </p>
              
              {currentWord.note && (
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <p className="text-gray-400 text-sm">
                    💡 {currentWord.note}
                  </p>
                </div>
              )}
            </div>

            {/* إجابة مع إيقاف event propagation */}
            <div className="grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold transition-all hover:scale-105"
              >
                <XCircle size={20} />
                <span>صعب</span>
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-all hover:scale-105"
              >
                <CheckCircle size={20} />
                <span>سهل</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-2xl font-medium transition-all border border-gray-700"
        >
          <RotateCcw size={20} />
          <span>{isFlipped ? 'إخفاء المعنى' : 'إظهار المعنى'}</span>
        </button>
        
        <button
          onClick={() => {
            if (currentIndex < wordsToStudy.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex >= wordsToStudy.length - 1}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-4 rounded-2xl font-medium transition-all"
        >
          <Clock size={20} />
          <span>تخطي</span>
        </button>
      </div>

      {/* Session Summary */}
      <div className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">ملخص الجلسة</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-300 mb-1">
              {sessionStats.correct + sessionStats.incorrect}
            </div>
            <div className="text-gray-400 text-sm">كلمات مراجعة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {sessionStats.correct}
            </div>
            <div className="text-gray-400 text-sm">إجابات صحيحة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {sessionStats.correct + sessionStats.incorrect > 0 ? 
                Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100) : 0}%
            </div>
            <div className="text-gray-400 text-sm">معدل النجاح</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;