// src/components/folders/FolderManager.tsx
'use client';

import { Folder, FolderTreeNode, FolderViewMode } from '@/types/flashcard';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  FolderOpen,
  FolderPlus,
  Grid,
  List,
  Plus,
  Search,
  Trash2,
  TreePine
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface FolderManagerProps {
  folders: Folder[];
  selectedFolderId?: string;
  viewMode: FolderViewMode;
  onViewModeChange: (mode: FolderViewMode) => void;
  onFolderSelect: (folderId: string) => void;
  onCreateFolder: (parentId?: string) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveFolder: (folderId: string, newParentId?: string) => void;
  searchTerm?: string;
  onSearchChange: (term: string) => void;
  showEmptyFolders?: boolean;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  folders,
  selectedFolderId,
  viewMode,
  onViewModeChange,
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveFolder,
  searchTerm = '',
  onSearchChange,
  showEmptyFolders = true,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['general']));
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);

  // الحصول على مسار المجلد
  const getPathToFolder = (folderId: string): string[] => {
    const path: string[] = [];
    let currentFolder = folders.find(f => f.id === folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder.name);
      currentFolder = currentFolder.parentId 
        ? folders.find(f => f.id === currentFolder!.parentId)
        : undefined;
    }
    
    return path;
  };

  // بناء الشجرة الهرمية للمجلدات
  const folderTree = useMemo(() => {
    const buildTree = (parentId?: string, level: number = 0): FolderTreeNode[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .filter(folder => {
          // فلترة البحث
          if (searchTerm) {
            return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          // فلترة المجلدات الفارغة
          if (!showEmptyFolders && (folder.wordCount || 0) === 0) {
            return false;
          }
          return true;
        })
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id, level + 1),
          level,
          isExpanded: expandedFolders.has(folder.id),
          path: getPathToFolder(folder.id),
        }))
        .sort((a, b) => {
          // المجلدات الافتراضية أولاً
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          // ثم ترتيب أبجدي
          return a.name.localeCompare(b.name, 'ar');
        });
    };

    return buildTree();
  }, [folders, searchTerm, showEmptyFolders, expandedFolders]);

  // توسيع/طي المجلد
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // معالجات السحب والإفلات
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolder(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetFolder(targetFolderId);
  };

  const handleDragLeave = () => {
    setDropTargetFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (draggedFolder && draggedFolder !== targetFolderId) {
      onMoveFolder(draggedFolder, targetFolderId);
    }
    setDraggedFolder(null);
    setDropTargetFolder(null);
  };

  // مكون عرض المجلد في الشجرة
  const TreeFolderItem: React.FC<{ node: FolderTreeNode }> = ({ node }) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedFolderId === node.id;
    const isDragTarget = dropTargetFolder === node.id;
    const canDelete = !node.isDefault && (node.wordCount || 0) === 0;

    return (
      <div className="select-none">
        {/* المجلد الرئيسي */}
        <div
          className={`
            flex items-center space-x-2 p-3 rounded-xl transition-all duration-200 cursor-pointer group
            ${isSelected 
              ? 'bg-blue-900/30 border border-blue-800/50 shadow-sm' 
              : 'hover:bg-gray-800/50 border border-transparent'
            }
            ${isDragTarget ? 'bg-green-900/30 border-green-800/50' : ''}
            ${node.level > 0 ? 'mr-4' : ''}
          `}
          draggable={!node.isDefault}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
          onClick={() => onFolderSelect(node.id)}
        >
          {/* مسافة المستوى */}
          <div style={{ width: `${node.level * 20}px` }} />

          {/* أيقونة التوسيع/الطي */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {node.isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
          )}

          {/* أيقونة المجلد */}
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${node.color}20`, border: `1px solid ${node.color}40` }}
          >
            {node.icon}
          </div>

          {/* معلومات المجلد */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-white truncate">{node.name}</h4>
              {node.isDefault && (
                <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full">
                  افتراضي
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-xs text-gray-400 truncate mt-1">{node.description}</p>
            )}
          </div>

          {/* عدد الكلمات */}
          <div className="text-sm text-gray-400">
            <span className="font-medium" style={{ color: node.color }}>
              {node.wordCount || 0}
            </span>
            <span className="mr-1">كلمة</span>
          </div>

          {/* قائمة الإجراءات */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(node.id);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="إضافة مجلد فرعي"
            >
              <FolderPlus size={14} className="text-gray-400" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditFolder(node);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="تحرير المجلد"
            >
              <Edit3 size={14} className="text-gray-400" />
            </button>

            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(node.id);
                }}
                className="p-2 hover:bg-red-900/50 rounded-lg transition-colors"
                title="حذف المجلد"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* المجلدات الفرعية */}
        {hasChildren && node.isExpanded && (
          <div className="mt-1">
            {node.children.map((child) => (
              <TreeFolderItem key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // مكون عرض المجلد في الشبكة
  const GridFolderItem: React.FC<{ folder: Folder }> = ({ folder }) => {
    const isSelected = selectedFolderId === folder.id;
    const canDelete = !folder.isDefault && (folder.wordCount || 0) === 0;

    return (
      <div
        className={`
          relative bg-gray-800 border border-gray-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer group hover:scale-105 active:scale-95 touch-manipulation
          ${isSelected ? 'ring-2 ring-blue-500 border-blue-600' : 'hover:border-gray-600'}
        `}
        onClick={() => onFolderSelect(folder.id)}
      >
        {/* أيقونة المجلد */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto"
          style={{ backgroundColor: `${folder.color}20`, border: `2px solid ${folder.color}40` }}
        >
          {folder.icon}
        </div>

        {/* معلومات المجلد */}
        <div className="text-center">
          <h3 className="font-bold text-white mb-2 truncate">{folder.name}</h3>
          
          {/* {folder.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {folder.description}
            </p>
          )} */}

          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="font-medium" style={{ color: folder.color }}>
              {folder.wordCount || 0}
            </span>
            <span className="text-gray-400">كلمة</span>
          </div>

          {/* {folder.isDefault && (
            <span className="inline-block mt-2 text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full">
              افتراضي
            </span>
          )} */}
        </div>

        {/* قائمة الإجراءات */}
        <div className="absolute top-3 left-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditFolder(folder);
            }}
            className="p-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg transition-colors"
            title="تحرير المجلد"
          >
            <Edit3 size={14} className="text-gray-300" />
          </button>

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder.id);
              }}
              className="p-2 bg-red-900/50 hover:bg-red-800 rounded-lg transition-colors"
              title="حذف المجلد"
            >
              <Trash2 size={14} className="text-red-300" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* شريط الأدوات العلوي */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        
        {/* البحث */}
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="البحث في المجلدات..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* أدوات التحكم */}
        <div className="flex items-center space-x-3">
          {/* تبديل وضع العرض */}
          <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => onViewModeChange('tree')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'tree' 
                  ? 'bg-gray-700 text-blue-400 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="عرض شجري"
            >
              <TreePine size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-gray-700 text-blue-400 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="عرض شبكي"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-gray-700 text-blue-400 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              title="عرض قائمة"
            >
              <List size={18} />
            </button>
          </div>

          {/* زر إضافة مجلد */}
          <button
            onClick={() => onCreateFolder()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
          >
            <Plus size={18} />
            <span>مجلد جديد</span>
          </button>
        </div>
      </div>

      {/* عرض المجلدات */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {viewMode === 'tree' ? (
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {folderTree.length > 0 ? (
              folderTree.map((node) => (
                <TreeFolderItem key={node.id} node={node} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FolderOpen size={48} className="mx-auto mb-4" />
                <p>لا توجد مجلدات مطابقة للبحث</p>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            {folders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {folders
                  .filter(folder => {
                    if (searchTerm) {
                      return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
                    }
                    if (!showEmptyFolders && (folder.wordCount || 0) === 0) {
                      return false;
                    }
                    return true;
                  })
                  .map((folder) => (
                    <GridFolderItem key={folder.id} folder={folder} />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FolderOpen size={48} className="mx-auto mb-4" />
                <p>لا توجد مجلدات</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {folders
              .filter(folder => {
                if (searchTerm) {
                  return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (!showEmptyFolders && (folder.wordCount || 0) === 0) {
                  return false;
                }
                return true;
              })
              .map((folder) => (
                <div
                  key={folder.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedFolderId === folder.id 
                      ? 'bg-blue-900/20' 
                      : 'hover:bg-gray-700/50'
                  }`}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${folder.color}20`, border: `1px solid ${folder.color}40` }}
                    >
                      {folder.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-gray-400 truncate">{folder.description}</p>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium" style={{ color: folder.color }}>
                        {folder.wordCount || 0}
                      </span>
                      <span className="text-gray-400 mr-1">كلمة</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManager;