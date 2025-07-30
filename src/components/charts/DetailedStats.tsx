// src/components/charts/DetailedStats.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface DetailedStatsProps {
  words: Word[];
}

const DetailedStats: React.FC<DetailedStatsProps> = ({ words }) => {

  // إحصائيات التصنيفات
  const categoryStats = useMemo(() => {
    const grouped = words.reduce((acc, word) => {
      const category = word.category;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          mastered: 0,
          averageEaseFactor: 0,
          averageInterval: 0,
          totalReviews: 0,
        };
      }
      
      acc[category].total++;
      if (word.repetition >= 3 && word.interval >= 21) acc[category].mastered++;
      acc[category].averageEaseFactor += word.easeFactor;
      acc[category].averageInterval += word.interval;
      acc[category].totalReviews += (word.correctCount + word.incorrectCount);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      total: data.total,
      mastered: data.mastered,
      progress: Math.round((data.mastered / data.total) * 100),
      averageEaseFactor: Number((data.averageEaseFactor / data.total).toFixed(2)),
      averageInterval: Math.round(data.averageInterval / data.total),
      averageReviews: Math.round(data.totalReviews / data.total),
    }));
  }, [words]);

  // إحصائيات مستويات SM-2
  const sm2Stats = useMemo(() => {
    const levels = [
      { name: 'جديدة', min: 0, max: 0 },
      { name: 'مبتدئة', min: 1, max: 2 },
      { name: 'مألوفة', min: 3, max: 5 },
      { name: 'متقنة', min: 6, max: 9 },
      { name: 'خبيرة', min: 10, max: Infinity },
    ];

    return levels.map(level => {
      const wordsInLevel = words.filter(w => 
        w.repetition >= level.min && w.repetition <= level.max
      );
      
      return {
        name: level.name,
        count: wordsInLevel.length,
        percentage: words.length > 0 ? Math.round((wordsInLevel.length / words.length) * 100) : 0,
        averageEaseFactor: wordsInLevel.length > 0 
          ? Number((wordsInLevel.reduce((sum, w) => sum + w.easeFactor, 0) / wordsInLevel.length).toFixed(2))
          : 0,
        averageInterval: wordsInLevel.length > 0
          ? Math.round(wordsInLevel.reduce((sum, w) => sum + w.interval, 0) / wordsInLevel.length)
          : 0,
      };
    }).filter(level => level.count > 0);
  }, [words]);

  // إحصائيات الأداء الراداري
  const performanceRadar = useMemo(() => {
    if (words.length === 0) return [];

    const totalWords = words.length;
    const masteredWords = words.filter(w => w.correctCount >= 3).length;
    const averageEaseFactor = words.reduce((sum, w) => sum + w.easeFactor, 0) / words.length;
    const averageSuccess = words.reduce((sum, w) => {
      const total = w.correctCount + w.incorrectCount;
      return sum + (total > 0 ? w.correctCount / total : 0);
    }, 0) / words.length;
    
    const longTermRetention = words.filter(w => w.interval >= 7).length / totalWords;
    const consistency = words.filter(w => w.repetition >= 3).length / totalWords;

    return [
      {
        metric: 'معدل الإتقان',
        value: Math.round((masteredWords / totalWords) * 100),
        fullMark: 100,
      },
      {
        metric: 'معدل النجاح',
        value: Math.round(averageSuccess * 100),
        fullMark: 100,
      },
      {
        metric: 'عامل السهولة',
        value: Math.round(((averageEaseFactor - 1.3) / (3.0 - 1.3)) * 100),
        fullMark: 100,
      },
      {
        metric: 'الاحتفاظ طويل المدى',
        value: Math.round(longTermRetention * 100),
        fullMark: 100,
      },
      {
        metric: 'الثبات',
        value: Math.round(consistency * 100),
        fullMark: 100,
      },
    ];
  }, [words]);

  // Custom Tooltip للـ Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">إجمالي:</span>
              <span className="text-blue-400 font-bold">{data.total}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">محفوظة:</span>
              <span className="text-green-400 font-bold">{data.mastered}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">التقدم:</span>
              <span className="text-purple-400 font-bold">{data.progress}%</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">عامل السهولة:</span>
              <span className="text-yellow-400 font-bold">{data.averageEaseFactor}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip للـ Radar Chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-3 shadow-xl">
          <p className="text-white font-semibold text-sm mb-1">{data.metric}</p>
          <p className="text-blue-400 font-bold">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      
      {/* إحصائيات التصنيفات */}
      {categoryStats.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">أداء التصنيفات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="total" fill="#3B82F6" name="إجمالي" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mastered" fill="#10B981" name="محفوظة" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* مخطط الأداء الراداري */}
      {performanceRadar.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">تحليل الأداء الشامل</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceRadar} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={0} 
                  domain={[0, 100]} 
                  tick={false} 
                  axisLine={false}
                />
                <Radar
                  name="الأداء"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            💡 كلما اقترب الشكل من الخارج، كان أداؤك أفضل
          </div>
        </div>
      )}

      {/* إحصائيات مستويات SM-2 */}
      {sm2Stats.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">توزيع مستويات الإتقان</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sm2Stats.map((level, index) => (
              <div key={index} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">{level.name}</h4>
                  <span className="text-sm text-gray-400">{level.percentage}%</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">العدد:</span>
                    <span className="text-blue-400 font-bold">{level.count}</span>
                  </div>
                  
                  {level.averageEaseFactor > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">عامل السهولة:</span>
                      <span className="text-yellow-400 font-bold">{level.averageEaseFactor}</span>
                    </div>
                  )}
                  
                  {level.averageInterval > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">متوسط الفترة:</span>
                      <span className="text-green-400 font-bold">{level.averageInterval} يوم</span>
                    </div>
                  )}
                </div>
                
                {/* شريط تقدم */}
                <div className="mt-3 w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نصائح للتحسين */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-800/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>نصائح لتحسين أدائك</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">راجع الكلمات الصعبة أكثر من مرة</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">⚡</span>
              <span className="text-gray-300">كن صادقاً في تقييم مستوى صعوبة التذكر</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">🎯</span>
              <span className="text-gray-300">ركز على الكلمات ذات عامل السهولة المنخفض</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-400 mt-1">⏰</span>
              <span className="text-gray-300">راجع بانتظام حسب الجدولة الذكية</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-indigo-400 mt-1">📚</span>
              <span className="text-gray-300">أضف كلمات جديدة تدريجياً</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-pink-400 mt-1">🔄</span>
              <span className="text-gray-300">استخدم السياق لتقوية الذاكرة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedStats;