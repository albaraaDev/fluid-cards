'use client';

import { Download, Settings, Upload } from 'lucide-react';
import React from 'react';

type NavigationTab = 'home' | 'cards' | 'study' | 'stats';

interface SimpleHeaderProps {
  onTabChange: (tab: NavigationTab) => void;
  onExport: () => void;
  onImport: () => void;
  onSettings?: () => void;
}

export default function SimpleHeader({
  onTabChange,
  onExport,
  onImport,
  onSettings,
}: SimpleHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fluid Cards</h1>
              <p className="text-sm text-gray-500">بطاقات تعليمية ذكية</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExport}
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              title="تصدير البيانات"
            >
              <Download size={20} />
            </button>

            <button
              onClick={onImport}
              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
              title="استيراد البيانات"
            >
              <Upload size={20} />
            </button>

            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                title="الإعدادات"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
