// src/components/folders/FolderPicker.tsx
'use client';

import { Folder } from '@/types/flashcard';
import { Check, ChevronDown, FolderPlus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface FolderPickerProps {
  folders: Folder[];
  selectedFolderId?: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showSearch?: boolean;
  showHierarchy?: boolean; // عرض التسلسل الهرمي
  className?: string;
}

const FolderPicker: React.FC<FolderPickerProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  placeholder = 'اختر مجلد...',
  disabled = false,
  error,
  showSearch = true,
  showHierarchy = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // المجلد المحدد
  const selectedFolder = useMemo(() => {
    return folders.find(folder => folder.id === selectedFolderId);
  }, [folders, selectedFolderId]);

  // بناء الشجرة الهرمية للمجلدات
  const buildFolderHierarchy = () => {
    const folderMap = new Map<string, Folder & { children: Folder[], level: number, path: string[] }>();
    
    // إنشاء خريطة المجلدات مع معلومات إضافية
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        level: 0,
        path: []
      });
    });

    // بناء العلاقات الهرمية وحساب المستويات
    const rootFolders: (Folder & { children: Folder[], level: number, path: string[] })[] = [];
    
    folders.forEach(folder => {
      const folderData = folderMap.get(folder.id)!;
      
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderData);
          folderData.level = parent.level + 1;
          folderData.path = [...parent.path, parent.name];
        }
      } else {
        rootFolders.push(folderData);
        folderData.path = [];
      }
    });

    // دالة تسطيح الشجرة مع الحفاظ على الترتيب الهرمي
    const flattenTree = (folders: (Folder & { children: Folder[], level: number, path: string[] })[]): (Folder & { level: number, path: string[] })[] => {
      const result: (Folder & { level: number, path: string[] })[] = [];
      
      folders
        .sort((a, b) => {
          // المجلدات الافتراضية أولاً
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          // ثم ترتيب أبجدي
          return a.name.localeCompare(b.name, 'ar');
        })
        .forEach(folder => {
          result.push(folder);
          if (folder.children.length > 0) {
            result.push(...flattenTree(folder.children));
          }
        });
      
      return result;
    };

    return flattenTree(rootFolders);
  };

  // قائمة المجلدات المرتبة هرمياً
  const hierarchicalFolders = useMemo(() => {
    if (!showHierarchy) {
      return folders
        .filter(folder => {
          if (!searchTerm) return true;
          return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return a.name.localeCompare(b.name, 'ar');
        })
        .map(folder => ({ ...folder, level: 0, path: [] }));
    }

    return buildFolderHierarchy().filter(folder => {
      if (!searchTerm) return true;
      return folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             folder.path.some(pathPart => pathPart.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [folders, searchTerm, showHierarchy]);

  // معالج اختيار المجلد
  const handleSelectFolder = (folderId: string) => {
    onSelectFolder(folderId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // إغلاق القائمة عند النقر خارجها
  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* زر اختيار المجلد */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between bg-gray-700 border rounded-2xl py-4 px-4 lg:px-5 
          text-white transition-all focus:outline-none focus:ring-2
          ${disabled 
            ? 'opacity-50 cursor-not-allowed border-gray-600' 
            : error 
              ? 'border-red-500 focus:ring-red-500 hover:border-red-400' 
              : 'border-gray-600 focus:ring-blue-500 hover:border-gray-500'
          }
        `}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {selectedFolder ? (
            <>
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ 
                  backgroundColor: `${selectedFolder.color}20`, 
                  border: `1px solid ${selectedFolder.color}40` 
                }}
              >
                {selectedFolder.icon}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="font-medium truncate">{selectedFolder.name}</div>
                {showHierarchy && selectedFolder.parentId && (
                  <div className="text-xs text-gray-400 truncate">
                    {buildFolderHierarchy()
                      .find(f => f.id === selectedFolder.id)
                      ?.path.join(' / ') || ''}
                  </div>
                )}
              </div>
              {selectedFolder.isDefault && (
                <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full shrink-0">
                  افتراضي
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-right flex-1">{placeholder}</span>
          )}
        </div>
        
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* رسالة الخطأ */}
      {error && (
        <p className="text-red-400 text-sm mt-2">❌ {error}</p>
      )}

      {/* قائمة المجلدات المنسدلة */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClickOutside}
        >
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md max-h-96 m-4 overflow-hidden">
            
            {/* Header مع البحث */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">اختيار المجلد</h3>
              
              {showSearch && (
                <div className="relative">
                  <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث في المجلدات..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* قائمة المجلدات */}
            <div className="max-h-64 overflow-y-auto">
              {hierarchicalFolders.length > 0 ? (
                hierarchicalFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder.id)}
                    className={`
                      w-full flex items-center space-x-3 p-4 text-right hover:bg-gray-700 transition-colors
                      ${selectedFolderId === folder.id ? 'bg-blue-900/30 border-r-2 border-blue-500' : ''}
                    `}
                  >
                    {/* مسافة المستوى الهرمي */}
                    {showHierarchy && folder.level > 0 && (
                      <div 
                        className="shrink-0"
                        style={{ width: `${folder.level * 16}px` }}
                      />
                    )}

                    {/* أيقونة المجلد */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ 
                        backgroundColor: `${folder.color}20`, 
                        border: `1px solid ${folder.color}40` 
                      }}
                    >
                      {folder.icon}
                    </div>

                    {/* معلومات المجلد */}
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white truncate">{folder.name}</span>
                        {folder.isDefault && (
                          <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full shrink-0">
                            افتراضي
                          </span>
                        )}
                      </div>
                      
                      {showHierarchy && folder.path.length > 0 && (
                        <div className="text-xs text-gray-400 truncate">
                          {folder.path.join(' / ')}
                        </div>
                      )}
                      
                      {folder.description && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {folder.description}
                        </div>
                      )}
                    </div>

                    {/* عدد الكلمات */}
                    <div className="text-sm text-gray-400 shrink-0">
                      <span className="font-medium" style={{ color: folder.color }}>
                        {folder.wordCount || 0}
                      </span>
                    </div>

                    {/* أيقونة التحديد */}
                    {selectedFolderId === folder.id && (
                      <Check size={18} className="text-blue-400 shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-3">📁</div>
                  <p>لا توجد مجلدات مطابقة</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                    >
                      مسح البحث
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer مع زر إضافة مجلد */}
            {onCreateFolder && (
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    onCreateFolder();
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FolderPlus size={18} />
                  <span>إنشاء مجلد جديد</span>
                </button>
              </div>
            )}

            {/* زر الإغلاق */}
            <div className="p-4 pt-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderPicker;