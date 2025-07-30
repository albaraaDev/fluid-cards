import { useApp } from '@/context/AppContext';
import { CloudService } from '@/services/cloudService';
import { CloudSyncStatus, UserData } from '@/types/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function useCloudSync() {
  const { user } = useAuth();
  const { words, categories, importData } = useApp();
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isConnected: false,
    lastSyncAt: null,
    hasUnsavedChanges: false,
    syncInProgress: false,
    error: null,
  });
  const [cloudData, setCloudData] = useState<UserData[]>([]);
  const [isClient, setIsClient] = useState(false);

  // التأكد من client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // التحقق من الاتصال
  useEffect(() => {
    if (!isClient) return;

    const checkConnection = async () => {
      if (user) {
        try {
          const isConnected = await CloudService.checkConnection();
          setSyncStatus(prev => ({ ...prev, isConnected, error: null }));
        } catch (error: any) {
          setSyncStatus(prev => ({ 
            ...prev, 
            isConnected: false, 
            error: error.message 
          }));
        }
      } else {
        setSyncStatus(prev => ({ ...prev, isConnected: false, error: null }));
      }
    };

    checkConnection();
  }, [user, isClient]);

  // تحميل قائمة البيانات السحابية
  const loadCloudDataList = useCallback(async () => {
    if (!isClient || !user) return;

    try {
      const data = await CloudService.getUserDataList();
      setCloudData(data);
      setSyncStatus(prev => ({ ...prev, error: null }));
    } catch (error: any) {
      setSyncStatus(prev => ({ ...prev, error: error.message }));
      setCloudData([]);
    }
  }, [user, isClient]);

  useEffect(() => {
    if (isClient && user) {
      loadCloudDataList();
    } else {
      setCloudData([]);
    }
  }, [user, isClient, loadCloudDataList]);

  // رفع البيانات للسحابة
  const uploadToCloud = useCallback(async (dataName: string = 'البيانات الرئيسية') => {
    if (!isClient || !user) throw new Error('المستخدم غير مسجل الدخول');

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));

    try {
      const appData = {
        words,
        categories,
        savedAt: Date.now(),
        version: '2.0',
      };

      const savedData = await CloudService.saveToCloud(appData, dataName);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: Date.now(),
        hasUnsavedChanges: false,
        syncInProgress: false,
      }));

      await loadCloudDataList(); // تحديث القائمة
      return savedData;
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        error: error.message,
        syncInProgress: false,
      }));
      throw error;
    }
  }, [user, words, categories, loadCloudDataList, isClient]);

  // تحميل البيانات من السحابة
  const downloadFromCloud = useCallback(async (dataId?: string) => {
    if (!isClient || !user) throw new Error('المستخدم غير مسجل الدخول');

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));

    try {
      const appData = await CloudService.loadFromCloud(dataId);
      const success = await importData(appData);
      
      if (success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSyncAt: Date.now(),
          hasUnsavedChanges: false,
          syncInProgress: false,
        }));
      } else {
        throw new Error('فشل في استيراد البيانات');
      }

      return success;
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        error: error.message,
        syncInProgress: false,
      }));
      throw error;
    }
  }, [user, importData, isClient]);

  // حذف البيانات من السحابة
  const deleteFromCloud = useCallback(async (dataId: string) => {
    if (!isClient || !user) throw new Error('المستخدم غير مسجل الدخول');

    try {
      await CloudService.deleteFromCloud(dataId);
      await loadCloudDataList(); // تحديث القائمة
      setSyncStatus(prev => ({ ...prev, error: null }));
    } catch (error: any) {
      setSyncStatus(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [user, loadCloudDataList, isClient]);

  // مراقبة التغييرات المحلية - فقط في client-side
  useEffect(() => {
    if (!isClient || !user || !syncStatus.lastSyncAt) return;

    const checkUnsavedChanges = () => {
      const hasChanges = Date.now() - (syncStatus.lastSyncAt || 0) > 30000; // 30 ثانية
      setSyncStatus(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
    };

    const interval = setInterval(checkUnsavedChanges, 10000); // كل 10 ثوان
    return () => clearInterval(interval);
  }, [words, categories, user, syncStatus.lastSyncAt, isClient]);

  return {
    syncStatus: isClient ? syncStatus : {
      isConnected: false,
      lastSyncAt: null,
      hasUnsavedChanges: false,
      syncInProgress: false,
      error: null,
    },
    cloudData: isClient ? cloudData : [],
    uploadToCloud,
    downloadFromCloud,
    deleteFromCloud,
    refreshCloudData: loadCloudDataList,
  };
}