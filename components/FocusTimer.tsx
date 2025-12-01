import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, X, Timer, Watch, CheckCircle2 } from 'lucide-react';
import { FocusSession, Task, TaskStatus } from '../types';

interface FocusTimerProps {
  onSessionComplete: (session: FocusSession) => void;
  tasks?: Task[]; // Make tasks available to select from
}

type TimerMode = 'COUNTDOWN' | 'STOPWATCH';

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete, tasks = [] }) => {
  // Settings state
  const [focusDuration, setFocusDuration] = useState(25); // Default 25 mins
  const [breakDuration, setBreakDuration] = useState(5);   // Default 5 mins
  
  const [timerMode, setTimerMode] = useState<TimerMode>('COUNTDOWN');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const [timeLeft, setTimeLeft] = useState(focusDuration * 60); // For Countdown
  const [elapsedTime, setElapsedTime] = useState(0); // For Stopwatch
  
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS'); // Focus vs Break
  const [showSettings, setShowSettings] = useState(false);

  // Sound helper
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (timerMode === 'COUNTDOWN') {
      setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
    } else {
      setElapsedTime(0);
    }
  }, [mode, focusDuration, breakDuration, timerMode]);

  // Update timeLeft if settings change
  useEffect(() => {
    if (!isActive && timerMode === 'COUNTDOWN') {
      setTimeLeft(mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
    }
  }, [focusDuration, breakDuration, mode, isActive, timerMode]);

  const switchMode = (newMode: 'FOCUS' | 'BREAK') => {
    setMode(newMode);
    setIsActive(false);
    if (timerMode === 'COUNTDOWN') {
      setTimeLeft(newMode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60);
    } else {
      setElapsedTime(0);
    }
  };

  // Main Timer Loop
  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        if (timerMode === 'COUNTDOWN') {
          setTimeLeft((prev) => {
             if (prev <= 1) {
                // Timer Finished
                clearInterval(interval);
                handleCountdownComplete();
                return 0;
             }
             return prev - 1;
          });
        } else {
          // Stopwatch
          setElapsedTime(prev => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timerMode]);

  const handleCountdownComplete = () => {
    setIsActive(false);
    playNotificationSound();
    
    if (mode === 'FOCUS') {
      saveSession(focusDuration);
      
      setTimeout(() => {
           const continueBreak = window.confirm("太棒了！专注完成。要开始休息吗？");
           if (continueBreak) switchMode('BREAK');
      }, 100);
    } else {
      setTimeout(() => {
          const continueFocus = window.confirm("休息结束！准备好开始新的专注了吗？");
          if (continueFocus) switchMode('FOCUS');
      }, 100);
    }
  };

  const handleStopwatchFinish = () => {
    setIsActive(false);
    // Round to nearest minute, but at least 1 minute if played for > 30s
    const minutes = Math.max(1, Math.round(elapsedTime / 60));
    saveSession(minutes);
    setElapsedTime(0);
    playNotificationSound();
    alert(`已记录专注时长：${minutes} 分钟`);
  };

  const saveSession = (durationMin: number) => {
    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    onSessionComplete({
      id: crypto.randomUUID(),
      durationMinutes: durationMin,
      completedAt: new Date().toISOString(),
      taskId: selectedTaskId || undefined,
      taskTitle: selectedTask?.title || undefined
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
       return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculation for Circle Progress (Only for Countdown)
  const totalTime = mode === 'FOCUS' ? focusDuration * 60 : breakDuration * 60;
  const progress = timerMode === 'COUNTDOWN' 
    ? ((totalTime - timeLeft) / totalTime) * 100 
    : 100; // Stopwatch always full circle but maybe pulsating

  const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] relative p-4">
      
      {/* Settings Toggle */}
      <div className="absolute top-0 right-0 z-20">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition-colors shadow-sm border ${showSettings ? 'bg-indigo-50 text-primary border-primary' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
          title="设置时长"
        >
          {showSettings ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      <div className="text-center mb-6 mt-8 sm:mt-0 z-10 w-full max-w-md">
        {/* Task Selector */}
        <div className="mb-6 relative">
          <select 
             value={selectedTaskId}
             onChange={(e) => setSelectedTaskId(e.target.value)}
             className="w-full bg-white border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
          >
             <option value="">🎯 选择一个任务来专注 (可选)</option>
             {todoTasks.map(t => (
               <option key={t.id} value={t.id}>{t.title} ({t.estimatedMinutes}m)</option>
             ))}
          </select>
          <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
             <CheckCircle2 size={18} />
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 transition-colors duration-300 ${mode === 'FOCUS' ? 'bg-indigo-50 text-primary' : 'bg-pink-50 text-secondary'}`}>
           {mode === 'FOCUS' ? <Brain size={16} /> : <Coffee size={16} />}
           <span>{mode === 'FOCUS' ? '专注模式' : '休息模式'}</span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-300 z-20 absolute top-12">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
               <Settings size={18} />
               <span>时钟设置</span>
             </h3>
             <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
           </div>

           {/* Timer Type Toggle */}
           <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
              <button 
                 onClick={() => { setTimerMode('COUNTDOWN'); resetTimer(); }}
                 className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${timerMode === 'COUNTDOWN' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
              >
                 <Timer size={16} /> 倒计时
              </button>
              <button 
                 onClick={() => { setTimerMode('STOPWATCH'); resetTimer(); }}
                 className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${timerMode === 'STOPWATCH' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
              >
                 <Watch size={16} /> 正计时
              </button>
           </div>

           {timerMode === 'COUNTDOWN' && (
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-600">专注时长</label>
                      <span className="text-sm font-bold text-primary">{focusDuration} 分钟</span>
                   </div>
                   <input 
                     type="range" min="1" max="120" value={focusDuration} 
                     onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                     disabled={isActive}
                     className="w-full accent-primary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                   />
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {[15, 25, 45, 60].map(m => (
                        <button 
                          key={m} 
                          onClick={() => setFocusDuration(m)}
                          disabled={isActive}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm border transition-all whitespace-nowrap ${focusDuration === m ? 'border-primary bg-indigo-50 text-primary font-bold' : 'border-slate-200 text-slate-500 hover:border-primary/50'}`}
                        >
                          {m}分
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-600">休息时长</label>
                      <span className="text-sm font-bold text-secondary">{breakDuration} 分钟</span>
                   </div>
                   <input 
                     type="range" min="1" max="30" value={breakDuration} 
                     onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                     disabled={isActive}
                     className="w-full accent-secondary h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                   />
                </div>
             </div>
           )}
           {timerMode === 'STOPWATCH' && (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                 正计时模式下，时间将从 0 开始累计。<br/>适合不确定时长的深度工作。
              </div>
           )}
        </div>
      )}

      {/* Timer Circle */}
      <div className={`relative w-72 h-72 sm:w-80 sm:h-80 mb-10 group flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-105' : 'scale-100'}`}>
        {/* Glow Effect */}
        <div className={`absolute inset-4 rounded-full blur-2xl opacity-20 transition-all duration-1000 ${isActive ? (mode === 'FOCUS' ? 'bg-indigo-500 animate-pulse' : 'bg-pink-500 animate-pulse') : 'bg-transparent'}`}></div>

        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 320 320">
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="white"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          {timerMode === 'COUNTDOWN' ? (
             <circle
               cx="160"
               cy="160"
               r="140"
               fill="none"
               stroke={mode === 'FOCUS' ? '#6366f1' : '#ec4899'}
               strokeWidth="12"
               strokeLinecap="round"
               strokeDasharray={2 * Math.PI * 140}
               strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
               className="transition-all duration-1000 ease-linear"
             />
          ) : (
             <circle
               cx="160"
               cy="160"
               r="140"
               fill="none"
               stroke={mode === 'FOCUS' ? '#6366f1' : '#ec4899'}
               strokeWidth="12"
               strokeDasharray="10, 20"
               className={`opacity-30 ${isActive ? 'animate-spin' : ''}`}
               style={{ animationDuration: '4s' }}
             />
          )}
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className={`text-6xl sm:text-7xl font-bold font-mono tracking-tighter tabular-nums transition-colors ${mode === 'FOCUS' ? 'text-slate-800' : 'text-pink-600'}`}>
            {formatTime(timerMode === 'COUNTDOWN' ? timeLeft : elapsedTime)}
          </span>
          <div className="mt-2 text-slate-400 text-sm font-medium tracking-widest uppercase opacity-80 flex items-center gap-2">
            {isActive 
               ? (timerMode === 'STOPWATCH' ? 'Recording' : (mode === 'FOCUS' ? 'Focusing' : 'Resting')) 
               : (timerMode === 'STOPWATCH' ? 'Stopwatch' : 'Paused')}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 sm:gap-8 z-10">
        <button
          onClick={resetTimer}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-all hover:scale-105 shadow-sm"
          title="重置"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={toggleTimer}
          className={`
            w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95
            ${isActive 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : (mode === 'FOCUS' ? 'bg-gradient-to-br from-indigo-500 to-violet-600 hover:shadow-indigo-200' : 'bg-gradient-to-br from-pink-500 to-rose-500 hover:shadow-pink-200')}
          `}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1 sm:ml-2" />}
        </button>

        {timerMode === 'STOPWATCH' && isActive ? (
           <button
             onClick={handleStopwatchFinish}
             className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all hover:scale-105 shadow-sm"
             title="完成并保存"
           >
             <CheckCircle2 size={24} />
           </button>
        ) : (
           <button
             onClick={() => switchMode(mode === 'FOCUS' ? 'BREAK' : 'FOCUS')}
             className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-all hover:scale-105 shadow-sm"
             title="切换模式"
           >
             {mode === 'FOCUS' ? <Coffee size={20} /> : <Brain size={20} />}
           </button>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;