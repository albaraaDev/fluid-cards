// src/components/SlideUpAddForm.tsx - Fixed Version
'use client';

import { useApp } from '@/context/AppContext';
import { ChevronDown, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SlideUpAddFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  word: string;
  meaning: string;
  note: string;
  category: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
}

const SlideUpAddForm: React.FC<SlideUpAddFormProps> = ({ 
  isOpen, 
  onClose
}) => {
  const { categories, addWord, addCategory } = useApp();
  
  const [formData, setFormData] = useState<FormData>({
    word: '',
    meaning: '',
    note: '',
    category: categories[0] || 'عام',
    difficulty: 'متوسط'
  });
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form عند فتح Modal فقط
  useEffect(() => {
    if (isOpen) {
      setFormData({
        word: '',
        meaning: '',
        note: '',
        category: categories[0] || 'عام',
        difficulty: 'متوسط'
      });
      setNewCategory('');
      setIsAddingCategory(false);
      setErrors({});
    }
  }, [isOpen]); // إزالة categories من dependencies لحل المشكلة

  // تحديث الفئة المختارة فقط عند تغيير الفئات وعدم وجود فئة محددة
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, formData.category]);

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.word.trim()) {
      newErrors.word = 'الكلمة مطلوبة';
    }
    
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'المعنى مطلوب';
    }
    
    if (formData.word.trim().length < 2) {
      newErrors.word = 'الكلمة يجب أن تكون أكثر من حرف واحد';
    }
    
    if (formData.meaning.trim().length < 2) {
      newErrors.meaning = 'المعنى يجب أن يكون أكثر من حرف واحد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // معالج إرسال النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      addWord({
        word: formData.word.trim(),
        meaning: formData.meaning.trim(),
        note: formData.note.trim(),
        category: formData.category,
        difficulty: formData.difficulty
      });

      onClose();
      
    } catch (error) {
      console.error('خطأ في إضافة الكلمة:', error);
      alert('❌ حدث خطأ أثناء إضافة الكلمة');
    }
  };

  // معالج إضافة تصنيف جديد - مُحسَّن للحفاظ على البيانات
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert('❌ يرجى إدخال اسم التصنيف');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      alert('❌ هذا التصنيف موجود بالفعل');
      return;
    }

    const trimmedCategory = newCategory.trim();
    
    // إضافة التصنيف الجديد
    addCategory(trimmedCategory);
    
    // تحديث فئة النموذج للفئة الجديدة مع الحفاظ على باقي البيانات
    setFormData(prev => ({ ...prev, category: trimmedCategory }));
    
    // إعادة تعيين حالة إضافة التصنيف
    setNewCategory('');
    setIsAddingCategory(false);
  };

  // معالج تغيير البيانات
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة الخطأ عند التصحيح
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50">
      <div className={`
        bg-gray-800 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-hidden
        transform transition-all duration-300 ease-out border border-gray-700 border-b-0
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl lg:text-2xl font-bold text-white">إضافة كلمة جديدة</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-all touch-manipulation"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Word Input */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
              الكلمة <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.word}
              onChange={(e) => handleInputChange('word', e.target.value)}
              className={`
                w-full bg-gray-700 border rounded-2xl py-4 px-4 lg:px-5 text-white placeholder-gray-400 
                text-lg lg:text-xl focus:outline-none focus:ring-2 transition-all touch-manipulation
                ${errors.word ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
              `}
              placeholder="مثال: Serendipity"
              autoFocus
            />
            {errors.word && (
              <p className="text-red-400 text-sm mt-2">❌ {errors.word}</p>
            )}
          </div>

          {/* Meaning Input */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
              المعنى <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.meaning}
              onChange={(e) => handleInputChange('meaning', e.target.value)}
              rows={3}
              className={`
                w-full bg-gray-700 border rounded-2xl py-4 px-4 lg:px-5 text-white placeholder-gray-400 
                text-lg lg:text-xl focus:outline-none focus:ring-2 transition-all resize-none touch-manipulation
                ${errors.meaning ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
              `}
              placeholder="مثال: صدفة سعيدة، اكتشاف غير متوقع لشيء جميل"
            />
            {errors.meaning && (
              <p className="text-red-400 text-sm mt-2">❌ {errors.meaning}</p>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
              ملاحظة (اختياري)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded-2xl py-4 px-4 lg:px-5 text-white placeholder-gray-400 text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none touch-manipulation"
              placeholder="مثال: Finding this app was pure serendipity!"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
              التصنيف
            </label>
            
            {!isAddingCategory ? (
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-2xl py-4 px-4 lg:px-5 text-white text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none touch-manipulation"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
                  title="إضافة تصنيف جديد"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 bg-gray-700 border border-blue-500 rounded-2xl py-4 px-4 lg:px-5 text-white placeholder-gray-400 text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all touch-manipulation"
                    placeholder="اسم التصنيف الجديد"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
                    title="حفظ التصنيف"
                  >
                    <Plus size={20} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory('');
                    }}
                    className="p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
                    title="إلغاء"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-gray-400 text-sm">
                  💡 سيتم اختيار التصنيف الجديد تلقائياً عند الإضافة
                </p>
              </div>
            )}
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
              مستوى الصعوبة
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['سهل', 'متوسط', 'صعب'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleInputChange('difficulty', diff)}
                  className={`
                    py-3 px-4 rounded-2xl font-medium transition-all touch-manipulation
                    ${formData.difficulty === diff
                      ? diff === 'سهل'
                        ? 'bg-green-600 text-white border-2 border-green-500'
                        : diff === 'متوسط'
                        ? 'bg-yellow-600 text-white border-2 border-yellow-500'
                        : 'bg-red-600 text-white border-2 border-red-500'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                    }
                  `}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-4 lg:py-5 px-6 rounded-2xl font-semibold text-lg lg:text-xl transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
          >
            ✨ إضافة الكلمة
          </button>
        </form>
      </div>
    </div>
  );
};

export default SlideUpAddForm;