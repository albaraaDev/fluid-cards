// src/components/BottomNavigation.tsx
'use client';

import { BarChart3, BookOpen, Brain, Home, Plus } from 'lucide-react';
import React from 'react';

type NavigationTab = 'home' | 'cards' | 'study' | 'stats';

interface BottomNavigationProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onAddWord: () => void;
  wordsNeedingReview: number;
}

export default function BottomNavigation({ 
  currentTab, 
  onTabChange, 
  onAddWord,
  wordsNeedingReview 
}: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home' as const,
      icon: Home,
      label: 'الرئيسية',
      position: 'left'
    },
    {
      id: 'cards' as const,
      icon: BookOpen,
      label: 'البطاقات',
      position: 'left'
    },
    {
      id: 'study' as const,
      icon: Brain,
      label: 'المراجعة',
      position: 'right',
      badge: wordsNeedingReview > 0 ? wordsNeedingReview : undefined
    },
    {
      id: 'stats' as const,
      icon: BarChart3,
      label: 'الإحصائيات',
      position: 'right'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Left tabs */}
            <div className="flex space-x-8">
              {tabs.filter(tab => tab.position === 'left').map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <Icon 
                        size={24} 
                        className={`transition-all duration-200 ${
                          isActive ? 'scale-110' : ''
                        }`}
                      />
                      {tab.badge && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Center Add Button */}
            <button
              onClick={onAddWord}
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
            >
              <Plus 
                size={28} 
                className="transition-transform duration-200 group-hover:rotate-90" 
              />
            </button>

            {/* Right tabs */}
            <div className="flex space-x-8">
              {tabs.filter(tab => tab.position === 'right').map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <Icon 
                        size={24} 
                        className={`transition-all duration-200 ${
                          isActive ? 'scale-110' : ''
                        }`}
                      />
                      {tab.badge && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}