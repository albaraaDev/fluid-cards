// src/components/charts/ActivityHeatmap.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useMemo, useState } from 'react';

interface ActivityHeatmapProps {
  words: Word[];
  weeks?: number; // عدد الأسابيع للإظهار (افتراضي 12)
}

interface DayActivity {
  date: string;
  dayOfWeek: number; // 0 = الأحد، 6 = السبت
  weekOfYear: number;
  newWords: number;
  reviews: number;
  totalActivity: number;
  displayDate: string;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ words, weeks = 12 }) => {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // إنشاء بيانات النشاط اليومي
  const activityData = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (weeks * 7));
    
    const activities: DayActivity[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // الكلمات الجديدة في هذا اليوم
      const newWordsToday = words.filter(word => {
        const wordDate = new Date(word.id);
        return wordDate.toDateString() === currentDate.toDateString();
      }).length;
      
      // المراجعات في هذا اليوم (محاكاة بناءً على lastReviewed)
      const reviewsToday = words.filter(word => {
        const reviewDate = new Date(word.lastReviewed);
        return reviewDate.toDateString() === currentDate.toDateString();
      }).length;
      
      // حساب رقم الأسبوع
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const weekOfYear = Math.ceil(
        ((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000) + startOfYear.getDay() + 1) / 7
      );
      
      activities.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        weekOfYear,
        newWords: newWordsToday,
        reviews: reviewsToday,
        totalActivity: newWordsToday + reviewsToday,
        displayDate: currentDate.toLocaleDateString('ar-SA', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      });
    }
    
    return activities;
  }, [words, weeks]);

  // تجميع البيانات حسب الأسابيع
  const weeklyData = useMemo(() => {
    const grouped = activityData.reduce((acc, day) => {
      const key = `${day.weekOfYear}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(day);
      return acc;
    }, {} as Record<string, DayActivity[]>);

    // ترتيب الأسابيع وملء الأيام المفقودة
    return Object.values(grouped).map(week => {
      const sortedWeek = [...week].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      
      // ملء الأيام المفقودة في بداية الأسبوع
      while (sortedWeek.length < 7) {
        if (sortedWeek.length === 0 || sortedWeek[0].dayOfWeek > 0) {
          sortedWeek.unshift({
            date: '',
            dayOfWeek: sortedWeek.length === 0 ? 0 : sortedWeek[0].dayOfWeek - 1,
            weekOfYear: week[0]?.weekOfYear || 0,
            newWords: 0,
            reviews: 0,
            totalActivity: 0,
            displayDate: '',
          });
        } else {
          break;
        }
      }
      
      return sortedWeek.slice(0, 7); // تأكد من عدم تجاوز 7 أيام
    });
  }, [activityData]);

  // الحصول على أقصى نشاط لحساب الألوان
  const maxActivity = Math.max(...activityData.map(d => d.totalActivity), 1);

  // دالة للحصول على لون الخلية
  const getCellColor = (activity: number) => {
    if (activity === 0) return 'bg-gray-800 border-gray-700';
    
    const intensity = activity / maxActivity;
    if (intensity >= 0.8) return 'bg-green-500 border-green-400';
    if (intensity >= 0.6) return 'bg-green-600 border-green-500';
    if (intensity >= 0.4) return 'bg-green-700 border-green-600';
    if (intensity >= 0.2) return 'bg-green-800 border-green-700';
    return 'bg-green-900 border-green-800';
  };

  // أسماء أيام الأسبوع
  const dayNames = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

  return (
    <div className="w-full">
      <div className="flex items-start space-x-3">
        
        {/* أسماء الأيام */}
        <div className="flex flex-col space-y-1 pt-4">
          {dayNames.map((day, index) => (
            <div 
              key={index} 
              className="w-4 h-4 flex items-center justify-center text-xs text-gray-400 font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* الشبكة */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {weeklyData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      w-4 h-4 rounded-sm border cursor-pointer transition-all duration-200 
                      ${getCellColor(day.totalActivity)}
                      ${day.date ? 'hover:scale-125 hover:border-white/50' : 'cursor-default'}
                    `}
                    onMouseEnter={() => day.date && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    title={day.displayDate}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الأسطورة */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>أقل</span>
        <div className="flex items-center space-x-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm border ${
                intensity === 0 
                  ? 'bg-gray-800 border-gray-700' 
                  : `bg-green-${900 - Math.floor(intensity * 400)} border-green-${800 - Math.floor(intensity * 300)}`
              }`}
            />
          ))}
        </div>
        <span>أكثر</span>
      </div>

      {/* Tooltip للنشاط */}
      {hoveredDay && (
        <div className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-3 shadow-xl">
            <p className="text-white font-semibold text-sm mb-2">{hoveredDay.displayDate}</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-400">كلمات جديدة:</span>
                <span className="text-blue-400 font-bold">{hoveredDay.newWords}</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-400">مراجعات:</span>
                <span className="text-green-400 font-bold">{hoveredDay.reviews}</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-400">إجمالي النشاط:</span>
                <span className="text-purple-400 font-bold">{hoveredDay.totalActivity}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-lg font-bold text-blue-400 mb-1">
            {activityData.filter(d => d.totalActivity > 0).length}
          </div>
          <div className="text-xs text-gray-400">أيام نشطة</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-lg font-bold text-green-400 mb-1">
            {activityData.reduce((sum, d) => sum + d.totalActivity, 0)}
          </div>
          <div className="text-xs text-gray-400">إجمالي النشاط</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
          <div className="text-lg font-bold text-purple-400 mb-1">
            {activityData.length > 0 ? 
              Math.round((activityData.filter(d => d.totalActivity > 0).length / activityData.length) * 100) : 
              0
            }%
          </div>
          <div className="text-xs text-gray-400">معدل النشاط</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;