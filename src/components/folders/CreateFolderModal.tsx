// src/components/folders/CreateFolderModal.tsx
'use client';

import { FOLDER_COLORS, FOLDER_ICONS, getRandomFolderColor, getRandomFolderIcon } from '@/data/defaultFolders';
import { Folder } from '@/types/flashcard';
import { ChevronDown, FolderPlus, Palette, Sparkles, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => void;
  parentFolder?: Folder; // المجلد الأب للمجلدات الفرعية
  existingFolders: Folder[]; // للتحقق من عدم تكرار الأسماء
  editingFolder?: Folder; // للتحرير بدلاً من الإنشاء
}

interface FormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolder,
  existingFolders,
  editingFolder,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: getRandomFolderColor(),
    icon: getRandomFolderIcon(),
    parentId: parentFolder?.id,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconType, setIconType] = useState<'emoji' | 'lucide'>('emoji');

  const isEditing = !!editingFolder;
  const modalTitle = isEditing ? 'تحرير المجلد' : 'إنشاء مجلد جديد';

  // تحديث البيانات عند فتح المودال أو تغيير المجلد المحرر
  useEffect(() => {
    if (isOpen) {
      if (editingFolder) {
        setFormData({
          name: editingFolder.name,
          description: editingFolder.description || '',
          color: editingFolder.color,
          icon: editingFolder.icon,
          parentId: editingFolder.parentId,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: getRandomFolderColor(),
          icon: getRandomFolderIcon(),
          parentId: parentFolder?.id,
        });
      }
      setErrors({});
      setShowColorPicker(false);
      setShowIconPicker(false);
    }
  }, [isOpen, editingFolder, parentFolder]);

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // التحقق من الاسم
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المجلد مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'اسم المجلد يجب أن يكون أكثر من حرف واحد';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'اسم المجلد يجب أن يكون أقل من 50 حرف';
    }
    
    // التحقق من عدم تكرار الاسم
    const duplicateFolder = existingFolders.find(
      folder => folder.name.toLowerCase() === formData.name.trim().toLowerCase() && 
                folder.id !== editingFolder?.id
    );
    if (duplicateFolder) {
      newErrors.name = 'يوجد مجلد بهذا الاسم مسبقاً';
    }
    
    // التحقق من الوصف
    if (formData.description.length > 200) {
      newErrors.description = 'الوصف يجب أن يكون أقل من 200 حرف';
    }
    
    // التحقق من اللون والأيقونة
    if (!formData.color || !FOLDER_COLORS.includes(formData.color)) {
      newErrors.color = 'يرجى اختيار لون صحيح';
    }
    
    if (!formData.icon.trim()) {
      newErrors.icon = 'يرجى اختيار أيقونة للمجلد';
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
      const folderData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        parentId: formData.parentId,
        isDefault: false,
      };

      onCreateFolder(folderData);
      onClose();
      
      // إشعار نجاح
      setTimeout(() => {
        const action = isEditing ? 'تحديث' : 'إنشاء';
        alert(`✅ تم ${action} المجلد بنجاح!`);
      }, 300);
      
    } catch (error) {
      console.error('خطأ في إنشاء المجلد:', error);
      alert('❌ حدث خطأ أثناء إنشاء المجلد');
    }
  };

  // معالج تغيير البيانات
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة الخطأ عند التصحيح
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // توليد لون وأيقونة عشوائية
  const randomizeStyle = () => {
    setFormData(prev => ({
      ...prev,
      color: getRandomFolderColor(),
      icon: getRandomFolderIcon(iconType),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`
        bg-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden
        transform transition-all duration-300 ease-out border border-gray-700
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderPlus size={24} />
              <h2 className="text-xl font-bold">{modalTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {parentFolder && (
            <div className="mt-3 flex items-center space-x-2 text-blue-100">
              <span className="text-sm">مجلد فرعي تحت:</span>
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
                <span>{parentFolder.icon}</span>
                <span className="font-medium">{parentFolder.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* معاينة المجلد */}
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 transition-all duration-300"
              style={{ 
                backgroundColor: `${formData.color}20`, 
                border: `2px solid ${formData.color}40`,
                boxShadow: `0 0 20px ${formData.color}30`
              }}
            >
              {formData.icon}
            </div>
            <button
              type="button"
              onClick={randomizeStyle}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 mx-auto transition-colors"
            >
              <Sparkles size={16} />
              <span>تصميم عشوائي</span>
            </button>
          </div>

          {/* اسم المجلد */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              اسم المجلد <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`
                w-full bg-gray-700 border rounded-2xl py-4 px-4 text-white placeholder-gray-400 
                text-lg focus:outline-none focus:ring-2 transition-all
                ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
              `}
              placeholder="مثال: المفردات الطبية"
              maxLength={50}
              autoFocus
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-2">❌ {errors.name}</p>
            )}
          </div>

          {/* وصف المجلد */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              الوصف (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`
                w-full bg-gray-700 border rounded-2xl py-4 px-4 text-white placeholder-gray-400 
                text-base focus:outline-none focus:ring-2 transition-all resize-none
                ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}
              `}
              placeholder="وصف مختصر للمجلد ومحتوياته..."
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.description && (
                <p className="text-red-400 text-sm">❌ {errors.description}</p>
              )}
              <span className="text-xs text-gray-500 mr-auto">
                {formData.description.length}/200
              </span>
            </div>
          </div>

          {/* اختيار اللون */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              لون المجلد
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center space-x-3 w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white hover:bg-gray-600 transition-colors"
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-500"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="flex-1 text-right">{formData.color}</span>
                <ChevronDown size={20} className={`transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showColorPicker && (
                <div className="grid grid-cols-8 gap-2 p-4 bg-gray-700 rounded-xl border border-gray-600">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        handleInputChange('color', color);
                        setShowColorPicker(false);
                      }}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                        ${formData.color === color ? 'border-white shadow-lg' : 'border-gray-500'}
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* اختيار الأيقونة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              أيقونة المجلد
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex items-center space-x-3 w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white hover:bg-gray-600 transition-colors"
              >
                <span className="text-2xl">{formData.icon}</span>
                <span className="flex-1 text-right">اختر أيقونة</span>
                <ChevronDown size={20} className={`transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
              </button>
              
              {showIconPicker && (
                <div className="bg-gray-700 rounded-xl border border-gray-600 p-4">
                  {/* تبديل نوع الأيقونة */}
                  <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
                    <button
                      type="button"
                      onClick={() => setIconType('emoji')}
                      className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                        iconType === 'emoji' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      رموز تعبيرية
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType('lucide')}
                      className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                        iconType === 'lucide' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      أيقونات
                    </button>
                  </div>
                  
                  {/* شبكة الأيقونات */}
                  <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                    {FOLDER_ICONS[iconType].map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          handleInputChange('icon', icon);
                          setShowIconPicker(false);
                        }}
                        className={`
                          w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center
                          ${formData.icon === icon ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 hover:border-gray-500'}
                        `}
                        title={icon}
                      >
                        {iconType === 'emoji' ? (
                          <span className="text-lg">{icon}</span>
                        ) : (
                          <Palette size={16} className="text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              {isEditing ? 'حفظ التغييرات' : 'إنشاء المجلد'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;