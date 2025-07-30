// src/components/cloud/CloudSyncPanel.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { UserData } from '@/types/supabase';
import {
  Calendar,
  Cloud,
  CloudOff,
  Database,
  Download,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import AuthModal from '../auth/AuthModal';

interface CloudSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudSyncPanel({ isOpen, onClose }: CloudSyncPanelProps) {
  const { user, signOut } = useAuth();
  const { 
    syncStatus, 
    cloudData, 
    uploadToCloud, 
    downloadFromCloud, 
    deleteFromCloud,
    refreshCloudData 
  } = useCloudSync();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!uploadName.trim()) return;
    
    setActionLoading('upload');
    try {
      await uploadToCloud(uploadName.trim());
      setUploadName('');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (dataId?: string) => {
    setActionLoading(`download-${dataId || 'latest'}`);
    try {
      await downloadFromCloud(dataId);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (dataId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البيانات؟')) return;
    
    setActionLoading(`delete-${dataId}`);
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

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-gray-800 rounded-3xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                syncStatus.isConnected 
                  ? 'bg-gradient-to-br from-green-500 to-blue-600' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}>
                {syncStatus.isConnected ? <Cloud size={24} className="text-white" /> : <CloudOff size={24} className="text-white" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">المزامنة السحابية</h3>
                <p className="text-sm text-gray-400">
                  {user ? `مرحباً، ${user.email}` : 'غير متصل'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user && (
                <button
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-xl transition-all"
                  title="تسجيل الخروج"
                >
                  <User size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          {!user ? (
            // Not authenticated
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cloud size={40} className="text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                احفظ بياناتك في السحابة
              </h4>
              <p className="text-gray-400 mb-6 leading-relaxed">
                سجل دخولك لحفظ البطاقات التعليمية والوصول إليها من أي جهاز
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          ) : (
            // Authenticated
            <div className="space-y-6">
              
              {/* Sync Status */}
              <div className="bg-gray-700/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">حالة المزامنة</span>
                  <div className={`flex items-center space-x-2 ${
                    syncStatus.isConnected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {syncStatus.syncInProgress && <Loader2 size={16} className="animate-spin" />}
                    <span className="text-sm">
                      {syncStatus.isConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
                
                {syncStatus.lastSyncAt && (
                  <p className="text-gray-400 text-sm">
                    آخر مزامنة: {formatDate(new Date(syncStatus.lastSyncAt).toISOString())}
                  </p>
                )}
                
                {syncStatus.error && (
                  <p className="text-red-400 text-sm mt-2">{syncStatus.error}</p>
                )}
              </div>

              {/* Upload Section */}
              <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-4">
                <h4 className="text-green-400 font-bold mb-3 flex items-center space-x-2">
                  <Upload size={20} />
                  <span>رفع البيانات الحالية</span>
                </h4>
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="اسم النسخة الاحتياطية"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:border-green-500 outline-none"
                  />
                  <button
                    onClick={handleUpload}
                    disabled={!uploadName.trim() || actionLoading === 'upload'}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
                  >
                    {actionLoading === 'upload' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>رفع</span>
                  </button>
                </div>
              </div>

              {/* Cloud Data List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-bold flex items-center space-x-2">
                    <Database size={20} />
                    <span>البيانات المحفوظة ({cloudData.length})</span>
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
                    <div className="text-center py-8 text-gray-400">
                      لا توجد بيانات محفوظة في السحابة
                    </div>
                  ) : (
                    cloudData.map((data) => (
                      <div
                        key={data.id}
                        className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 hover:border-gray-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">{data.data_name}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                              <span>{data.metadata.totalWords} كلمة</span>
                              <span>{data.metadata.masteredWords} محفوظة</span>
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(data.updated_at)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDownload(data.id)}
                              disabled={actionLoading === `download-${data.id}`}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-xl transition-all"
                              title="تحميل"
                            >
                              {actionLoading === `download-${data.id}` ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Download size={16} />
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(data.id)}
                              disabled={actionLoading === `delete-${data.id}`}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all"
                              title="حذف"
                            >
                              {actionLoading === `delete-${data.id}` ? (
                                <Loader2 size={16} className="animate-spin" />
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
            </div>
          )}
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