'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import React from 'react';

interface SyncStatusBadgeProps {
  className?: string;
  showText?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ 
  className = '', 
  showText = false 
}) => {
  const { user } = useAuth();
  const { syncStatus } = useCloudSync();

  const getStatusInfo = () => {
    if (!user) {
      return {
        color: 'bg-gray-500',
        text: 'غير مسجل',
        pulse: false
      };
    }

    if (syncStatus.syncInProgress) {
      return {
        color: 'bg-yellow-400',
        text: 'مزامنة...',
        pulse: true
      };
    }

    if (syncStatus.isConnected) {
      return {
        color: 'bg-green-400',
        text: 'متصل',
        pulse: false
      };
    }

    return {
      color: 'bg-red-400',
      text: 'غير متصل',
      pulse: false
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full ${status.color} ${
          status.pulse ? 'animate-pulse' : ''
        }`} 
      />
      {showText && (
        <span className="text-xs text-gray-400">{status.text}</span>
      )}
    </div>
  );
};