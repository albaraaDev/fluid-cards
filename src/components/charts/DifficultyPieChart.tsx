// src/components/charts/DifficultyPieChart.tsx
'use client';

import { Word } from '@/types/flashcard';
import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DifficultyPieChartProps {
  words: Word[];
  showMasteryLevel?: boolean; // إظهار مستوى الإتقان بدلاً من الصعوبة
}

interface DifficultyData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  masteredCount?: number;
}

const DifficultyPieChart: React.FC<DifficultyPieChartProps> = ({ words, showMasteryLevel = false }) => {
  
  const pieData = useMemo(() => {
    if (showMasteryLevel) {
      // تجميع حسب مستوى الإتقان
      const masteryGroups = {
        'جديدة': { count: 0, color: '#6B7280' },
        'قيد التعلم': { count: 0, color: '#3B82F6' },
        'مألوفة': { count: 0, color: '#F59E0B' },
        'محفوظة جيداً': { count: 0, color: '#10B981' },
        'متقنة تماماً': { count: 0, color: '#8B5CF6' },
      };

      words.forEach(word => {
        if (word.repetition === 0) {
          masteryGroups['جديدة'].count++;
        } else if (word.repetition < 3) {
          masteryGroups['قيد التعلم'].count++;
        } else if (word.repetition < 6) {
          masteryGroups['مألوفة'].count++;
        } else if (word.repetition < 10) {
          masteryGroups['محفوظة جيداً'].count++;
        } else {
          masteryGroups['متقنة تماماً'].count++;
        }
      });

      return Object.entries(masteryGroups)
        .filter(([_, data]) => data.count > 0)
        .map(([level, data]) => ({
          name: level,
          value: data.count,
          color: data.color,
          percentage: Math.round((data.count / words.length) * 100),
        }));
    } else {
      // تجميع حسب مستوى الصعوبة
      const difficultyGroups = words.reduce((acc, word) => {
        const difficulty = word.difficulty;
        if (!acc[difficulty]) {
          acc[difficulty] = { total: 0, mastered: 0 };
        }
        acc[difficulty].total++;
        if (word.repetition >= 3 && word.interval >= 21) {
          acc[difficulty].mastered++;
        }
        return acc;
      }, {} as Record<string, { total: number; mastered: number }>);

      const colors = {
        'سهل': '#10B981',
        'متوسط': '#F59E0B', 
        'صعب': '#EF4444'
      };

      return Object.entries(difficultyGroups).map(([difficulty, data]) => ({
        name: difficulty,
        value: data.total,
        color: colors[difficulty as keyof typeof colors] || '#6B7280',
        percentage: Math.round((data.total / words.length) * 100),
        masteredCount: data.mastered,
      }));
    }
  }, [words, showMasteryLevel]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-white font-semibold">{data.name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">العدد:</span>
              <span className="text-white font-bold">{data.value}</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-400">النسبة:</span>
              <span className="text-blue-400 font-bold">{data.percentage}%</span>
            </div>
            {data.masteredCount !== undefined && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-gray-400">محفوظة:</span>
                <span className="text-green-400 font-bold">{data.masteredCount}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Label
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // إخفاء التسميات للقيم الصغيرة
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom Legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (pieData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-400">لا توجد بيانات للعرض</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DifficultyPieChart;