// src/components/SlideUpAddForm.tsx - تحديث لدعم المجلدات
'use client';

import CreateFolderModal from '@/components/folders/CreateFolderModal';
import FolderPicker from '@/components/folders/FolderPicker';
import { useApp } from '@/context/AppContext';
import { Tag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SlideUpAddFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  word: string;
  meaning: string;
  note: string;
  folderId: string; // 🔄 تغيير من category إلى folderId
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  tags: string[]; // 🆕 إضافة tags
}

const SlideUpAddForm: React.FC<SlideUpAddFormProps> = ({ 
  isOpen, 
  onClose
}) => {
  const { folders, addWord, addFolder } = useApp();
  
  const [formData, setFormData] = useState<FormData>({
    word: '',
    meaning: '',
    note: '',
    folderId: folders[0]?.id || 'general',
    difficulty: 'متوسط',
    tags: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [currentTag, setCurrentTag] = useState(''); // للتاج الحالي

  // Reset form عند فتح Modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        word: '',
        meaning: '',
        note: '',
        folderId: folders[0]?.id || 'general',
        difficulty: 'متوسط',
        tags: [],
      });
      setCurrentTag('');
      setErrors({});
    }
  }, [isOpen, folders]);

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

    if (!formData.folderId) {
      newErrors.folderId = 'يرجى اختيار مجلد';
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
        folderId: formData.folderId,
        difficulty: formData.difficulty,
        tags: formData.tags.filter(tag => tag.trim().length > 0),
      });

      onClose();
      
      // إشعار نجاح بسيط
      setTimeout(() => {
        alert('✅ تم إضافة الكلمة بنجاح!');
      }, 300);
      
    } catch (error) {
      console.error('خطأ في إضافة الكلمة:', error);
      alert('❌ حدث خطأ أثناء إضافة الكلمة');
    }
  };

  // معالج تغيير البيانات
  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة الخطأ عند التصحيح
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // إضافة تاج جديد
  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      handleInputChange('tags', [...formData.tags, tag]);
      setCurrentTag('');
    }
  };

  // إزالة تاج
  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // معالج إنشاء مجلد جديد
  const handleCreateFolder = (folderData: any) => {
    addFolder(folderData);
    setShowCreateFolder(false);
    
    // تحديد المجلد الجديد كمحدد
    setTimeout(() => {
      const newFolder = folders.find(f => f.name === folderData.name);
      if (newFolder) {
        handleInputChange('folderId', newFolder.id);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4">
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

            {/* Tags Input */}
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
                التاجات (اختياري)
              </label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-800/50"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-800/50 rounded-full p-1 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Add Tag Input */}
              {formData.tags.length < 5 && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="أضف تاج..."
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim()}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all touch-manipulation"
                  >
                    <Tag size={18} />
                  </button>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                يمكنك إضافة حتى 5 تاجات لتصنيف الكلمة بشكل أفضل
              </p>
            </div>

            {/* Folder Selection */}
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
                المجلد <span className="text-red-400">*</span>
              </label>
              
              <FolderPicker
                folders={folders}
                selectedFolderId={formData.folderId}
                onSelectFolder={(folderId) => handleInputChange('folderId', folderId)}
                onCreateFolder={() => setShowCreateFolder(true)}
                placeholder="اختر مجلد..."
                error={errors.folderId}
                showSearch={true}
                showHierarchy={true}
              />
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-300 mb-3">
                مستوى الصعوبة
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {(['سهل', 'متوسط', 'صعب'] as const).map((level) => {
                  const colors = {
                    'سهل': 'border-green-600 bg-green-900/30 text-green-400',
                    'متوسط': 'border-yellow-600 bg-yellow-900/30 text-yellow-400',
                    'صعب': 'border-red-600 bg-red-900/30 text-red-400'
                  };
                  
                  const selectedColors = {
                    'سهل': 'border-green-500 bg-green-600 text-white',
                    'متوسط': 'border-yellow-500 bg-yellow-600 text-white',
                    'صعب': 'border-red-500 bg-red-600 text-white'
                  };

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('difficulty', level)}
                      className={`
                        py-4 px-4 rounded-2xl border-2 font-medium transition-all text-lg lg:text-xl
                        hover:scale-105 active:scale-95 touch-manipulation
                        ${formData.difficulty === level ? selectedColors[level] : colors[level]}
                      `}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-4 lg:py-5 rounded-2xl font-semibold text-lg lg:text-xl transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation shadow-lg"
              >
                إضافة الكلمة
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onCreateFolder={handleCreateFolder}
          existingFolders={folders}
        />
      )}
    </>
  );
};

export default SlideUpAddForm;