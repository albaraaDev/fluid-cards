// src/app/stats/page.tsx
'use client';

import ActivityHeatmap from '@/components/charts/ActivityHeatmap';
import DetailedStats from '@/components/charts/DetailedStats';
import DifficultyPieChart from '@/components/charts/DifficultyPieChart';
import ProgressChart from '@/components/charts/ProgressChart';
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
  PieChart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export default function StatsPage() {
  const { words, stats } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'charts' | 'detailed'
  >('overview');
  const [statsTimestamp] = useState(() => Date.now());

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
      };
    }

    // إجمالي المراجعات
    const totalReviews = words.reduce(
      (sum, word) => sum + word.correctCount + word.incorrectCount,
      0
    );

    // معدل الإجابات الصحيحة
    const totalCorrect = words.reduce(
      (sum, word) => sum + word.correctCount,
      0
    );
    const averageCorrectRate =
      totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    // إحصائيات التصنيفات
    const categoryMap = new Map<
      string,
      { total: number; mastered: number; needReview: number }
    >();
    words.forEach((word) => {
      const category = word.category;
      const current = categoryMap.get(category) || {
        total: 0,
        mastered: 0,
        needReview: 0,
      };
      current.total++;
      if (word.repetition >= 3 && word.interval >= 21) current.mastered++;
      // 🔥 إصلاح: استخدام statsTimestamp موحد
      if (word.nextReview <= statsTimestamp) current.needReview++;
      categoryMap.set(category, current);
    });

    const categoryStats = Array.from(categoryMap.entries()).map(
      ([name, data]) => ({
        name,
        ...data,
        progress: data.total > 0 ? (data.mastered / data.total) * 100 : 0,
      })
    );

    // إحصائيات الصعوبة
    const difficultyMap = new Map<
      string,
      { total: number; mastered: number }
    >();
    words.forEach((word) => {
      const difficulty = word.difficulty;
      const current = difficultyMap.get(difficulty) || {
        total: 0,
        mastered: 0,
      };
      current.total++;
      if (word.repetition >= 3 && word.interval >= 21) current.mastered++;
      difficultyMap.set(difficulty, current);
    });

    const difficultyStats = Array.from(difficultyMap.entries()).map(
      ([name, data]) => ({
        name,
        ...data,
        progress: data.total > 0 ? (data.mastered / data.total) * 100 : 0,
      })
    );

    // النشاط الأخير (محاكاة)
    const recentActivity = words
      .filter(
        (word) => word.lastReviewed > Date.now() - 7 * 24 * 60 * 60 * 1000
      )
      .sort((a, b) => b.lastReviewed - a.lastReviewed)
      .slice(0, 10);

    // سرعة التعلم (كلمات جديدة في الأسبوع)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const learningVelocity = words.filter((word) => word.id > weekAgo).length;

    return {
      totalReviews,
      averageCorrectRate,
      categoryStats,
      difficultyStats,
      streakData: { current: 5, longest: 12 }, // محاكاة
      recentActivity,
      learningVelocity,
      weeklyProgress: [65, 72, 78, 85, 88, 92, stats.progress], // محاكاة
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
      trendColor: 'text-green-400',
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
      trendColor: 'text-green-400',
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
      trendColor: 'text-green-400',
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
      trendColor: 'text-green-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header مع التبويبات */}
      <div className="mb-8 lg:mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          الإحصائيات التفصيلية
        </h1>
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
                  ${
                    activeTab === tab.id
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
                    <div
                      className={`p-2 lg:p-3 ${stat.bgColor} rounded-xl lg:rounded-2xl border ${stat.borderColor}`}
                    >
                      <Icon
                        size={20}
                        className={`lg:w-6 lg:h-6 ${stat.iconColor}`}
                      />
                    </div>
                    <div
                      className={`text-xs lg:text-sm font-medium ${stat.trendColor} flex items-center space-x-1`}
                    >
                      <TrendingUp size={12} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div
                    className={`text-2xl lg:text-3xl font-bold ${stat.textColor} mb-1`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-gray-400">
                    {stat.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700 mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-purple-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  نظرة عامة على التقدم
                </h3>
              </div>
              <span className="text-3xl lg:text-4xl font-bold text-purple-400">
                {stats.progress.toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-4 lg:h-6 mb-6">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${stats.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">
                  {stats.totalWords - stats.masteredWords}
                </div>
                <div className="text-sm lg:text-base text-gray-400">
                  قيد التعلم
                </div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-1">
                  {stats.masteredWords}
                </div>
                <div className="text-sm lg:text-base text-gray-400">محفوظة</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-orange-400 mb-1">
                  {stats.wordsNeedingReview}
                </div>
                <div className="text-sm lg:text-base text-gray-400">
                  تحتاج مراجعة
                </div>
              </div>
            </div>
          </div>

          {/* SM-2 Algorithm Insights */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700 mb-8 lg:mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="text-purple-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">
                ذكاء التكرار المتباعد
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Average Ease Factor */}
              <div className="bg-purple-900/20 rounded-2xl p-6 border border-purple-800/30 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  {words.length > 0
                    ? (
                        words.reduce((sum, w) => sum + w.easeFactor, 0) /
                        words.length
                      ).toFixed(2)
                    : '2.50'}
                </div>
                <div className="text-sm lg:text-base text-gray-400 mb-2">
                  متوسط عامل السهولة
                </div>
                <div className="text-xs text-gray-500">
                  {words.length > 0
                    ? words.reduce((sum, w) => sum + w.easeFactor, 0) /
                        words.length >=
                      2.5
                      ? '✨ ممتاز'
                      : 'قابل للتحسين'
                    : 'لا توجد بيانات'}
                </div>
              </div>

              {/* Average Interval */}
              <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-800/30 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {words.length > 0
                    ? Math.round(
                        words.reduce((sum, w) => sum + w.interval, 0) /
                          words.length
                      )
                    : 1}
                </div>
                <div className="text-sm lg:text-base text-gray-400 mb-2">
                  متوسط فترة المراجعة (أيام)
                </div>
                <div className="text-xs text-gray-500">
                  كلما زادت، كلما قل احتياجك للمراجعة
                </div>
              </div>

              {/* Total Repetitions */}
              <div className="bg-green-900/20 rounded-2xl p-6 border border-green-800/30 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                  {words.reduce((sum, w) => sum + w.repetition, 0)}
                </div>
                <div className="text-sm lg:text-base text-gray-400 mb-2">
                  إجمالي التكرارات الناجحة
                </div>
                <div className="text-xs text-gray-500">
                  مؤشر على مجهودك في التعلم
                </div>
              </div>
            </div>

            {/* How SM-2 Works */}
            <div className="mt-6 bg-gray-700/50 rounded-2xl p-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Zap className="text-yellow-400" size={20} />
                <span>كيف يعمل النظام الذكي؟</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm lg:text-base">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300">
                      تقييم صحيح (3-5): زيادة فترة المراجعة
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span className="text-gray-300">
                      تقييم صعب (0-2): إعادة البداية
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">⚡</span>
                    <span className="text-gray-300">
                      عامل السهولة يتكيف مع أدائك
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">🎯</span>
                    <span className="text-gray-300">
                      فترات مثلى: 1، 6، ثم مضاعفات ذكية
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">🧠</span>
                    <span className="text-gray-300">يتذكر نقاط ضعفك وقوتك</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-indigo-400 mt-1">⏰</span>
                    <span className="text-gray-300">توقيت مثالي للمراجعة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
            {/* Category Performance */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="text-blue-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  أداء التصنيفات
                </h3>
              </div>

              <div className="space-y-4">
                {advancedStats.categoryStats.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {category.mastered}/{category.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.progress.toFixed(0)}% مكتمل
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              {/* Learning Velocity */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="text-yellow-400" size={20} />
                  <h3 className="text-lg font-bold text-white">سرعة التعلم</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      {advancedStats.learningVelocity}
                    </div>
                    <div className="text-sm text-gray-400">
                      كلمات هذا الأسبوع
                    </div>
                  </div>
                  <div className="text-green-400 text-sm flex items-center space-x-1">
                    <TrendingUp size={14} />
                    <span>+23%</span>
                  </div>
                </div>
              </div>

              {/* Study Streak */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Flame className="text-orange-400" size={20} />
                  <h3 className="text-lg font-bold text-white">
                    سلسلة المراجعة
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {advancedStats.streakData.current}
                    </div>
                    <div className="text-sm text-gray-400">أيام متتالية</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    أطول: {advancedStats.streakData.longest} يوم
                  </div>
                </div>
              </div>

              {/* Next Review */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="text-blue-400" size={20} />
                  <h3 className="text-lg font-bold text-white">
                    المراجعة القادمة
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {stats.wordsNeedingReview}
                    </div>
                    <div className="text-sm text-gray-400">كلمات جاهزة</div>
                  </div>
                  {stats.wordsNeedingReview > 0 && (
                    <div className="text-xs text-orange-400">⚡ الآن!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-8 lg:space-y-12">
          {/* Progress Chart */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="text-blue-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">
                تطور التعلم عبر الوقت
              </h3>
            </div>
            <ProgressChart words={words} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Difficulty Distribution */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="text-green-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  توزيع مستويات الصعوبة
                </h3>
              </div>
              <DifficultyPieChart words={words} />
            </div>

            {/* Mastery Levels */}
            <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="text-purple-400" size={24} />
                <h3 className="text-xl lg:text-2xl font-bold text-white">
                  مستويات الإتقان
                </h3>
              </div>
              <DifficultyPieChart words={words} showMasteryLevel={true} />
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="text-orange-400" size={24} />
              <h3 className="text-xl lg:text-2xl font-bold text-white">
                خريطة النشاط اليومي
              </h3>
            </div>
            <ActivityHeatmap words={words} />
          </div>
        </div>
      )}

      {activeTab === 'detailed' && <DetailedStats words={words} />}

      {/* Achievement Badges - في جميع التبويبات */}
      <div className="bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-700 mt-8 lg:mt-12">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="text-purple-400" size={24} />
          <h3 className="text-xl lg:text-2xl font-bold text-white">
            الإنجازات
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              name: 'المبتدئ',
              description: 'أول 10 كلمات',
              achieved: stats.totalWords >= 10,
              icon: '🌱',
            },
            {
              name: 'المثابر',
              description: '5 أيام متتالية',
              achieved: advancedStats.streakData.current >= 5,
              icon: '🔥',
            },
            {
              name: 'الخبير',
              description: '100 كلمة محفوظة',
              achieved: stats.masteredWords >= 100,
              icon: '🎓',
            },
            {
              name: 'السريع',
              description: '20 كلمة/أسبوع',
              achieved: advancedStats.learningVelocity >= 20,
              icon: '⚡',
            },
            {
              name: 'المتفوق',
              description: '95% معدل نجاح',
              achieved: advancedStats.averageCorrectRate >= 95,
              icon: '🏆',
            },
            {
              name: 'الماراثوني',
              description: '30 يوم متتالي',
              achieved: advancedStats.streakData.longest >= 30,
              icon: '🏃',
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-2xl border text-center transition-all hover:scale-105 touch-manipulation
                ${
                  achievement.achieved
                    ? 'bg-yellow-900/30 border-yellow-800/50 text-yellow-400'
                    : 'bg-gray-700/50 border-gray-600/50 text-gray-500'
                }
              `}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
              <div className="text-sm font-semibold mb-1">
                {achievement.name}
              </div>
              <div className="text-xs opacity-80">
                {achievement.description}
              </div>
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
