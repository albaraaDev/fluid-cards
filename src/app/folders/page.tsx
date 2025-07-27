// src/app/folders/page.tsx - صفحة إدارة المجلدات الرئيسية
'use client';

import CreateFolderModal from '@/components/folders/CreateFolderModal';
import FolderCard from '@/components/folders/FolderCard';
import FolderManager from '@/components/folders/FolderManager';
import { useApp } from '@/context/AppContext';
import { Folder, FolderViewMode } from '@/types/flashcard';
import {
  BarChart3,
  BookOpen,
  Brain,
  FolderOpen,
  FolderPlus,
  Settings,
  Star,
  Target,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export default function FoldersPage() {
  const router = useRouter();
  const { 
    folders, 
    words, 
    folderStats, 
    addFolder, 
    updateFolder, 
    deleteFolder, 
    moveFolder,
    getWordsInFolder 
  } = useApp();

  const [viewMode, setViewMode] = useState<FolderViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmptyFolders, setShowEmptyFolders] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  // إحصائيات سريعة للمجلدات
  const quickStats = useMemo(() => {
    const totalFolders = folders.length;
    const nonEmptyFolders = folders.filter(f => (f.wordCount || 0) > 0).length;
    const defaultFolders = folders.filter(f => f.isDefault).length;
    const customFolders = totalFolders - defaultFolders;
    
    const totalWords = words.length;
    const foldersWithWords = folderStats.filter(f => f.totalWords > 0);
    const avgWordsPerFolder = foldersWithWords.length > 0 
      ? totalWords / foldersWithWords.length 
      : 0;

    return {
      totalFolders,
      nonEmptyFolders,
      defaultFolders,
      customFolders,
      avgWordsPerFolder: Math.round(avgWordsPerFolder),
    };
  }, [folders, words, folderStats]);

  // معالج إنشاء مجلد جديد
  const handleCreateFolder = (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => {
    addFolder(folderData);
    setShowCreateModal(false);
  };

  // معالج تحرير مجلد
  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowCreateModal(true);
  };

  // معالج تحديث مجلد
  const handleUpdateFolder = (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => {
    if (editingFolder) {
      updateFolder(editingFolder.id, folderData);
      setEditingFolder(null);
      setShowCreateModal(false);
    }
  };

  // معالج حذف مجلد
  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    if (folder.isDefault) {
      alert('❌ لا يمكن حذف المجلدات الافتراضية');
      return;
    }

    const wordsInFolder = getWordsInFolder(folderId);
    if (wordsInFolder.length > 0) {
      alert('❌ لا يمكن حذف مجلد يحتوي على كلمات. يرجى نقل الكلمات أولاً');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المجلد "${folder.name}"؟`)) {
      deleteFolder(folderId);
    }
  };

  // معالج عرض تفاصيل المجلد
  const handleViewFolder = (folderId: string) => {
    router.push(`/folders/${folderId}`);
  };

  // معالج بدء الدراسة
  const handleStudyFolder = (folderId: string) => {
    router.push(`/study?folder=${folderId}`);
  };

  // معالج عرض كلمات المجلد
  const handleViewWords = (folderId: string) => {
    router.push(`/cards?folder=${folderId}`);
  };

  // إحصائيات المجلدات المحسنة
  const enhancedFolderStats = useMemo(() => {
    return folderStats.map(stat => {
      const folder = folders.find(f => f.id === stat.id);
      const wordsInFolder = getWordsInFolder(stat.id);
      
      return {
        ...stat,
        folder,
        efficiency: stat.totalWords > 0 ? (stat.masteredWords / stat.totalWords) * 100 : 0,
        wordsInFolder,
      };
    });
  }, [folderStats, folders, getWordsInFolder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">إدارة المجلدات</h1>
          <p className="text-gray-400">
            نظم كلماتك في مجلدات لتعلم أكثر فعالية
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFolder(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation"
        >
          <FolderPlus size={18} />
          <span>إنشاء مجلد جديد</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-800/30 text-center">
          <FolderOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {quickStats.totalFolders}
          </div>
          <div className="text-sm text-gray-400">إجمالي المجلدات</div>
        </div>

        <div className="bg-green-900/20 rounded-2xl p-6 border border-green-800/30 text-center">
          <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-green-400 mb-1">
            {quickStats.nonEmptyFolders}
          </div>
          <div className="text-sm text-gray-400">تحتوي على كلمات</div>
        </div>

        <div className="bg-purple-900/20 rounded-2xl p-6 border border-purple-800/30 text-center">
          <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {quickStats.customFolders}
          </div>
          <div className="text-sm text-gray-400">مجلدات مخصصة</div>
        </div>

        <div className="bg-yellow-900/20 rounded-2xl p-6 border border-yellow-800/30 text-center">
          <Target className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {quickStats.avgWordsPerFolder}
          </div>
          <div className="text-sm text-gray-400">متوسط الكلمات</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Folder Manager */}
        <div className="xl:col-span-2">
          <FolderManager
            folders={folders}
            selectedFolderId={selectedFolderId}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFolderSelect={setSelectedFolderId}
            onCreateFolder={() => {
              setEditingFolder(null);
              setShowCreateModal(true);
            }}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveFolder={moveFolder}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showEmptyFolders={showEmptyFolders}
          />
        </div>

        {/* Sidebar - Folder Details & Actions */}
        <div className="space-y-6">
          
          {/* Selected Folder Details */}
          {selectedFolderId && (
            (() => {
              const folderStat = enhancedFolderStats.find(f => f.id === selectedFolderId);
              const folder = folders.find(f => f.id === selectedFolderId);
              
              if (!folderStat || !folder) return null;

              return (
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ 
                        backgroundColor: `${folder.color}20`, 
                        border: `2px solid ${folder.color}40` 
                      }}
                    >
                      {folder.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-gray-400">{folder.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">
                        {folderStat.totalWords}
                      </div>
                      <div className="text-xs text-gray-400">إجمالي الكلمات</div>
                    </div>
                    
                    <div className="bg-green-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {folderStat.masteredWords}
                      </div>
                      <div className="text-xs text-gray-400">محفوظة</div>
                    </div>
                    
                    <div className="bg-orange-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-orange-400">
                        {folderStat.needReview}
                      </div>
                      <div className="text-xs text-gray-400">تحتاج مراجعة</div>
                    </div>
                    
                    <div className="bg-purple-900/30 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {folderStat.efficiency.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">كفاءة</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">التقدم</span>
                      <span className="text-white font-medium">
                        {folderStat.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${folderStat.progress}%`,
                          background: `linear-gradient(90deg, ${folder.color}80, ${folder.color})`
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleViewFolder(folder.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                    >
                      <FolderOpen size={18} />
                      <span>عرض التفاصيل</span>
                    </button>

                    {folderStat.totalWords > 0 && (
                      <>
                        <button
                          onClick={() => handleStudyFolder(folder.id)}
                          className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                        >
                          <Brain size={18} />
                          <span>بدء الدراسة</span>
                        </button>

                        <button
                          onClick={() => handleViewWords(folder.id)}
                          className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                        >
                          <BookOpen size={18} />
                          <span>عرض الكلمات</span>
                        </button>
                      </>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFolder(folder)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 py-2 rounded-lg transition-colors"
                      >
                        <Settings size={16} />
                        <span>تحرير</span>
                      </button>

                      {!folder.isDefault && folderStat.totalWords === 0 && (
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="flex-1 flex items-center justify-center space-x-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Quick Options */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">خيارات العرض</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmptyFolders}
                  onChange={(e) => setShowEmptyFolders(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300">عرض المجلدات الفارغة</span>
              </label>
            </div>
          </div>

          {/* Overall Statistics */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="text-purple-400" size={20} />
              <h3 className="text-lg font-semibold text-white">إحصائيات عامة</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">المجلدات الافتراضية</span>
                <span className="text-blue-400 font-medium">{quickStats.defaultFolders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">المجلدات المخصصة</span>
                <span className="text-purple-400 font-medium">{quickStats.customFolders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">متوسط الكلمات لكل مجلد</span>
                <span className="text-yellow-400 font-medium">{quickStats.avgWordsPerFolder}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">المجلدات النشطة</span>
                <span className="text-green-400 font-medium">
                  {quickStats.nonEmptyFolders}/{quickStats.totalFolders}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingFolder(null);
          }}
          onCreateFolder={editingFolder ? handleUpdateFolder : handleCreateFolder}
          existingFolders={folders}
          editingFolder={editingFolder}
        />
      )}
    </div>
  );
}