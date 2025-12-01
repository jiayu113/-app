import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Sparkles, Loader2, Calendar, Clock, Sun, Moon, CloudSun, AlertCircle, Edit2, X, Save } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import { breakDownGoal } from '../services/ai';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks }) => {
  // Add Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  
  // UI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [greeting, setGreeting] = useState('');
  
  // Edit & Delete State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('早上好');
    else if (hour >= 12 && hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: TaskStatus.TODO,
      priority: priority,
      estimatedMinutes: estimatedMinutes || 30,
      createdAt: Date.now(),
      dueDate: dueDate || undefined,
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setDueDate('');
    setPriority(Priority.MEDIUM);
    setEstimatedMinutes(30);
  };

  const handleToggleStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: t.status === TaskStatus.TODO ? TaskStatus.COMPLETED : TaskStatus.TODO }
        : t
    ));
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  // Edit Handlers
  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const handleAiBreakdown = async () => {
    if (!newTaskTitle.trim()) return;
    setIsAiLoading(true);
    try {
      const subtasks = await breakDownGoal(newTaskTitle);
      const newTasks: Task[] = subtasks.map(st => ({
        id: crypto.randomUUID(),
        title: st.title,
        status: TaskStatus.TODO,
        priority: st.priority as Priority,
        estimatedMinutes: st.estimatedMinutes,
        createdAt: Date.now(),
        dueDate: dueDate || undefined,
      }));
      setTasks(prev => [...newTasks, ...prev]);
      setNewTaskTitle('');
    } catch (error) {
      alert("AI 服务暂时不可用，请稍后再试。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-rose-50 text-rose-600 border-rose-100';
      case Priority.MEDIUM: return 'bg-amber-50 text-amber-600 border-amber-100';
      case Priority.LOW: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // Helper to format date nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    const hasTime = dateString.includes('T');
    
    return hasTime ? `${monthDay} ${hours}:${minutes}` : monthDay;
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sun className="text-amber-500" size={20} />;
    if (hour >= 12 && hour < 18) return <CloudSun className="text-orange-500" size={20} />;
    return <Moon className="text-indigo-400" size={20} />;
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
           <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2 bg-white inline-flex px-3 py-1 rounded-full border border-slate-100 shadow-sm">
             {getGreetingIcon()}
             <span>{greeting}，愿你今天效率倍增</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">我的任务</h1>
        </div>
        <div className="text-right hidden sm:block">
           <div className="text-3xl font-bold text-primary">{tasks.filter(t => t.status === TaskStatus.TODO).length}</div>
           <div className="text-xs text-slate-400 font-medium">待办任务</div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-50/50 border border-slate-100 p-6 mb-8 transform transition-all hover:shadow-xl hover:shadow-indigo-50/80">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="今天想做些什么？例如：'学习30分钟英语'..."
              className="w-full pl-4 pr-32 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <div className="absolute right-2 top-2 bottom-2 flex gap-2">
              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={isAiLoading || !newTaskTitle.trim()}
                className={`
                   flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-all
                   ${!newTaskTitle.trim() ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                   ${isAiLoading ? 'bg-indigo-50 text-indigo-400' : 'bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-600 hover:from-violet-200 hover:to-indigo-200'}
                `}
                title="AI 智能拆解任务"
              >
                {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                <span className="hidden sm:inline">AI 拆解</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex flex-wrap items-center gap-2">
                {/* Priority Selector */}
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-white"
                >
                  <option value={Priority.HIGH}>🔥 高优先级</option>
                  <option value={Priority.MEDIUM}>⚡ 中优先级</option>
                  <option value={Priority.LOW}>☕ 低优先级</option>
                </select>

                {/* Estimated Time Input */}
                <div className="relative flex items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:bg-white transition-colors text-slate-600">
                    <Clock size={16} className="text-slate-400 mr-2" />
                    <input 
                      type="number" 
                      min="1"
                      max="480"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
                      className="bg-transparent border-none outline-none text-sm w-12 text-center text-slate-600 placeholder-slate-400"
                    />
                    <span className="text-xs text-slate-400 ml-1">分钟</span>
                </div>

                {/* Date Picker */}
                <div className="relative flex items-center bg-slate-50 hover:bg-white px-3 py-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer text-slate-600">
                    <Calendar size={16} className="text-slate-400 mr-2" />
                    <input 
                      type="datetime-local" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-36 sm:w-40 cursor-pointer text-slate-600 placeholder-slate-400"
                    />
                </div>
             </div>

             <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="w-full sm:w-auto bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              <span>添加任务</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {(['ALL', TaskStatus.TODO, TaskStatus.COMPLETED] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
              ${filter === f 
                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-200'}
            `}
          >
            {f === 'ALL' ? '全部' : f === TaskStatus.TODO ? '待办' : '已完成'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 text-slate-300">
              <Check size={40} strokeWidth={1.5} />
            </div>
            <p className="text-slate-500 font-medium">
              {filter === 'ALL' ? '暂无任务，开始创建吧！' : filter === TaskStatus.TODO ? '所有待办已清空，真棒！' : '还没有已完成的任务'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`
                group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-4
                ${task.status === TaskStatus.COMPLETED ? 'opacity-50 bg-slate-50/80' : ''}
              `}
            >
              <button
                onClick={() => handleToggleStatus(task.id)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${task.status === TaskStatus.COMPLETED 
                    ? 'bg-green-500 border-green-500 text-white scale-110' 
                    : 'border-slate-300 hover:border-primary hover:bg-indigo-50'}
                `}
              >
                {task.status === TaskStatus.COMPLETED && <Check size={14} strokeWidth={3} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-slate-800 truncate transition-all ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                  <span className={`px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                    <Clock size={12} />
                    {task.estimatedMinutes} 分钟
                  </span>
                  {task.dueDate && (
                     <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${task.status === TaskStatus.TODO && new Date(task.dueDate) < new Date() ? 'bg-red-50 text-red-500 font-medium' : 'bg-slate-50 text-slate-400'}`}>
                        <Calendar size={12} />
                        {formatDate(task.dueDate)}
                     </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                  title="编辑"
                  type="button"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(task)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="删除"
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 animate-in fade-in zoom-in-95">
             <div className="flex flex-col items-center text-center gap-4">
               <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                 <Trash2 size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800">确认删除?</h3>
                 <p className="text-slate-500 text-sm mt-1 break-words px-4">
                   任务 "{taskToDelete.title}" 将被永久删除，无法恢复。
                 </p>
               </div>
               <div className="flex gap-3 w-full mt-2">
                 <button 
                   onClick={() => setTaskToDelete(null)}
                   className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-md shadow-red-200 transition-colors"
                 >
                   确认删除
                 </button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Edit2 size={18} className="text-primary" />
                  编辑任务
                </h3>
                <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">任务名称</label>
                    <input 
                      type="text" 
                      value={editingTask.title} 
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                      placeholder="任务名称..."
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                        <select
                          value={editingTask.priority}
                          onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                           <option value={Priority.HIGH}>🔥 高优先级</option>
                           <option value={Priority.MEDIUM}>⚡ 中优先级</option>
                           <option value={Priority.LOW}>☕ 低优先级</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">预估时间 (分钟)</label>
                        <input 
                          type="number"
                          min="1"
                          max="480"
                          value={editingTask.estimatedMinutes} 
                          onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">截止时间</label>
                    <input 
                      type="datetime-local" 
                      value={editingTask.dueDate || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setEditingTask(null)}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      type="submit"
                      disabled={!editingTask.title.trim()}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 font-medium shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={18} /> 保存修改
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;