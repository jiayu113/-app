import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onToggleStatus: (taskId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onToggleStatus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to get days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay(); // 0 is Sunday

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate calendar grid
  const days = [];
  // Padding for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Convert date to YYYY-MM-DD string for comparison, ignoring time
  const toDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = toDateString(selectedDate);

  // Filter tasks for selected date (comparing only YYYY-MM-DD part)
  const selectedDateTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    // Extract YYYY-MM-DD from task due date which might be YYYY-MM-DDTHH:mm
    const taskDatePart = t.dueDate.split('T')[0];
    return taskDatePart === selectedDateString;
  });

  // Helper to check if a specific day has tasks
  const getDayStatus = (date: Date) => {
    const dateStr = toDateString(date);
    const tasksForDay = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr);
    
    if (tasksForDay.length === 0) return 'NONE';
    const allComplete = tasksForDay.every(t => t.status === TaskStatus.COMPLETED);
    return allComplete ? 'ALL_DONE' : 'HAS_TODO';
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col md:flex-row gap-6">
      {/* Calendar Side */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {year}年 {month + 1}月
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-slate-400">
          <div>日</div>
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div>六</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = toDateString(date);
            const isSelected = dateStr === selectedDateString;
            const isToday = dateStr === toDateString(new Date());
            const status = getDayStatus(date);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                  ${isSelected ? 'bg-primary text-white shadow-md scale-105' : 'hover:bg-slate-50 text-slate-700'}
                  ${isToday && !isSelected ? 'border border-primary text-primary font-bold' : ''}
                `}
              >
                <span className="text-sm">{date.getDate()}</span>
                {/* Dots indicator */}
                <div className="flex gap-0.5 mt-1 h-1.5">
                  {status !== 'NONE' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'ALL_DONE' ? (isSelected ? 'bg-white/50' : 'bg-green-400') : (isSelected ? 'bg-white' : 'bg-indigo-400')}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List Side (For Selected Date) */}
      <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 的任务</span>
          <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded-md border">
            {selectedDateTasks.length} 个任务
          </span>
        </h3>

        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p>今天没有安排任务</p>
              <p className="mt-1 text-xs">去"任务清单"添加一个吧</p>
            </div>
          ) : (
            selectedDateTasks.map(task => (
              <div 
                key={task.id} 
                className={`
                  bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3
                  ${task.status === TaskStatus.COMPLETED ? 'opacity-60' : ''}
                `}
              >
                 <button
                  onClick={() => onToggleStatus(task.id)}
                  className={`
                    mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                    ${task.status === TaskStatus.COMPLETED 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 hover:border-primary'}
                  `}
                >
                  {task.status === TaskStatus.COMPLETED && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-slate-800 break-words ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 inline-block`}>
                      {task.estimatedMinutes} 分钟
                    </span>
                     {task.dueDate && task.dueDate.includes('T') && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 inline-block`}>
                          {task.dueDate.split('T')[1]} 截止
                        </span>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;