'use client';

import { useApp } from '@/context/AppContext';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { categories, addCategory, deleteCategory, words } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      alert('هذا التصنيف موجود بالفعل');
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory('');
  };

  const handleDeleteCategory = (category: string) => {
    if (categories.length <= 1) {
      alert('لا يمكن حذف جميع التصنيفات. يجب أن يبقى تصنيف واحد على الأقل.');
      return;
    }
    
    deleteCategory(category);
  };

  const getCategoryWordCount = (category: string) => {
    return words.filter(word => word.category === category).length;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">إدارة التصنيفات</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Add New Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              إضافة تصنيف جديد
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="اسم التصنيف"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">
              التصنيفات الموجودة ({categories.length})
            </h3>
            
            {categories.map((category) => (
              <div
                key={category}
                className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">{category}</div>
                    <div className="text-sm text-gray-400">
                      {getCategoryWordCount(category)} كلمة
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                      title="حذف التصنيف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 عند حذف تصنيف يحتوي على كلمات، سيتم نقل الكلمات إلى تصنيف &quot;عام&quot;
          </p>
        </div>
      </div>
    </div>
  );
}