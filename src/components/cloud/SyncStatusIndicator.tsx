'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { Cloud, CloudOff, Loader2, Wifi, WifiOff } from 'lucide-react';
import React from 'react';

interface SyncStatusIndicatorProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SyncStatusIndicator({ 
  showText = false, 
  size = 'md' 
}: SyncStatusIndicatorProps) {
  const { user } = useAuth();
  const { syncStatus } = useCloudSync();

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  const getStatusInfo = () => {
    if (!user) {
      return {
        icon: Cloud,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        text: 'غير مسجل',
        description: 'سجل دخولك للمزامنة'
      };
    }

    if (syncStatus.syncInProgress) {
      return {
        icon: Loader2,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        text: 'مزامنة...',
        description: 'جاري المزامنة',
        animate: 'animate-spin'
      };
    }

    if (syncStatus.isConnected) {
      return {
        icon: Cloud,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        text: 'متصل',
        description: 'متزامن مع السحابة'
      };
    }

    return {
      icon: CloudOff,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      text: 'غير متصل',
      description: 'مشكلة في الاتصال'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div 
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${
        status.bgColor
      } border-gray-600/50`}
      title={status.description}
    >
      <Icon 
        size={iconSize} 
        className={`${status.color} ${status.animate || ''}`} 
      />
      
      {showText && (
        <span className={`${textSize} ${status.color} font-medium`}>
          {status.text}
        </span>
      )}

      {syncStatus.hasUnsavedChanges && user && (
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="تغييرات غير محفوظة" />
      )}
    </div>
  );
}