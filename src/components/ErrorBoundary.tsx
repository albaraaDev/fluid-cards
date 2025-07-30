// src/components/ErrorBoundary.tsx - معالج الأخطاء
'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Component, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // يمكن إضافة نظام تسجيل الأخطاء هنا
    if (typeof window !== 'undefined') {
      // حفظ معلومات الخطأ في localStorage للمطورين
      try {
        const errorReport = {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        };
        
        localStorage.setItem('last_error_report', JSON.stringify(errorReport));
      } catch (e) {
        // تجاهل أخطاء localStorage
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // إذا تم تمرير fallback مخصص
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // العرض الافتراضي للخطأ
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 text-center">
            
            {/* أيقونة الخطأ */}
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/30">
              <AlertTriangle size={40} className="text-red-400" />
            </div>

            {/* عنوان الخطأ */}
            <h1 className="text-2xl font-bold text-white mb-4">
              حدث خطأ غير متوقع
            </h1>

            {/* وصف الخطأ */}
            <p className="text-gray-400 mb-6 leading-relaxed">
              نعتذر، حدث خطأ في التطبيق. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
            </p>

            {/* معلومات الخطأ للمطورين (في وضع التطوير فقط) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-600">
                <summary className="text-gray-300 cursor-pointer font-semibold mb-2">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <div className="text-xs text-red-400 font-mono break-all">
                  <div className="mb-2">
                    <strong>الرسالة:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>المكدس:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* أزرار الإجراءات */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 touch-manipulation"
              >
                <RefreshCw size={18} />
                <span>المحاولة مرة أخرى</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 touch-manipulation"
              >
                <RefreshCw size={18} />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <Link
                href="/"
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 touch-manipulation"
              >
                <Home size={18} />
                <span>العودة للرئيسية</span>
              </Link>
            </div>

            {/* معلومات المساعدة */}
            <div className="mt-6 text-xs text-gray-500">
              إذا استمر هذا الخطأ، حاول مسح بيانات المتصفح أو استخدام متصفح آخر
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ===================================
// src/components/NotificationSystem.tsx - نظام الإشعارات البسيط
// ===================================

import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // إزالة تلقائية بعد المدة المحددة
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // دوال مساعدة للأنواع المختلفة
  const success = useCallback((title: string, message?: string) => {
    addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 7000 });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    addNotification({ type: 'warning', title, message, duration: 6000 });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string) => {
    addNotification({ type: 'info', title, message });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// مكون عرض الإشعارات
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// بطاقة الإشعار المفردة
interface NotificationCardProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Info size={20} className="text-gray-400" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/20 border-green-600/50 shadow-green-900/20';
      case 'error':
        return 'bg-red-900/20 border-red-600/50 shadow-red-900/20';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-600/50 shadow-yellow-900/20';
      case 'info':
        return 'bg-blue-900/20 border-blue-600/50 shadow-blue-900/20';
      default:
        return 'bg-gray-800/50 border-gray-600/50 shadow-gray-900/20';
    }
  };

  return (
    <div className={`
      ${getStyles()}
      backdrop-blur-xl border rounded-2xl p-4 shadow-lg
      transform transition-all duration-300 ease-out
      animate-in slide-in-from-right-full
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-gray-300 text-sm mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}
          
          {/* أزرار الإجراءات */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1 text-xs font-semibold rounded-lg transition-all touch-manipulation
                    ${action.variant === 'primary' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-300 transition-colors touch-manipulation"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Hook لاستخدام الإشعارات بسهولة
export const useQuickNotifications = () => {
  const { success, error, warning, info } = useNotifications();
  
  return {
    successSave: () => success('تم الحفظ بنجاح', 'تم حفظ التغييرات بنجاح'),
    errorSave: () => error('فشل في الحفظ', 'حدث خطأ أثناء حفظ التغييرات'),
    successDelete: () => success('تم الحذف بنجاح'),
    errorDelete: () => error('فشل في الحذف', 'حدث خطأ أثناء حذف العنصر'),
    successImport: () => success('تم الاستيراد بنجاح', 'تم استيراد البيانات بنجاح'),
    errorImport: () => error('فشل الاستيراد', 'الملف غير صالح أو تالف'),
    networkError: () => error('خطأ في الشبكة', 'تحقق من اتصالك بالإنترنت'),
    comingSoon: () => info('قريباً', 'هذه الميزة قيد التطوير'),
  };
};