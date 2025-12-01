import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, FocusSession, TaskStatus } from '../types';
import { Calendar, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface AnalyticsProps {
  tasks: Task[];
  sessions: FocusSession[];
}

type ViewMode = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const Analytics: React.FC<AnalyticsProps> = ({ tasks, sessions }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('WEEKLY');
  const [cursorDate, setCursorDate] = useState(new Date());

  // Navigation Logic
  const handlePrev = () => {
    const newDate = new Date(cursorDate);
    if (viewMode === 'WEEKLY') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'MONTHLY') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCursorDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(cursorDate);
    if (viewMode === 'WEEKLY') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'MONTHLY') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCursorDate(newDate);
  };

  // Helper: Get Range Start/End
  const { start, end, label } = useMemo(() => {
    const now = new Date(cursorDate);
    let start, end, label;

    if (viewMode === 'WEEKLY') {
       // Monday as start
       const day = now.getDay();
       const diff = now.getDate() - day + (day === 0 ? -6 : 1);
       start = new Date(now);
       start.setDate(diff);
       start.setHours(0,0,0,0);
       
       end = new Date(start);
       end.setDate(start.getDate() + 6);
       end.setHours(23,59,59,999);
       
       label = `${start.getMonth()+1}月${start.getDate()}日 - ${end.getMonth()+1}月${end.getDate()}日`;
    } else if (viewMode === 'MONTHLY') {
       start = new Date(now.getFullYear(), now.getMonth(), 1);
       end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
       label = `${now.getFullYear()}年 ${now.getMonth() + 1}月`;
    } else {
       start = new Date(now.getFullYear(), 0, 1);
       end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
       label = `${now.getFullYear()}年`;
    }
    return { start, end, label };
  }, [viewMode, cursorDate]);

  // Data Aggregation
  const chartData = useMemo(() => {
     const data = [];
     
     if (viewMode === 'WEEKLY') {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        for (let i = 0; i < 7; i++) {
           const d = new Date(start);
           d.setDate(start.getDate() + i);
           const dStr = d.toISOString().split('T')[0];
           
           const minutes = sessions
              .filter(s => s.completedAt.startsWith(dStr))
              .reduce((acc, curr) => acc + curr.durationMinutes, 0);
              
           data.push({ name: days[i], focus: minutes, date: dStr });
        }
     } else if (viewMode === 'MONTHLY') {
        // Daily breakdown for month
        const daysInMonth = end.getDate(); // end is last day of month
        for (let i = 1; i <= daysInMonth; i++) {
           const d = new Date(start.getFullYear(), start.getMonth(), i);
           // Simple label: just the number or 1, 5, 10 etc to avoid crowd
           const dStr = d.toISOString().split('T')[0];
           const minutes = sessions
              .filter(s => s.completedAt.startsWith(dStr))
              .reduce((acc, curr) => acc + curr.durationMinutes, 0);
           
           data.push({ name: `${i}`, focus: minutes, fullDate: dStr });
        }
     } else {
        // Monthly breakdown for year
        for (let i = 0; i < 12; i++) {
           const monthStart = new Date(start.getFullYear(), i, 1);
           const monthEnd = new Date(start.getFullYear(), i + 1, 0, 23, 59, 59);
           
           const minutes = sessions.filter(s => {
              const sDate = new Date(s.completedAt);
              return sDate >= monthStart && sDate <= monthEnd;
           }).reduce((acc, curr) => acc + curr.durationMinutes, 0);
           
           data.push({ name: `${i+1}月`, focus: minutes });
        }
     }
     
     return data;
  }, [viewMode, start, end, sessions]);

  // Period Stats
  const periodFocusMinutes = chartData.reduce((acc, curr) => acc + curr.focus, 0);
  const periodFocusHours = (periodFocusMinutes / 60).toFixed(1);

  const totalFocusAllTime = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHoursAllTime = (totalFocusAllTime / 60).toFixed(1);

  // Completion Stats (Global)
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">数据看板</h1>
          <p className="text-slate-500">回顾历史，展望未来。</p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm self-start">
           {(['WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(mode => (
             <button 
               key={mode}
               onClick={() => {
                 setViewMode(mode);
                 setCursorDate(new Date()); // Reset to today when switching view for better UX
               }}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === mode ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               {mode === 'WEEKLY' ? '周视图' : mode === 'MONTHLY' ? '月视图' : '年视图'}
             </button>
           ))}
        </div>
      </div>

      {/* Navigation & Label */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm">
         <button onClick={handlePrev} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-primary transition-colors">
            <ChevronLeft size={24} />
         </button>
         <div className="text-lg font-bold text-slate-800 flex flex-col items-center">
             <span>{label}</span>
             <span className="text-xs font-normal text-slate-400">统计周期</span>
         </div>
         <button onClick={handleNext} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-primary transition-colors">
            <ChevronRight size={24} />
         </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Period Focus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} className="text-indigo-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-slate-500 font-medium mb-2 flex items-center gap-1">
               <TrendingUp size={14} /> 
               {viewMode === 'WEEKLY' ? '本周专注' : viewMode === 'MONTHLY' ? '本月专注' : '本年专注'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{periodFocusHours}</span>
              <span className="text-slate-400">小时</span>
            </div>
            <div className="mt-4 text-xs text-slate-400">
               历史总计: {totalFocusHoursAllTime} 小时
            </div>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-2">任务完成率 (总计)</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${completionRate >= 80 ? 'text-green-500' : 'text-slate-800'}`}>
               {completionRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${completionRate >= 80 ? 'bg-green-500' : 'bg-primary'}`} 
               style={{ width: `${completionRate}%` }} 
             />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">已完成 {completedTasks} / 总计 {totalTasks}</p>
        </div>

        {/* Sessions Count (Period) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-2">周期内专注次数</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-800">
              {sessions.filter(s => {
                 const sTime = new Date(s.completedAt).getTime();
                 return sTime >= start.getTime() && sTime <= end.getTime();
              }).length}
            </span>
            <span className="text-slate-400">次</span>
          </div>
           <p className="text-xs text-slate-400 mt-4">
              平均: {sessions.length > 0 ? Math.round(totalFocusAllTime / sessions.length) : 0} 分钟/次 (总平均)
           </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Calendar size={18} className="text-primary" />
           专注时长统计图表
        </h3>
        
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              dy={10}
              interval={viewMode === 'MONTHLY' ? 2 : 0} // Skip ticks for monthly view to avoid crowding
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="focus" name="专注时长(分)" radius={[4, 4, 0, 0]} barSize={viewMode === 'MONTHLY' ? 8 : 32} animationDuration={800}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;