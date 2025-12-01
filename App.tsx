import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import FocusTimer from './components/FocusTimer';
import Analytics from './components/Analytics';
import CalendarView from './components/CalendarView';
import { AppTab, Task, FocusSession, TaskStatus, Priority } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TASKS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App State
  // Initialize with some dummy data for first-time visual appeal
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('smarttime_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', title: '体验 AI 任务拆解功能', status: TaskStatus.TODO, priority: Priority.HIGH, estimatedMinutes: 5, createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0] },
      { id: '2', title: '完成第一次番茄钟专注', status: TaskStatus.TODO, priority: Priority.MEDIUM, estimatedMinutes: 25, createdAt: Date.now(), dueDate: new Date().toISOString().split('T')[0] },
    ];
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('smarttime_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('smarttime_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('smarttime_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  const handleSessionComplete = (session: FocusSession) => {
    setFocusSessions(prev => [...prev, session]);
  };

  const handleToggleStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: t.status === TaskStatus.TODO ? TaskStatus.COMPLETED : TaskStatus.TODO }
        : t
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.TASKS:
        return <TaskList tasks={tasks} setTasks={setTasks} />;
      case AppTab.CALENDAR:
        return <CalendarView tasks={tasks} onToggleStatus={handleToggleStatus} />;
      case AppTab.FOCUS:
        return <FocusTimer tasks={tasks} onSessionComplete={handleSessionComplete} />;
      case AppTab.ANALYTICS:
        return <Analytics tasks={tasks} sessions={focusSessions} />;
      default:
        return <TaskList tasks={tasks} setTasks={setTasks} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 font-bold text-slate-800">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">S</div>
             <span>智绘时间</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;