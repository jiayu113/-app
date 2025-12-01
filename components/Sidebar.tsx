import React from 'react';
import { LayoutDashboard, CheckSquare, Clock, BarChart2, CalendarDays } from 'lucide-react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: AppTab.TASKS, label: '任务清单', icon: <CheckSquare size={20} /> },
    { id: AppTab.CALENDAR, label: '日历视图', icon: <CalendarDays size={20} /> },
    { id: AppTab.FOCUS, label: '专注时钟', icon: <Clock size={20} /> },
    { id: AppTab.ANALYTICS, label: '数据分析', icon: <BarChart2 size={20} /> },
  ];

  const handleNavClick = (tab: AppTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              S
            </div>
            <span className="text-xl font-bold text-slate-800">智绘时间</span>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-primary shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-400 text-center">
            v1.0.0 免费完整版
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;