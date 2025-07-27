// src/components/charts/ProgressChart.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ProgressChartProps {
  words: Word[];
  days?: number; // عدد الأيام للإظهار (افتراضي 30)
}

interface ProgressDataPoint {
  date: string;
  displayDate: string;
  totalWords: number;
  masteredWords: number;
  newWords: number;
  progress: number;
  averageEaseFactor: number;
  reviewSessions: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ words, days = 30 }) => {
  
  // إنشاء بيانات التطور عبر الوقت
  const progressData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const data: ProgressDataPoint[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dateStr = currentDate.toISOString().split('T')[0];
      const displayDate = currentDate.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      // الكلمات الموجودة في هذا التاريخ
      const wordsAtDate = words.filter(word => word.id <= currentDate.getTime());
      
      // الكلمات المحفوظة في هذا التاريخ
      const masteredAtDate = wordsAtDate.filter(word => {
        // محاكاة: اعتبار الكلمة محفوظة إذا كانت موجودة لأكثر من 7 أيام ولديها تكرارات
        const daysSinceCreation = (currentDate.getTime() - word.id) / (24 * 60 * 60 * 1000);
        return daysSinceCreation > 7 && word.repetition >= 3;
      });
      
      // الكلمات الجديدة في هذا اليوم
      const newWordsToday = words.filter(word => {
        const wordDate = new Date(word.id);
        return wordDate.toDateString() === currentDate.toDateString();
      });
      
      // المراجعات في هذا اليوم (محاكاة)
      const reviewsToday = wordsAtDate.filter(word => {
        const lastReviewed = new Date(word.lastReviewed);
        return lastReviewed.toDateString() === currentDate.toDateString();
      });
      
      // متوسط عامل السهولة
      const avgEaseFactor = wordsAtDate.length > 0 
        ? wordsAtDate.reduce((sum, w) => sum + w.easeFactor, 0) / wordsAtDate.length
        : 2.5;
      
      // نسبة التقدم
      const progress = wordsAtDate.length > 0 
        ? (masteredAtDate.length / wordsAtDate.length) * 100 
        : 0;
      
      data.push({
        date: dateStr,
        displayDate,
        totalWords: wordsAtDate.length,
        masteredWords: masteredAtDate.length,
        newWords: newWordsToday.length,
        progress: Math.round(progress),
        averageEaseFactor: Number(avgEaseFactor.toFixed(2)),
        reviewSessions: reviewsToday.length,
      });
    }
    
    return data;
  }, [words, days]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{data.displayDate}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">إجمالي الكلمات:</span>
              <span className="text-blue-400 font-bold">{data.totalWords}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">محفوظة:</span>
              <span className="text-green-400 font-bold">{data.masteredWords}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">التقدم:</span>
              <span className="text-purple-400 font-bold">{data.progress}%</span>
            </div>
            {data.newWords > 0 && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-gray-400">كلمات جديدة:</span>
                <span className="text-yellow-400 font-bold">{data.newWords}</span>
              </div>
            )}
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">عامل السهولة:</span>
              <span className="text-indigo-400 font-bold">{data.averageEaseFactor}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="totalWordsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="masteredGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
          
          <XAxis 
            dataKey="displayDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            width={40}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* إجمالي الكلمات */}
          <Area
            type="monotone"
            dataKey="totalWords"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#totalWordsGradient)"
          />
          
          {/* الكلمات المحفوظة */}
          <Area
            type="monotone"
            dataKey="masteredWords"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#masteredGradient)"
          />
          
          {/* خط التقدم */}
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#1F2937' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;