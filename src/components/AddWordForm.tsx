// src/components/AddWordForm.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useState } from 'react';

interface AddWordFormProps {
  categories: string[];
  onAddWord: (word: Omit<Word, 'id' | 'lastReviewed' | 'correctCount' | 'incorrectCount' | 'nextReview'>) => void;
  onAddCategory: (category: string) => void;
}

interface FormData {
  word: string;
  meaning: string;
  note: string;
  category: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
}

export default function AddWordForm({ categories, onAddWord, onAddCategory }: AddWordFormProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    word: '',
    meaning: '',
    note: '',
    category: 'عام',
    difficulty: 'متوسط'
  });
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.word.trim() || !formData.meaning.trim()) {
      alert('يرجى ملء الكلمة والمعنى على الأقل');
      return;
    }

    onAddWord({
      word: formData.word.trim(),
      meaning: formData.meaning.trim(),
      note: formData.note.trim(),
      category: formData.category,
      difficulty: formData.difficulty
    });

    // إعادة تعيين النموذج
    setFormData({
      word: '',
      meaning: '',
      note: '',
      category: 'عام',
      difficulty: 'متوسط'
    });
    
    setIsFormVisible(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      alert('هذا التصنيف موجود بالفعل');
      return;
    }

    onAddCategory(newCategory.trim());
    setFormData(prev => ({ ...prev, category: newCategory.trim() }));
    setNewCategory('');
    setIsAddingCategory(false);
  };

  return (
    <div className="mb-8">
      {/* زر إضافة كلمة جديدة */}
      {!isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="w-full py-4 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold text-lg"
        >
          <span className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة كلمة جديدة
          </span>
        </button>
      )}

      {/* نموذج إضافة الكلمة */}
      {isFormVisible && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">إضافة كلمة جديدة</h3>
            <button
              onClick={() => setIsFormVisible(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الكلمة */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الكلمة أو العبارة *
              </label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: Serendipity"
                required
              />
            </div>

            {/* المعنى */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المعنى أو الترجمة *
              </label>
              <input
                type="text"
                value={formData.meaning}
                onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: صدفة سعيدة، اكتشاف غير متوقع لشيء جميل"
                required
              />
            </div>

            {/* الملاحظة */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ملاحظة أو مثال (اختياري)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                placeholder="مثال: Finding this hidden café was pure serendipity"
              />
            </div>

            {/* التصنيف */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                التصنيف
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="إضافة تصنيف جديد"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* إضافة تصنيف جديد */}
              {isAddingCategory && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="اسم التصنيف الجديد"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory('');
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            {/* مستوى الصعوبة */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                مستوى الصعوبة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['سهل', 'متوسط', 'صعب'] as const).map((level) => {
                  const isSelected = formData.difficulty === level;
                  const selectedClass = level === 'سهل' 
                    ? 'bg-green-500 text-white' 
                    : level === 'متوسط'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white';
                  
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                      className={`py-2 px-4 rounded-xl font-semibold transition-all ${
                        isSelected ? selectedClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                إضافة الكلمة
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-xl font-semibold transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}