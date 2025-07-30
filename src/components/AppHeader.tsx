// src/components/AppHeader.tsx
'use client';

import { useApp } from '@/context/AppContext';
import { Brain, ClipboardList, Download, Settings, Sparkles, TestTube, Upload, } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const AppHeader: React.FC = () => {
  const { exportData, importData } = useApp();
  const pathname = usePathname();
  const [showImportModal, setShowImportModal] = useState(false);

  // معالج استيراد البيانات
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const success = await importData(importedData);
        
        if (success) {
          setShowImportModal(false);
          alert('✅ تم استيراد البيانات بنجاح!');
        } else {
          alert('❌ ملف غير صالح! تأكد من أنه ملف نسخة احتياطية صحيح.');
        }
      } catch (err) {
        alert('❌ خطأ في قراءة الملف! تأكد من أنه ملف JSON صالح.');
        console.error('خطأ في استيراد البيانات:', err);
      } finally {
        setShowImportModal(false);
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // الحصول على عنوان الصفحة
  const getPageTitle = (): string => {
    switch (pathname) {
      case '/': return 'لوحة التحكم';
      case '/cards': return 'البطاقات';
      case '/study': return 'المراجعة';
      case '/tests': return 'الاختبارات';
      case '/stats': return 'الإحصائيات';
      default: return 'Fluid Cards';
    }
  };

  // الحصول على أيقونة الصفحة
  const getPageIcon = () => {
    switch (pathname) {
      case '/study': return <Brain size={20} className="text-purple-400" />;
      case '/tests': return <ClipboardList size={20} className="text-orange-400" />;
      case '/stats': return <Sparkles size={20} className="text-blue-400" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Header الأساسي */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo & Page Title - محسن للآيباد */}
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-white rounded-md opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse lg:w-4 lg:h-4"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  {getPageIcon()}
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {getPageTitle()}
                    </h1>
                    <p className="text-xs lg:text-sm text-gray-400 hidden lg:block">
                      Fluid Cards - بطاقات تعليمية ذكية
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Action Buttons - محسن للمس */}
            <div className="flex items-center space-x-2">
              
              {/* Export Button */}
              <button
                onClick={exportData}
                className="p-3 lg:p-4 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-xl lg:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                title="تصدير البيانات"
              >
                <Download size={18} className="lg:w-5 lg:h-5" />
              </button>

              {/* Import Button */}
              <button
                onClick={() => setShowImportModal(true)}
                className="p-3 lg:p-4 text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded-xl lg:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                title="استيراد البيانات"
              >
                <Upload size={18} className="lg:w-5 lg:h-5" />
              </button>

              {/* Tests Button */}
              <Link
                href="/tests"
                className="p-3 lg:p-4 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-xl lg:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                title="الاختبار"
              >
                <ClipboardList size={18} className="lg:w-5 lg:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-3xl p-6 lg:p-8 max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Upload size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                استيراد البيانات
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                اختر ملف JSON الذي تم تصديره مسبقاً لاستعادة بطاقاتك وإعداداتك
              </p>
            </div>

            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            
            <div className="space-y-3">
              <label
                htmlFor="import-file"
                className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-4 lg:py-5 rounded-2xl font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
              >
                📁 اختيار ملف
              </label>

              <button
                onClick={() => setShowImportModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-4 lg:py-5 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
              >
                إلغاء
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              الملفات المدعومة: JSON فقط
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;