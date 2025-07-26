// src/components/SlideUpAddForm.tsx
'use client';

import { Word } from '@/types/flashcard';
import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SlideUpAddFormProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function SlideUpAddForm({ 
  isOpen, 
  onClose, 
  categories, 
  onAddWord, 
  onAddCategory 
}: SlideUpAddFormProps) {
  const [formData, setFormData] = useState<FormData>({
    word: '',
    meaning: '',
    note: '',
    category: 'عام',
    difficulty: 'متوسط'
  });
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        word: '',
        meaning: '',
        note: '',
        category: 'عام',
        difficulty: 'متوسط'
      });
      setNewCategory('');
      setIsAddingCategory(false);
    }
  }, [isOpen]);

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

    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className={`
        bg-gray-800 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-hidden
        transform transition-all duration-300 ease-out border border-gray-700 border-b-0
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">إضافة كلمة جديدة</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                autoFocus
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
                onClick={onClose}
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
      </div>
    </div>
  );
}