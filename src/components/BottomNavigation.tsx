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
      <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 shadow-lg">
        <div className="max-w-sm mx-auto px-6 py-2">
          <div className="flex items-center justify-between relative">
            {/* Left tabs */}
            <div className="flex gap-4 items-center">
              {tabs.filter(tab => tab.position === 'left').map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'text-blue-400 bg-blue-900/30' 
                        : 'text-gray-400 hover:text-gray-300 justify-center hover:bg-gray-800/50'
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
                    {isActive && <span className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? 'text-blue-400' : 'text-gray-400'
                    }`}>{tab.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Add Button */}
            <button
              onClick={onAddWord}
              className="relative z-10 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
            >
              <Plus size={24} className="text-white group-hover:rotate-180 transition-transform duration-300" />
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 opacity-30 animate-ping"></div>
            </button>

            {/* Right tabs */}
            <div className="flex gap-4 items-center">
              {tabs.filter(tab => tab.position === 'right').map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'text-blue-400 bg-blue-900/30' 
                        : 'text-gray-400 hover:text-gray-300 justify-center hover:bg-gray-800/50'
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
                    {isActive && <span className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? 'text-blue-400' : 'text-gray-400'
                    }`}>{tab.label}</span>}
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