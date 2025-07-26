// src/components/AddWordForm.tsx
'use client';

import { Word } from '@/types/flashcard';
import { Plus, X } from 'lucide-react';
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
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
        >
          <Plus size={20} />
          <span>إضافة كلمة جديدة</span>
        </button>
      )}

      {/* النموذج */}
      {isFormVisible && (
        <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">إضافة كلمة جديدة</h3>
            <button
              onClick={() => setIsFormVisible(false)}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الكلمة */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الكلمة *
              </label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="ادخل الكلمة..."
                required
              />
            </div>

            {/* المعنى */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المعنى أو الترجمة *
              </label>
              <textarea
                value={formData.meaning}
                onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                rows={3}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                placeholder="ادخل المعنى أو الترجمة..."
                required
              />
            </div>

            {/* ملاحظة */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ملاحظة (اختياري)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                placeholder="ملاحظة أو مثال..."
              />
            </div>

            {/* التصنيف */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                التصنيف
              </label>
              
              {!isAddingCategory ? (
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl hover:bg-gray-600 transition-colors text-gray-300"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="اسم التصنيف الجديد..."
                    className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-4 bg-green-600 hover:bg-green-700 rounded-xl transition-colors text-white"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory('');
                    }}
                    className="px-4 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* مستوى الصعوبة */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مستوى الصعوبة
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['سهل', 'متوسط', 'صعب'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: level as 'سهل' | 'متوسط' | 'صعب' }))}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      formData.difficulty === level
                        ? level === 'سهل' 
                          ? 'bg-green-600 border-green-500 text-white'
                          : level === 'متوسط'
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-red-600 border-red-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all"
              >
                إضافة الكلمة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}