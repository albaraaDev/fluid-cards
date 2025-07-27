// src/components/advanced/BulkOperations.tsx - العمليات المجمعة للكلمات
'use client';

import FolderPicker from '@/components/folders/FolderPicker';
import { BulkOperation, Folder, Word } from '@/types/flashcard';
import {
  Archive,
  CheckSquare,
  Download,
  FolderOpen,
  Square,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface BulkOperationsProps {
  words: Word[];
  folders: Folder[];
  selectedWordIds: number[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectWord: (wordId: number) => void;
  onBulkOperation: (operation: BulkOperation) => void;
  onClose?: () => void;
  isVisible: boolean;
  className?: string;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  words,
  folders,
  selectedWordIds,
  onSelectAll,
  onSelectNone,
  onBulkOperation,
  onClose,
  isVisible,
  className = '',
}) => {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [tagToAdd, setTagToAdd] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('متوسط');

  const selectedCount = selectedWordIds.length;
  const totalWords = words.length;
  const isAllSelected = selectedCount === totalWords && totalWords > 0;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalWords;

  // معالج العمليات المجمعة
  const handleBulkMove = () => {
    if (!targetFolderId || selectedWordIds.length === 0) return;
    
    onBulkOperation({
      action: 'move',
      wordIds: selectedWordIds,
      targetFolderId,
    });
    
    setShowMoveDialog(false);
    setTargetFolderId('');
  };

  const handleBulkDelete = () => {
    if (selectedWordIds.length === 0) return;
    
    if (confirm(`هل أنت متأكد من حذف ${selectedCount} كلمة؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      onBulkOperation({
        action: 'delete',
        wordIds: selectedWordIds,
      });
    }
  };

  const handleAddTag = () => {
    if (!tagToAdd.trim() || selectedWordIds.length === 0) return;
    
    onBulkOperation({
      action: 'addTag',
      wordIds: selectedWordIds,
      tag: tagToAdd.trim(),
    });
    
    setShowTagDialog(false);
    setTagToAdd('');
  };

  const handleChangeDifficulty = () => {
    if (selectedWordIds.length === 0) return;
    
    onBulkOperation({
      action: 'updateDifficulty',
      wordIds: selectedWordIds,
      difficulty: newDifficulty,
    });
    
    setShowDifficultyDialog(false);
  };

  const handleExport = () => {
    if (selectedWordIds.length === 0) return;
    
    const selectedWords = words.filter(w => selectedWordIds.includes(w.id));
    const exportData = {
      words: selectedWords,
      exportedAt: new Date().toISOString(),
      selectionInfo: {
        totalSelected: selectedCount,
        exportType: 'bulk_selection'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const element = document.createElement('a');
    const file = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `كلمات_محددة_${new Date().toISOString().split('T')[0]}.json`;
    
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bulk Operations Bar */}
      <div className={`
        fixed bottom-20 left-4 right-4 lg:bottom-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-30 
        transform transition-all duration-300 ${selectedCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        ${className}
      `}>
        <div className="flex items-center justify-between p-4">
          
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={isAllSelected ? onSelectNone : onSelectAll}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              >
                {isAllSelected ? (
                  <CheckSquare size={18} className="text-blue-400" />
                ) : isPartialSelected ? (
                  <div className="w-[18px] h-[18px] bg-blue-400 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-800 rounded-sm" />
                  </div>
                ) : (
                  <Square size={18} className="text-gray-400" />
                )}
              </button>
              
              <span className="text-white font-medium">
                {selectedCount} من {totalWords} محدد
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Move to Folder */}
            <button
              onClick={() => setShowMoveDialog(true)}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              title="نقل إلى مجلد"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">نقل</span>
            </button>

            {/* Add Tag */}
            <button
              onClick={() => setShowTagDialog(true)}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              title="إضافة تاج"
            >
              <Tag size={16} />
              <span className="hidden sm:inline">تاج</span>
            </button>

            {/* Change Difficulty */}
            <button
              onClick={() => setShowDifficultyDialog(true)}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              title="تغيير الصعوبة"
            >
              <Archive size={16} />
              <span className="hidden sm:inline">صعوبة</span>
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              title="تصدير المحدد"
            >
              <Download size={16} />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleBulkDelete}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 touch-manipulation"
              title="حذف المحدد"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">حذف</span>
            </button>

            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="إغلاق"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Move Dialog */}
      {showMoveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                نقل {selectedCount} كلمة إلى مجلد
              </h3>
              
              <FolderPicker
                folders={folders}
                selectedFolderId={targetFolderId}
                onSelectFolder={setTargetFolderId}
                placeholder="اختر المجلد الهدف..."
                showSearch={true}
                showHierarchy={true}
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleBulkMove}
                  disabled={!targetFolderId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
                >
                  نقل الكلمات
                </button>
                <button
                  onClick={() => {
                    setShowMoveDialog(false);
                    setTargetFolderId('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tag Dialog */}
      {showTagDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                إضافة تاج لـ {selectedCount} كلمة
              </h3>
              
              <input
                type="text"
                value={tagToAdd}
                onChange={(e) => setTagToAdd(e.target.value)}
                placeholder="اسم التاج الجديد..."
                className="w-full bg-gray-700 border border-gray-600 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                maxLength={20}
                autoFocus
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddTag}
                  disabled={!tagToAdd.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
                >
                  إضافة التاج
                </button>
                <button
                  onClick={() => {
                    setShowTagDialog(false);
                    setTagToAdd('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Difficulty Dialog */}
      {showDifficultyDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                تغيير صعوبة {selectedCount} كلمة
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
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
                      onClick={() => setNewDifficulty(level)}
                      className={`
                        py-4 px-4 rounded-xl border-2 font-medium transition-all
                        hover:scale-105 active:scale-95 touch-manipulation
                        ${newDifficulty === level ? selectedColors[level] : colors[level]}
                      `}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleChangeDifficulty}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-medium transition-all"
                >
                  تغيير الصعوبة
                </button>
                <button
                  onClick={() => setShowDifficultyDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-medium transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperations;