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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out">
          {/* Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">إضافة كلمة جديدة</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Word Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الكلمة أو العبارة *
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="مثال: Serendipity"
                  required
                  autoFocus
                />
              </div>

              {/* Meaning Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  المعنى أو الترجمة *
                </label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="مثال: صدفة سعيدة، اكتشاف غير متوقع لشيء جميل"
                  required
                />
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ملاحظة أو مثال (اختياري)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none transition-all"
                  placeholder="مثال: Finding this hidden café was pure serendipity"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  التصنيف
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                    title="إضافة تصنيف جديد"
                  >
                    <Plus size={20} className="text-gray-600" />
                  </button>
                </div>

                {/* Add Category Input */}
                {isAddingCategory && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="اسم التصنيف الجديد"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600 transition-colors font-medium"
                    >
                      إضافة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-400 transition-colors font-medium"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  مستوى الصعوبة
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['سهل', 'متوسط', 'صعب'] as const).map((level) => {
                    const isSelected = formData.difficulty === level;
                    const selectedClass = level === 'سهل' 
                      ? 'bg-green-500 text-white border-green-500' 
                      : level === 'متوسط'
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-red-500 text-white border-red-500';
                    
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, difficulty: level }))}
                        className={`py-3 px-4 rounded-2xl font-semibold transition-all border-2 ${
                          isSelected 
                            ? selectedClass 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                >
                  إضافة الكلمة
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold transition-all duration-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}