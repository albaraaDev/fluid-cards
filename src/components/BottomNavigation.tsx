// src/components/BottomNavigation.tsx - إضافة رابط المجلدات
'use client';

import { useApp } from '@/context/AppContext';
import { BarChart3, BookOpen, Brain, FolderOpen, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import SlideUpAddForm from './SlideUpAddForm';

const BottomNavigation: React.FC = () => {
  const { stats } = useApp();
  const pathname = usePathname();
  const [showAddForm, setShowAddForm] = useState(false);

  // تعريف عناصر التنقل - مع إضافة المجلدات
  const navItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      href: '/',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-800/50',
    },
    {
      id: 'cards',
      label: 'البطاقات',
      icon: BookOpen,
      href: '/cards',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-800/50',
    },
    {
      id: 'folders',
      label: 'المجلدات',
      icon: FolderOpen,
      href: '/folders',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-900/30',
      borderColor: 'border-indigo-800/50',
    },
    {
      id: 'study',
      label: 'المراجعة',
      icon: Brain,
      href: '/study',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-800/50',
      badge:
        stats.wordsNeedingReview > 0 ? stats.wordsNeedingReview : undefined,
    },
    {
      id: 'stats',
      label: 'الإحصائيات',
      icon: BarChart3,
      href: '/stats',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/30',
      borderColor: 'border-orange-800/50',
    },
  ];

  // التحقق من كون الرابط نشط
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative flex items-center justify-center">
            {/* Navigation Items - الآن 5 عناصر */}
            <div className="flex items-center justify-center gap-2 lg:gap-4 w-full max-w-2xl">
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      relative flex flex-col items-center space-y-1 p-2 lg:p-3 rounded-2xl transition-all duration-300 group flex-1 max-w-[80px]
                      ${
                        active
                          ? `${item.bgColor} ${item.borderColor} border`
                          : 'hover:bg-gray-800/50'
                      }
                      hover:scale-105 active:scale-95 touch-manipulation
                    `}
                  >
                    {/* Icon Container */}
                    <div className="relative">
                      <Icon
                        size={18}
                        className={`
                          lg:w-5 lg:h-5 transition-colors duration-200
                          ${
                            active
                              ? item.color
                              : 'text-gray-400 group-hover:text-gray-300'
                          }
                        `}
                      />

                      {/* Badge للمراجعة */}
                      {item.badge && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {active && (
                      <>
                        {/* Label */}
                        <span
                          className={`
                            text-xs font-medium transition-colors duration-200 text-center
                            ${
                              active
                                ? item.color
                                : 'text-gray-400 group-hover:text-gray-300'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                        {/* Active Indicator */}
                        <div
                          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 ${item.color.replace(
                            'text-',
                            'bg-'
                          )} rounded-full`}
                        />
                      </>
                    )}
                  </Link>
                );
              })}

              {/* Add Button - في المنتصف */}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation group shrink-0"
                title="إضافة كلمة جديدة"
              >
                <Plus
                  size={20}
                  className="text-white lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {navItems.slice(2).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      relative flex flex-col items-center space-y-1 p-2 lg:p-3 rounded-2xl transition-all duration-300 group flex-1 max-w-[80px]
                      ${
                        active
                          ? `${item.bgColor} ${item.borderColor} border`
                          : 'hover:bg-gray-800/50'
                      }
                      hover:scale-105 active:scale-95 touch-manipulation
                    `}
                  >
                    {/* Icon Container */}
                    <div className="relative">
                      <Icon
                        size={18}
                        className={`
                          lg:w-5 lg:h-5 transition-colors duration-200
                          ${
                            active
                              ? item.color
                              : 'text-gray-400 group-hover:text-gray-300'
                          }
                        `}
                      />

                      {/* Badge للمراجعة */}
                      {item.badge && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {active && (
                      <>
                        {/* Label */}
                        <span
                          className={`
                            text-xs font-medium transition-colors duration-200 text-center
                            ${
                              active
                                ? item.color
                                : 'text-gray-400 group-hover:text-gray-300'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                        {/* Active Indicator */}
                        <div
                          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 ${item.color.replace(
                            'text-',
                            'bg-'
                          )} rounded-full`}
                        />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Add Word Form */}
      <SlideUpAddForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </>
  );
};

export default BottomNavigation;