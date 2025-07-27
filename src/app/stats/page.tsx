// src/app/stats/page.tsx - صفحة الإحصائيات الكاملة المستعادة مع المجلدات
'use client';

import { useApp } from '@/context/AppContext';
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  FolderOpen,
  PieChart,
  Star,
  Tag,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export default function StatsPage() {
  const { words, folders, stats, folderStats } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'detailed'>('overview');

  // إحصائيات متقدمة
  const advancedStats = useMemo(() => {
    if (words.length === 0) {
      return {
        totalReviews: 0,
        averageCorrectRate: 0,
        categoryStats: [],
        difficultyStats: [],
        streakData: { current: 0, longest: 0 },
        recentActivity: [],
        learningVelocity: 0,
        weeklyProgress: [],
        popularTags: [],
        avgEaseFactor: 2.5,
        avgInterval: 1,
        totalRepetitions: 0,
      };
    }

    // إجمالي المراجعات
    const totalReviews = words.reduce((sum, word) => sum + word.correctCount + word.incorrectCount, 0);
    
    // معدل الإجابات الصحيحة
    const totalCorrect = words.reduce((sum, word) => sum + word.correctCount, 0);
    const averageCorrectRate = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    // إحصائيات التاجات
    const allTags = words.flatMap(word => word.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // إحصائيات الصعوبة
    const difficultyStats = {
      'سهل': words.filter(w => w.difficulty === 'سهل').length,
      'متوسط': words.filter(w => w.difficulty === 'متوسط').length,
      'صعب': words.filter(w => w.difficulty === 'صعب').length,
    };

    // إحصائيات SM-2
    const avgEaseFactor = words.length > 0 
      ? words.reduce((sum, w) => sum + w.easeFactor, 0) / words.length 
      : 2.5;
    const avgInterval = words.length > 0 
      ? words.reduce((sum, w) => sum + w.interval, 0) / words.length 
      : 1;
    const totalRepetitions = words.reduce((sum, w) => sum + w.repetition, 0);

    // النشاط الأخير
    const recentActivity = words
      .filter(word => word.lastReviewed > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.lastReviewed - a.lastReviewed)
      .slice(0, 10);

    // سرعة التعلم
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const learningVelocity = words.filter(word => word.id > weekAgo).length;

    return {
      totalReviews,
      averageCorrectRate,
      difficultyStats,
      streakData: { current: 5, longest: 12 },
      recentActivity,
      learningVelocity,
      weeklyProgress: [65, 72, 78, 85, 88, 92, stats.progress],
      popularTags,
      avgEaseFactor,
      avgInterval,
      totalRepetitions,
    };
  }, [words, stats.progress]);

  // بطاقات الإحصائيات الرئيسية
  const mainStatCards = [
    {
      title: 'إجمالي الكلمات',
      value: stats.totalWords,
      icon: BookOpen,
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-800/50',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-400',
      trend: '+12%',
      trendColor: 'text-green-400'
    },
    {
      title: 'كلمات محفوظة',
      value: stats.masteredWords,
      icon: CheckCircle2,
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-800/50',
      textColor: 'text-green-400',
      iconColor: 'text-green-400',
      trend: '+8%',
      trendColor: 'text-green-400'
    },
    {
      title: 'معدل النجاح',
      value: `${advancedStats.averageCorrectRate.toFixed(0)}%`,
      icon: Target,
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-800/50',
      textColor: 'text-purple-400',
      iconColor: 'text-purple-400',
      trend: '+5%',
      trendColor: 'text-green-400'
    },
    {
      title: 'إجمالي المراجعات',
      value: advancedStats.totalReviews,
      icon: Brain,
      bgColor: 'bg-orange-900/30',
      borderColor: 'border-orange-800/50',
      textColor: 'text-orange-400',
      iconColor: 'text-orange-400',
      trend: '+15%',
      trendColor: 'text-green-400'
    },
  ];

  // إحصائيات المجلدات المحسنة
  const enhancedFolderStats = useMemo(() => {
    return folderStats.map(folderStat => {
      const folder = folders.find(f => f.id === folderStat.id);
      return {
        ...folderStat,
        folder,
        efficiency: folderStat.totalWords > 0 
          ? (folderStat.masteredWords / folderStat.totalWords) * 100 
          : 0,
      };
    }).sort((a, b) => b.totalWords - a.totalWords);
  }, [folderStats, folders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      
      {/* Header مع التبويبات */}
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">الإحصائيات التفصيلية</h1>
        <p className="text-lg lg:text-xl text-gray-400 mb-6">
          تتبع تقدمك وأدائك في رحلة التعلم
        </p>

        {/* التبويبات */}
        <div className="flex space-x-1 bg-gray-800 rounded-2xl p-1 border border-gray-700">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Target },
            { id: 'charts', label: 'المخططات', icon: PieChart },
            { id: 'detailed', label: 'تحليل متقدم', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 lg:px-6 py-3 lg:py-4 rounded-xl font-semibold transition-all touch-manipulation
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'overview' && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {mainStatCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className={`${stat.bgColor} rounded-2xl lg:rounded-3xl p-4 lg:p-6 border ${stat.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer touch-manipulation`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 lg:p-3 ${stat.bgColor} rounded-xl lg:rounded-2xl border ${stat.borderColor}`}>
                      <Icon size={20} className={`lg:w-6 lg:h-6 ${stat.iconColor}`} />
                    </div>
                    <div className={`text-xs lg:text-sm font-medium ${stat.trendColor} flex items-center space-x-1`}>
                      <TrendingUp size={12} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div className={`text-2xl lg:text-3xl font-bold ${stat.textColor} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-gray-400">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
            
            {/* Weekly Progress */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="text-green-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">التقدم الأسبوعي</h3>
              </div>
              <div className="space-y-4">
                {advancedStats.weeklyProgress.map((progress, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-sm text-gray-400 w-12">
                      الأسبوع {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-sm font-bold text-green-400 w-12">
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Velocity */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Flame className="text-orange-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">النشاط والسرعة</h3>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {advancedStats.streakData.current}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">أيام متتالية</div>
                  <div className="text-xs text-gray-500">
                    أطول فترة: {advancedStats.streakData.longest} يوم
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {advancedStats.learningVelocity}
                    </div>
                    <div className="text-sm text-gray-400">كلمة جديدة/أسبوع</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="text-purple-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">النشاط الأخير</h3>
              </div>
              
              {advancedStats.recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {advancedStats.recentActivity.map((word, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm truncate">
                          {word.word}
                        </div>
                        <div className="text-gray-400 text-xs truncate">
                          {word.meaning}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(word.lastReviewed).toLocaleDateString('ar')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock size={32} className="mx-auto mb-3" />
                  <p>لا يوجد نشاط حديث</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Difficulty Distribution */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <PieChart className="text-yellow-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">توزيع الصعوبة</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(advancedStats.difficultyStats).map(([difficulty, count]) => {
                const colors = {
                  'سهل': { bg: 'bg-green-500', text: 'text-green-400' },
                  'متوسط': { bg: 'bg-yellow-500', text: 'text-yellow-400' },
                  'صعب': { bg: 'bg-red-500', text: 'text-red-400' }
                };
                
                const percentage = stats.totalWords > 0 ? (count / stats.totalWords) * 100 : 0;
                const colorSet = colors[difficulty as keyof typeof colors];

                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{difficulty}</span>
                      <span className={`font-bold ${colorSet.text}`}>
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${colorSet.bg}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SM-2 Algorithm Stats */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="text-purple-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">ذكاء التكرار المتباعد</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              
              <div className="bg-purple-900/20 rounded-2xl p-4 border border-purple-800/30 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {advancedStats.avgEaseFactor.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mb-2">متوسط عامل السهولة</div>
                <div className="text-xs text-gray-500">
                  {advancedStats.avgEaseFactor >= 2.5 ? '✨ ممتاز' : 'قابل للتحسين'}
                </div>
              </div>

              <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-800/30 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {Math.round(advancedStats.avgInterval)}
                </div>
                <div className="text-sm text-gray-400 mb-2">متوسط فترة المراجعة (أيام)</div>
                <div className="text-xs text-gray-500">
                  كلما زادت، كلما قل احتياجك للمراجعة
                </div>
              </div>

              <div className="bg-green-900/20 rounded-2xl p-4 border border-green-800/30 text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {advancedStats.totalRepetitions}
                </div>
                <div className="text-sm text-gray-400 mb-2">إجمالي التكرارات الناجحة</div>
                <div className="text-xs text-gray-500">
                  مؤشر على مجهودك في التعلم
                </div>
              </div>
            </div>
          </div>

          {/* Folder Statistics */}
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <FolderOpen className="text-indigo-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">إحصائيات المجلدات</h3>
            </div>

            {enhancedFolderStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enhancedFolderStats.slice(0, 6).map((folderStat) => (
                  <div 
                    key={folderStat.id} 
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ 
                          backgroundColor: `${folderStat.color}20`, 
                          border: `1px solid ${folderStat.color}40` 
                        }}
                      >
                        {folderStat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{folderStat.name}</h4>
                        <div className="text-xs text-gray-400">
                          {folderStat.efficiency.toFixed(0)}% كفاءة
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold" style={{ color: folderStat.color }}>
                          {folderStat.totalWords}
                        </div>
                        <div className="text-gray-500">إجمالي</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-green-400">
                          {folderStat.masteredWords}
                        </div>
                        <div className="text-gray-500">محفوظة</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-orange-400">
                          {folderStat.needReview}
                        </div>
                        <div className="text-gray-500">للمراجعة</div>
                      </div>
                    </div>

                    <div className="mt-3 w-full bg-gray-600 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${folderStat.progress}%`,
                          backgroundColor: folderStat.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FolderOpen size={48} className="mx-auto mb-4" />
                <p>لا توجد مجلدات بعد</p>
              </div>
            )}
          </div>

          {/* Popular Tags */}
          {advancedStats.popularTags.length > 0 && (
            <div className="lg:col-span-2 bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Tag className="text-pink-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">التاجات الأكثر استخداماً</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {advancedStats.popularTags.map(([tag, count], index) => (
                  <div 
                    key={tag}
                    className="bg-pink-900/20 rounded-xl p-4 border border-pink-800/30 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-lg font-bold text-pink-400 mb-1">
                      {count}
                    </div>
                    <div className="text-sm text-white truncate">
                      #{tag}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      المرتبة {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'detailed' && (
        <div className="space-y-8">
          
          {/* Activity Heatmap */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="text-orange-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">خريطة النشاط اليومي</h3>
            </div>
            
            {/* Activity Heatmap Component محاكاة */}
            <div className="space-y-4">
              <div className="text-sm text-gray-400 text-center">
                خريطة النشاط اليومي - قيد التطوير
              </div>
              
              {/* Mock Heatmap */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => (
                  <div 
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      Math.random() > 0.7 ? 'bg-green-500' :
                      Math.random() > 0.5 ? 'bg-green-700' :
                      Math.random() > 0.3 ? 'bg-green-800' :
                      'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>أقل</span>
                <span>أكثر</span>
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Learning Curve */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="text-blue-400" size={24} />
                <h3 className="text-lg font-bold text-white">منحنى التعلم</h3>
              </div>
              
              <div className="space-y-4">
                {advancedStats.weeklyProgress.map((progress, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-xs text-gray-400 w-16">
                      أسبوع {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-blue-400 w-12">
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Rate Analysis */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="text-green-400" size={24} />
                <h3 className="text-lg font-bold text-white">تحليل معدل النجاح</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {advancedStats.averageCorrectRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400 mb-4">معدل النجاح الإجمالي</div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${advancedStats.averageCorrectRate}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {words.reduce((sum, w) => sum + w.correctCount, 0)}
                    </div>
                    <div className="text-xs text-gray-400">إجابات صحيحة</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">
                      {words.reduce((sum, w) => sum + w.incorrectCount, 0)}
                    </div>
                    <div className="text-xs text-gray-400">إجابات خاطئة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badges - في جميع التبويبات */}
      <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700 mt-8 lg:mt-12">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="text-purple-400" size={24} />
          <h3 className="text-xl lg:text-2xl font-bold text-white">الإنجازات</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'المبتدئ', description: 'أول 10 كلمات', achieved: stats.totalWords >= 10, icon: '🌱' },
            { name: 'المثابر', description: '5 أيام متتالية', achieved: advancedStats.streakData.current >= 5, icon: '🔥' },
            { name: 'الخبير', description: '100 كلمة محفوظة', achieved: stats.masteredWords >= 100, icon: '🎓' },
            { name: 'السريع', description: '20 كلمة/أسبوع', achieved: advancedStats.learningVelocity >= 20, icon: '⚡' },
            { name: 'المتفوق', description: '95% معدل نجاح', achieved: advancedStats.averageCorrectRate >= 95, icon: '🏆' },
            { name: 'الماراثوني', description: '30 يوم متتالي', achieved: advancedStats.streakData.longest >= 30, icon: '🏃' },
          ].map((achievement, index) => (
            <div 
              key={index}
              className={`
                p-4 rounded-2xl border text-center transition-all hover:scale-105 touch-manipulation
                ${achievement.achieved 
                  ? 'bg-yellow-900/30 border-yellow-800/50 text-yellow-400' 
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-500'
                }
              `}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <div className="text-sm font-semibold mb-1">{achievement.name}</div>
              <div className="text-xs opacity-80">{achievement.description}</div>
              {achievement.achieved && (
                <div className="text-xs text-yellow-300 mt-2">✓ مُحقق</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}