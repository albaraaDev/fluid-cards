// src/components/sync/UnifiedSyncCenter.tsx
'use client';

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { UserData } from '@/types/supabase';
import {
  Calendar,
  Cloud,
  CloudOff,
  Database,
  Download,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Save,
  Server,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import AuthModal from '../auth/AuthModal';

interface UnifiedSyncCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'local' | 'cloud';

export default function UnifiedSyncCenter({
  isOpen,
  onClose,
}: UnifiedSyncCenterProps) {
  const { exportData, importData } = useApp();
  const { user, signOut } = useAuth();
  const {
    syncStatus,
    cloudData,
    uploadToCloud,
    downloadFromCloud,
    deleteFromCloud,
    refreshCloudData,
  } = useCloudSync();

  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setActionLoading('file-import');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const success = await importData(data);

      if (success) {
        alert('تم استيراد البيانات بنجاح! 🎉');
      } else {
        alert('فشل في استيراد البيانات. تأكد من صحة الملف.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('خطأ في قراءة الملف. تأكد من أنه ملف JSON صحيح.');
    }

    setActionLoading(null);
    event.target.value = '';
  };

  const handleFileExport = async () => {
    setActionLoading('file-export');
    try {
      await exportData();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloudUpload = async () => {
    if (!uploadName.trim()) return;

    setActionLoading('cloud-upload');
    try {
      await uploadToCloud(uploadName.trim());
      setUploadName('');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloudDownload = async (dataId?: string) => {
    setActionLoading(`cloud-download-${dataId || 'latest'}`);
    try {
      await downloadFromCloud(dataId);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloudDelete = async (dataId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البيانات؟')) return;

    setActionLoading(`cloud-delete-${dataId}`);
    try {
      await deleteFromCloud(dataId);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    {
      id: 'local' as TabType,
      label: 'النسخ المحلية',
      icon: HardDrive,
      color: 'blue',
      description: 'ملفات على جهازك',
    },
    {
      id: 'cloud' as TabType,
      label: 'السحابة',
      icon: user ? (syncStatus.isConnected ? Cloud : CloudOff) : Cloud,
      color: user ? (syncStatus.isConnected ? 'green' : 'red') : 'gray',
      description: user
        ? syncStatus.isConnected
          ? 'متصل'
          : 'غير متصل'
        : 'غير مسجل',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-gray-800 rounded-3xl p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Save size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  مركز المزامنة والنسخ الاحتياطي
                </h3>
                <p className="text-sm text-gray-400">
                  إدارة بياناتك محلياً وعلى السحابة
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* User Info & Sign Out */}
              {user && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-xl border border-gray-600/50">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-300 hidden sm:inline">
                    {user.email.split('@')[0]}
                  </span>
                  <button
                    onClick={signOut}
                    className="p-1 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-700/30 rounded-2xl p-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gray-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? 'text-white'
                        : tab.color === 'green'
                        ? 'text-green-400'
                        : tab.color === 'red'
                        ? 'text-red-400'
                        : tab.color === 'blue'
                        ? 'text-blue-400'
                        : 'text-gray-400'
                    }
                  />
                  <div className="text-right">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            {/* Local Tab */}
            {activeTab === 'local' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Local Export Section */}
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-2xl p-6">
                    <h4 className="text-blue-400 font-bold mb-4 flex items-center space-x-2">
                      <Download size={20} />
                      <span>تصدير البيانات إلى ملف</span>
                    </h4>

                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      احفظ نسخة احتياطية من جميع بطاقاتك وإعداداتك في ملف JSON
                      على جهازك.
                    </p>

                    <button
                      onClick={handleFileExport}
                      disabled={actionLoading === 'file-export'}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      {actionLoading === 'file-export' ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Download size={20} />
                      )}
                      <span>تصدير إلى ملف</span>
                    </button>
                  </div>

                  {/* Local Import Section */}
                  <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-6">
                    <h4 className="text-green-400 font-bold mb-4 flex items-center space-x-2">
                      <Upload size={20} />
                      <span>استيراد البيانات من ملف</span>
                    </h4>

                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      استعد بياناتك من ملف JSON تم تصديره مسبقاً. سيتم استبدال
                      البيانات الحالية.
                    </p>

                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="local-import-file"
                      disabled={actionLoading === 'file-import'}
                    />

                    <label
                      htmlFor="local-import-file"
                      className={`
                      inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer
                      ${
                        actionLoading === 'file-import'
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }
                    `}
                    >
                      {actionLoading === 'file-import' ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <FolderOpen size={20} />
                      )}
                      <span>اختيار ملف</span>
                    </label>
                  </div>
                </div>

                {/* Local Info */}
                <div className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/50">
                  <div className="flex items-start space-x-3">
                    <FileText
                      size={20}
                      className="text-yellow-400 mt-1 flex-shrink-0"
                    />
                    <div>
                      <h5 className="text-yellow-400 font-medium mb-2">
                        معلومات مهمة
                      </h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• الملفات المصدرة تحتوي على جميع بياناتك مشفرة</li>
                        <li>• يمكن فتح الملفات على أي جهاز يدعم التطبيق</li>
                        <li>• احفظ نسخ احتياطية دورية لضمان سلامة البيانات</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cloud Tab */}
            {activeTab === 'cloud' && (
              <div className="space-y-6">
                {!user ? (
                  // Not authenticated
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Cloud size={40} className="text-blue-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      مزامنة البيانات مع السحابة
                    </h4>
                    <p className="text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
                      سجل دخولك لحفظ البطاقات في السحابة والوصول إليها من أي
                      جهاز في أي وقت
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      <LogIn size={20} />
                      <span>تسجيل الدخول / إنشاء حساب</span>
                    </button>
                  </div>
                ) : (
                  // Authenticated
                  <>
                    {/* Sync Status */}
                    <div
                      className={`rounded-2xl p-4 border ${
                        syncStatus.isConnected
                          ? 'bg-green-900/20 border-green-800/30'
                          : 'bg-red-900/20 border-red-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {syncStatus.isConnected ? (
                            <Cloud size={24} className="text-green-400" />
                          ) : (
                            <CloudOff size={24} className="text-red-400" />
                          )}
                          <div>
                            <div
                              className={`font-bold ${
                                syncStatus.isConnected
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {syncStatus.isConnected
                                ? 'متصل بالسحابة'
                                : 'غير متصل بالسحابة'}
                            </div>
                            {syncStatus.lastSyncAt && (
                              <div className="text-gray-400 text-sm">
                                آخر مزامنة:{' '}
                                {formatDate(
                                  new Date(syncStatus.lastSyncAt).toISOString()
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {syncStatus.syncInProgress && (
                          <Loader2
                            size={20}
                            className="text-blue-400 animate-spin"
                          />
                        )}
                      </div>

                      {syncStatus.error && (
                        <div className="mt-3 p-3 bg-red-900/30 border border-red-800/50 rounded-xl">
                          <p className="text-red-400 text-sm">
                            {syncStatus.error}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cloud Upload */}
                    <div className="bg-purple-900/20 border border-purple-800/30 rounded-2xl p-6">
                      <h4 className="text-purple-400 font-bold mb-4 flex items-center space-x-2">
                        <Server size={20} />
                        <span>رفع البيانات الحالية للسحابة</span>
                      </h4>

                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        احفظ نسخة من بياناتك الحالية في السحابة لتتمكن من الوصول
                        إليها من أي جهاز.
                      </p>

                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <input
                          type="text"
                          value={uploadName}
                          onChange={(e) => setUploadName(e.target.value)}
                          placeholder="اسم النسخة الاحتياطية"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 outline-none transition-all"
                        />
                        <button
                          onClick={handleCloudUpload}
                          disabled={
                            !uploadName.trim() ||
                            actionLoading === 'cloud-upload'
                          }
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                        >
                          {actionLoading === 'cloud-upload' ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Upload size={20} />
                          )}
                          <span>رفع للسحابة</span>
                        </button>
                      </div>
                    </div>

                    {/* Cloud Data List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold flex items-center space-x-2">
                          <Database size={20} />
                          <span>
                            البيانات المحفوظة في السحابة ({cloudData.length})
                          </span>
                        </h4>
                        <button
                          onClick={refreshCloudData}
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-all"
                          title="تحديث"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cloudData.length === 0 ? (
                          <div className="text-center py-8 bg-gray-700/20 rounded-2xl border border-gray-600/30">
                            <Database
                              size={40}
                              className="text-gray-400 mx-auto mb-3"
                            />
                            <p className="text-gray-400">
                              لا توجد بيانات محفوظة في السحابة
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              قم برفع بياناتك أولاً
                            </p>
                          </div>
                        ) : (
                          cloudData.map((data) => (
                            <div
                              key={data.id}
                              className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:border-gray-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="text-white font-medium mb-2">
                                    {data.data_name}
                                  </h5>

                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                                    <div className="flex items-center space-x-1">
                                      <FileText size={14} />
                                      <span>
                                        {data.metadata.totalWords} كلمة
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Zap size={14} />
                                      <span>
                                        {data.metadata.masteredWords} محفوظة
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Calendar size={14} />
                                      <span>{formatDate(data.updated_at)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Server size={14} />
                                      <span>v{data.metadata.appVersion}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => handleCloudDownload(data.id)}
                                    disabled={
                                      actionLoading ===
                                      `cloud-download-${data.id}`
                                    }
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-xl transition-all"
                                    title="تحميل هذه البيانات"
                                  >
                                    {actionLoading ===
                                    `cloud-download-${data.id}` ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Download size={16} />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleCloudDelete(data.id)}
                                    disabled={
                                      actionLoading ===
                                      `cloud-delete-${data.id}`
                                    }
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all"
                                    title="حذف من السحابة"
                                  >
                                    {actionLoading ===
                                    `cloud-delete-${data.id}` ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Cloud Info */}
                    <div className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/50">
                      <div className="flex items-start space-x-3">
                        <Cloud
                          size={20}
                          className="text-blue-400 mt-1 flex-shrink-0"
                        />
                        <div>
                          <h5 className="text-blue-400 font-medium mb-2">
                            مزايا السحابة
                          </h5>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• بياناتك محمية ومشفرة تماماً</li>
                            <li>• متاحة من أي جهاز بحسابك</li>
                            <li>• نسخ احتياطية متعددة</li>
                            <li>• مزامنة عند الطلب فقط</li>
                            <li>• يعمل مع النظام المحلي جنباً إلى جنب</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
    </>
  );
}
