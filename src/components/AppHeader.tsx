'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import {
  ClipboardList,
  Cloud,
  CloudOff,
  Loader2,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import ClientOnly from './ClientOnly';
import UnifiedSyncCenter from './sync/UnifiedSyncCenter';

const AppHeader: React.FC = () => {
  const [showSyncCenter, setShowSyncCenter] = useState(false);

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg lg:text-xl font-bold">💳</span>
              </div>
              <div>
                <Link href="/" className="block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Fluid Cards
                  </h1>
                </Link>
                <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">
                  بطاقات تعليمية ذكية
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              
              {/* Unified Sync & Backup Button - Client Only */}
              <ClientOnly fallback={
                <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gray-800">
                  <Save size={18} className="lg:w-5 lg:h-5 text-gray-400" />
                </div>
              }>
                <SyncButton onOpenSyncCenter={() => setShowSyncCenter(true)} />
              </ClientOnly>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-700" />

              {/* Tests Button */}
              <Link
                href="/tests"
                className="p-3 lg:p-4 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-xl lg:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                title="الاختبارات"
              >
                <ClipboardList size={18} className="lg:w-5 lg:h-5" />
              </Link>

              {/* User Info - Client Only */}
              <ClientOnly>
                <UserInfo />
              </ClientOnly>
            </div>
          </div>
        </div>
      </header>

      {/* Unified Sync Center - Client Only */}
      <ClientOnly>
        <UnifiedSyncCenter 
          isOpen={showSyncCenter}
          onClose={() => setShowSyncCenter(false)}
        />
      </ClientOnly>
    </>
  );
};

// مكون منفصل لزر المزامنة
const SyncButton: React.FC<{ onOpenSyncCenter: () => void }> = ({ onOpenSyncCenter }) => {
  const { user } = useAuth();
  const { syncStatus } = useCloudSync();

  // تحديد حالة الأيقونة والألوان
  const getSyncButtonStyle = () => {
    if (!user) {
      return {
        icon: Save,
        color: 'text-gray-400 hover:text-blue-400',
        bgColor: 'hover:bg-blue-900/30',
        title: 'إدارة البيانات والنسخ الاحتياطي'
      };
    }

    if (syncStatus.syncInProgress) {
      return {
        icon: Loader2,
        color: 'text-yellow-400',
        bgColor: 'hover:bg-yellow-900/30',
        title: 'جاري المزامنة...',
        animate: 'animate-spin'
      };
    }

    if (syncStatus.isConnected) {
      return {
        icon: Cloud,
        color: 'text-green-400 hover:text-green-300',
        bgColor: 'hover:bg-green-900/30',
        title: 'متصل بالسحابة - إدارة البيانات'
      };
    }

    return {
      icon: CloudOff,
      color: 'text-red-400 hover:text-red-300',
      bgColor: 'hover:bg-red-900/30',
      title: 'غير متصل - إدارة البيانات'
    };
  };

  const syncStyle = getSyncButtonStyle();
  const SyncIcon = syncStyle.icon;

  return (
    <div className="relative">
      <button
        onClick={onOpenSyncCenter}
        className={`
          relative p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation
          ${syncStyle.color} ${syncStyle.bgColor}
        `}
        title={syncStyle.title}
      >
        <SyncIcon 
          size={18} 
          className={`lg:w-5 lg:h-5 ${syncStyle.animate || ''}`} 
        />
      </button>

      {/* Status Indicators */}
      <div className="absolute -top-1 -right-1 flex items-center space-x-1">
        {/* Sync Status Dot */}
        <div 
          className={`w-3 h-3 rounded-full border-2 border-gray-800 ${
            user && syncStatus.isConnected 
              ? syncStatus.syncInProgress 
                ? 'bg-yellow-400 animate-pulse' 
                : 'bg-green-400'
              : user
                ? 'bg-red-400'
                : 'bg-gray-400'
          }`}
        />
        
        {/* Unsaved Changes Indicator */}
        {syncStatus.hasUnsavedChanges && user && (
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="تغييرات غير محفوظة" />
        )}
      </div>
    </div>
  );
};

// مكون منفصل لمعلومات المستخدم
const UserInfo: React.FC = () => {
  const { user } = useAuth();
  const { syncStatus } = useCloudSync();

  if (!user) return null;

  return (
    <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <div className={`w-2 h-2 rounded-full ${
        syncStatus.isConnected ? 'bg-green-400' : 'bg-red-400'
      }`} />
      <span className="text-sm text-gray-300">
        {user.email.split('@')[0]}
      </span>
    </div>
  );
};

export default AppHeader;