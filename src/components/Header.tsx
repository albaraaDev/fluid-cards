// src/components/Header.tsx
'use client';

import React from 'react';

interface HeaderProps {
  totalWords: number;
  masteredWords: number;
  onExport: () => void;
  onImport: () => void;
  onResetData: () => void;
}

export default function Header({
  totalWords,
  masteredWords,
  onExport,
  onImport,
  onResetData
}: HeaderProps) {
  const progress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      {/* الشعار والعنوان */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
          📚
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Fluid Cards
          </h1>
          <p className="text-gray-600 text-sm">
            بطاقات تعليمية ذكية
          </p>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
          <div className="text-sm text-gray-600">إجمالي الكلمات</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{masteredWords}</div>
          <div className="text-sm text-gray-600">كلمات محفوظة</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {progress.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">التقدم</div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
          title="تصدير البيانات"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden md:inline">تصدير</span>
        </button>

        <button
          onClick={onImport}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
          title="استيراد البيانات"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <span className="hidden md:inline">استيراد</span>
        </button>

        <button
          onClick={onResetData}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
          title="إعادة تعيين البيانات"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden md:inline">مسح الكل</span>
        </button>
      </div>
    </div>
  );
}