// src/components/folders/FolderCard.tsx
'use client';

import { Folder } from '@/types/flashcard';
import {
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Edit3,
  FolderOpen,
  MoreVertical,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';

interface FolderCardProps {
  folder: Folder;
  compact?: boolean; // للعرض المضغوط في قائمة
  wordsInFolder?: number; // عدد الكلمات الفعلي
  masteredWords?: number; // عدد الكلمات المحفوظة
  wordsNeedingReview?: number; // عدد الكلمات التي تحتاج مراجعة
  onSelect?: (folder: Folder) => void;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folderId: string) => void;
  onStudy?: (folderId: string) => void;
  onViewWords?: (folderId: string) => void;
  showActions?: boolean;
  className?: string;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  compact = false,
  wordsInFolder = folder.wordCount || 0,
  masteredWords = 0,
  wordsNeedingReview = 0,
  onSelect,
  onEdit,
  onDelete,
  onStudy,
  onViewWords,
  showActions = true,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // حساب الإحصائيات
  const progress = wordsInFolder > 0 ? (masteredWords / wordsInFolder) * 100 : 0;
  const canDelete = !folder.isDefault && wordsInFolder === 0;
  const hasWords = wordsInFolder > 0;

  // ألوان الحالة
  const getStatusColor = () => {
    if (wordsInFolder === 0) return 'text-gray-400';
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-blue-400';
  };

  // النص الوصفي للحالة
  const getStatusText = () => {
    if (wordsInFolder === 0) return 'مجلد فارغ';
    if (progress >= 80) return 'مجلد متقن';
    if (wordsNeedingReview > 0) return `${wordsNeedingReview} للمراجعة`;
    return 'في التطوير';
  };

  // معالج النقر على البطاقة
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(folder);
    } else if (onViewWords && hasWords) {
      onViewWords(folder.id);
    }
  };

  if (compact) {
    // العرض المضغوط للقائمة
    return (
      <div 
        className={`
          bg-gray-800 border border-gray-700 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:border-gray-600 hover:bg-gray-700/50 group
          ${className}
        `}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4">
          {/* أيقونة المجلد */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ 
              backgroundColor: `${folder.color}20`, 
              border: `1px solid ${folder.color}40` 
            }}
          >
            {folder.icon}
          </div>

          {/* معلومات المجلد */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white truncate">{folder.name}</h3>
              {folder.isDefault && (
                <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded-full shrink-0">
                  افتراضي
                </span>
              )}
            </div>
            
            {folder.description && (
              <p className="text-sm text-gray-400 truncate mb-2">{folder.description}</p>
            )}

            {/* إحصائيات سريعة */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <BookOpen size={14} className="text-gray-400" />
                <span className={getStatusColor()}>{wordsInFolder}</span>
                <span className="text-gray-500">كلمة</span>
              </div>
              
              {masteredWords > 0 && (
                <div className="flex items-center space-x-1">
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-green-400">{masteredWords}</span>
                </div>
              )}
              
              {wordsNeedingReview > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock size={14} className="text-orange-400" />
                  <span className="text-orange-400">{wordsNeedingReview}</span>
                </div>
              )}
            </div>
          </div>

          {/* شريط التقدم */}
          {hasWords && (
            <div className="w-16 text-center shrink-0">
              <div className="text-sm font-medium text-gray-300 mb-1">
                {progress.toFixed(0)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${folder.color}80, ${folder.color})`
                  }}
                />
              </div>
            </div>
          )}

          {/* قائمة الإجراءات */}
          {showActions && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <div className="absolute left-0 top-10 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-10 min-w-[120px]">
                  {hasWords && onStudy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStudy(folder.id);
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-green-400 hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Brain size={14} />
                      <span>دراسة</span>
                    </button>
                  )}
                  
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(folder);
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-blue-400 hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Edit3 size={14} />
                      <span>تحرير</span>
                    </button>
                  )}

                  {canDelete && onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(folder.id);
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-red-400 hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // العرض العادي للشبكة
  return (
    <div 
      className={`
        relative bg-gray-800 border border-gray-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer group hover:scale-105 active:scale-95 touch-manipulation hover:border-gray-600 hover:shadow-xl
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Badge الافتراضي */}
      {folder.isDefault && (
        <div className="absolute top-3 right-3 bg-blue-900/40 text-blue-400 text-xs px-2 py-1 rounded-full">
          افتراضي
        </div>
      )}

      {/* أيقونة المجلد */}
      <div className="text-center mb-4">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 transition-all duration-300"
          style={{ 
            backgroundColor: `${folder.color}20`, 
            border: `2px solid ${folder.color}40`,
            boxShadow: `0 0 20px ${folder.color}20`
          }}
        >
          {folder.icon}
        </div>

        {/* اسم المجلد */}
        <h3 className="font-bold text-white text-lg mb-2 truncate">
          {folder.name}
        </h3>

        {/* وصف المجلد */}
        {folder.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
            {folder.description}
          </p>
        )}
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="space-y-4">
        {/* عدد الكلمات وشريط التقدم */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BookOpen size={18} className="text-gray-400" />
            <span className={`text-xl font-bold ${getStatusColor()}`}>
              {wordsInFolder}
            </span>
            <span className="text-gray-400">كلمة</span>
          </div>

          {hasWords && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${folder.color}80, ${folder.color})`
                  }}
                />
              </div>
              <div className="text-sm text-gray-400">
                {progress.toFixed(0)}% مكتملة
              </div>
            </>
          )}
        </div>

        {/* إحصائيات تفصيلية */}
        {hasWords && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-800/30">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-green-400 font-bold">{masteredWords}</span>
              </div>
              <div className="text-gray-400 text-xs">محفوظة</div>
            </div>

            <div className="bg-orange-900/20 rounded-lg p-3 text-center border border-orange-800/30">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock size={14} className="text-orange-400" />
                <span className="text-orange-400 font-bold">{wordsNeedingReview}</span>
              </div>
              <div className="text-gray-400 text-xs">للمراجعة</div>
            </div>
          </div>
        )}

        {/* حالة المجلد */}
        <div className="text-center">
          <div className={`inline-flex items-center space-x-2 text-sm ${getStatusColor()}`}>
            {wordsInFolder === 0 ? (
              <FolderOpen size={16} />
            ) : progress >= 80 ? (
              <CheckCircle size={16} />
            ) : wordsNeedingReview > 0 ? (
              <Clock size={16} />
            ) : (
              <BookOpen size={16} />
            )}
            <span>{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات السريعة */}
      {showActions && (
        <div className="mt-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasWords && onStudy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStudy(folder.id);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-900/30 hover:bg-green-800/50 text-green-400 py-2 px-3 rounded-lg transition-colors text-sm"
              title="بدء الدراسة"
            >
              <Brain size={14} />
              <span>دراسة</span>
            </button>
          )}

          {hasWords && onViewWords && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewWords(folder.id);
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 py-2 px-3 rounded-lg transition-colors text-sm"
              title="عرض الكلمات"
            >
              <BookOpen size={14} />
              <span>عرض</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
              className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-3 rounded-lg transition-colors"
              title="تحرير المجلد"
            >
              <Edit3 size={14} />
            </button>
          )}

          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
              }}
              className="flex items-center justify-center bg-red-900/30 hover:bg-red-800/50 text-red-400 py-2 px-3 rounded-lg transition-colors"
              title="حذف المجلد"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* تأثير النقر */}
      <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default FolderCard;