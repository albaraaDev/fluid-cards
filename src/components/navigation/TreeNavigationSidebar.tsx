// src/components/navigation/TreeNavigationSidebar.tsx - شريط التنقل الهرمي
'use client';

import { Folder, FolderTreeNode } from '@/types/flashcard';
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FolderPlus,
  Home,
  Plus,
  Search,
  Settings,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

interface TreeNavigationSidebarProps {
  folders: Folder[];
  wordsCount: { [folderId: string]: number };
  isOpen: boolean;
  onToggle: () => void;
  onFolderSelect?: (folderId: string) => void;
  onCreateFolder?: (parentId?: string) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folderId: string) => void;
  className?: string;
}

const TreeNavigationSidebar: React.FC<TreeNavigationSidebarProps> = ({
  folders,
  wordsCount,
  isOpen,
  onToggle,
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  className = '',
}) => {
  const pathname = usePathname();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['general']));
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // بناء الشجرة الهرمية
  const folderTree = useMemo(() => {
    const buildTree = (parentId?: string, level: number = 0): FolderTreeNode[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .filter(folder => {
          // فلترة البحث
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return folder.name.toLowerCase().includes(searchLower) ||
                   (folder.description && folder.description.toLowerCase().includes(searchLower));
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
  }, [folders, searchTerm, expandedFolders]);

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

  // التحقق من النشاط للروابط
  const isActiveLink = (path: string): boolean => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // معالجات السحب والإفلات
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder?.isDefault) {
      e.preventDefault();
      return;
    }
    
    setDraggedFolderId(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedFolderId && draggedFolderId !== targetFolderId) {
      setDropTargetId(targetFolderId);
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    
    if (draggedFolderId && draggedFolderId !== targetFolderId) {
      // التحقق من عدم إنشاء دورة لانهائية
      const isDescendant = (checkId: string, ancestorId: string): boolean => {
        const folder = folders.find(f => f.id === checkId);
        if (!folder || !folder.parentId) return false;
        if (folder.parentId === ancestorId) return true;
        return isDescendant(folder.parentId, ancestorId);
      };

      if (!isDescendant(targetFolderId, draggedFolderId)) {
        // يمكن تنفيذ عملية النقل هنا
        console.log(`Moving folder ${draggedFolderId} to ${targetFolderId}`);
      }
    }
    
    setDraggedFolderId(null);
    setDropTargetId(null);
  };

  // مكون عنصر المجلد في الشجرة
  const TreeFolderItem: React.FC<{ node: FolderTreeNode }> = ({ node }) => {
    const hasChildren = node.children.length > 0;
    const wordCount = wordsCount[node.id] || 0;
    const isDragTarget = dropTargetId === node.id;
    const folderPath = `/folders/${node.id}`;
    const isActive = isActiveLink(folderPath);

    return (
      <div className="select-none">
        {/* المجلد الرئيسي */}
        <div
          className={`
            group flex items-center space-x-2 p-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer relative
            ${isActive 
              ? 'bg-blue-900/30 border border-blue-800/50 shadow-sm' 
              : 'hover:bg-gray-800/50 border border-transparent'
            }
            ${isDragTarget ? 'bg-green-900/30 border-green-800/50' : ''}
          `}
          draggable={!node.isDefault}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
          onClick={(e) => {
            e.preventDefault();
            if (onFolderSelect) {
              onFolderSelect(node.id);
            }
          }}
        >
          {/* مسافة المستوى */}
          <div style={{ width: `${node.level * 16}px` }} className="shrink-0" />

          {/* أيقونة التوسيع/الطي */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors shrink-0"
            >
              {node.isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </button>
          )}

          {!hasChildren && (
            <div className="w-6 shrink-0" />
          )}

          {/* أيقونة المجلد */}
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: `${node.color}20`, border: `1px solid ${node.color}40` }}
          >
            {node.icon}
          </div>

          {/* معلومات المجلد */}
          <Link 
            href={folderPath}
            className="flex-1 min-w-0 flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white truncate text-sm">{node.name}</span>
                {node.isDefault && (
                  <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded shrink-0">
                    افتراضي
                  </span>
                )}
              </div>
            </div>

            {/* عدد الكلمات */}
            {wordCount > 0 && (
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                style={{ 
                  backgroundColor: `${node.color}20`, 
                  color: node.color 
                }}
              >
                {wordCount}
              </span>
            )}
          </Link>

          {/* قائمة الإجراءات */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <div className="flex items-center space-x-1">
              {onCreateFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFolder(node.id);
                  }}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  title="إضافة مجلد فرعي"
                >
                  <Plus size={12} className="text-gray-400" />
                </button>
              )}

              {onEditFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFolder(node);
                  }}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  title="تحرير المجلد"
                >
                  <Settings size={12} className="text-gray-400" />
                </button>
              )}

              {!node.isDefault && wordCount === 0 && onDeleteFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(node.id);
                  }}
                  className="p-1.5 hover:bg-red-900/50 rounded-lg transition-colors"
                  title="حذف المجلد"
                >
                  <X size={12} className="text-red-400" />
                </button>
              )}
            </div>
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

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 right-0 z-50 lg:z-auto
          w-80 bg-gray-900 border-l border-gray-700 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FolderOpen className="text-blue-400" size={20} />
            <h2 className="font-semibold text-white">المجلدات</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {onCreateFolder && (
              <button
                onClick={() => onCreateFolder()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="إنشاء مجلد جديد"
              >
                <FolderPlus size={16} className="text-gray-400" />
              </button>
            )}
            
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في المجلدات..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pr-10 pl-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="border-b border-gray-700">
          <Link
            href="/"
            className={`
              flex items-center space-x-3 p-4 transition-colors
              ${isActiveLink('/') && pathname === '/' 
                ? 'bg-blue-900/30 text-blue-400 border-l-2 border-blue-500' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }
            `}
          >
            <Home size={18} />
            <span className="font-medium">الرئيسية</span>
          </Link>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto">
          {folderTree.length > 0 ? (
            <div className="py-2">
              {folderTree.map((node) => (
                <TreeFolderItem key={node.id} node={node} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <FolderOpen size={32} className="mx-auto mb-3" />
              <p className="text-sm">لا توجد مجلدات مطابقة</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2"
                >
                  مسح البحث
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            {folders.length} مجلد • {Object.values(wordsCount).reduce((sum, count) => sum + count, 0)} كلمة
          </div>
        </div>
      </aside>
    </>
  );
};

export default TreeNavigationSidebar;