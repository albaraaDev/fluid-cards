// src/components/charts/ProgressChart.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    
    // إضافة createdAt للكلمات التي لا تملكه (الكلمات القديمة)
    const wordsWithCreatedAt = words.map(word => ({
      ...word,
      createdAt: word.id > 1000000000000 ? word.id : Date.now() - (word.id * 24 * 60 * 60 * 1000) // محاكاة تاريخ الإنشاء للكلمات القديمة
    }));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const currentTimestamp = currentDate.getTime();
      const dateStr = currentDate.toISOString().split('T')[0];
      const displayDate = currentDate.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      // الكلمات الموجودة في هذا التاريخ (المُنشأة قبل أو في هذا اليوم)
      const wordsAtDate = wordsWithCreatedAt.filter(word => word.createdAt <= currentTimestamp);
      
      // الكلمات المحفوظة حالياً (بناءً على الحالة الحقيقية)
      const masteredAtDate = wordsAtDate.filter(word => word.repetition >= 3 && word.interval >= 21);
      
      // الكلمات الجديدة في هذا اليوم
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const newWordsToday = wordsWithCreatedAt.filter(word => {
        return word.createdAt >= dayStart.getTime() && word.createdAt <= dayEnd.getTime();
      });
      
      // المراجعات في هذا اليوم (بناءً على lastReviewed)
      const reviewsToday = wordsWithCreatedAt.filter(word => {
        const lastReviewedDate = new Date(word.lastReviewed);
        return lastReviewedDate.toDateString() === currentDate.toDateString();
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
            {data.reviewSessions > 0 && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-gray-400">مراجعات:</span>
                <span className="text-orange-400 font-bold">{data.reviewSessions}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // إذا لم توجد بيانات كافية
  if (words.length === 0) {
    return (
      <div className="w-full h-80 lg:h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            📊
          </div>
          <h3 className="text-white font-semibold mb-2">لا توجد بيانات</h3>
          <p className="text-gray-400 text-sm">أضف كلمات لرؤية تطور التعلم</p>
        </div>
      </div>
    );
  }

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
        </AreaChart>
      </ResponsiveContainer>
      
      {/* مؤشر البيانات */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-400">إجمالي الكلمات</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">كلمات محفوظة</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;