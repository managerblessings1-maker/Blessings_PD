import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BookOpen, 
  Youtube, 
  LayoutDashboard,
  Clock,
  Flame,
  Search,
  ExternalLink,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Task, FinanceItem, Skill, Video } from './types';

// --- Components ---

const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`bg-brand-card rounded-2xl p-4 ios-shadow border border-white/5 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full orange-gradient"
    />
  </div>
);

// --- Storage Service ---
const STORAGE_KEYS = {
  TASKS: 'levelup_tasks',
  FINANCE: 'levelup_finance',
  SKILLS: 'levelup_skills',
  VIDEOS: 'levelup_videos'
};

const Storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// --- Views ---

const TasksView = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' as const });

  useEffect(() => {
    setTasks(Storage.get(STORAGE_KEYS.TASKS, []));
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    Storage.set(STORAGE_KEYS.TASKS, newTasks);
  };

  const addTask = () => {
    if (!newTask.title) return;
    const task: Task = {
      id: Date.now(),
      ...newTask,
      date: new Date().toISOString(),
      completed: false
    };
    saveTasks([...tasks, task].sort((a, b) => {
      const pMap = { High: 1, Medium: 2, Low: 3 };
      return pMap[a.priority] - pMap[b.priority];
    }));
    setNewTask({ title: '', description: '', priority: 'Medium' });
    setShowAdd(false);
  };

  const toggleTask = (id: number) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
          <p className="text-white/50 text-sm">Stay productive today</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 rounded-full orange-gradient flex items-center justify-center ios-shadow active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <Card className="space-y-3">
        <div className="flex justify-between text-sm font-medium">
          <span>Daily Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} />
      </Card>

      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div 
            layout
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="flex items-center gap-4 group">
              <button onClick={() => toggleTask(task.id)}>
                {task.completed ? (
                  <CheckCircle2 className="text-brand-orange" size={24} />
                ) : (
                  <Circle className="text-white/20" size={24} />
                )}
              </button>
              <div className="flex-1">
                <h3 className={`font-semibold ${task.completed ? 'line-through text-white/30' : ''}`}>
                  {task.title}
                </h3>
                <p className="text-xs text-white/40 line-clamp-1">{task.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  task.priority === 'High' ? 'bg-red-500/20 text-red-500' :
                  task.priority === 'Medium' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {task.priority}
                </span>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-brand-card rounded-3xl p-6 ios-shadow"
            >
              <h2 className="text-xl font-bold mb-4">New Task</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Task Title"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
                <textarea 
                  placeholder="Description"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange h-24"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTask({...newTask, priority: p})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        newTask.priority === p ? 'orange-gradient' : 'bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 font-medium">Cancel</button>
                  <button onClick={addTask} className="flex-1 py-3 rounded-xl orange-gradient font-bold">Add Task</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FinanceView = () => {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'Expense' as const, amount: '', category: '', note: '' });

  useEffect(() => {
    setItems(Storage.get(STORAGE_KEYS.FINANCE, []));
  }, []);

  const saveFinance = (newItems: FinanceItem[]) => {
    setItems(newItems);
    Storage.set(STORAGE_KEYS.FINANCE, newItems);
  };

  const addItem = () => {
    if (!newItem.amount) return;
    const item: FinanceItem = {
      id: Date.now(),
      type: newItem.type,
      amount: parseFloat(newItem.amount),
      category: newItem.category,
      note: newItem.note,
      date: new Date().toISOString()
    };
    saveFinance([item, ...items]);
    setNewItem({ type: 'Expense', amount: '', category: '', note: '' });
    setShowAdd(false);
  };

  const totalIncome = items.filter(i => i.type === 'Income').reduce((acc, i) => acc + i.amount, 0);
  const totalExpense = items.filter(i => i.type === 'Expense').reduce((acc, i) => acc + i.amount, 0);
  const balance = totalIncome - totalExpense;

  // Simple Bar Chart Data (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayItems = items.filter(item => item.date.startsWith(date));
    const income = dayItems.filter(i => i.type === 'Income').reduce((acc, i) => acc + i.amount, 0);
    const expense = dayItems.filter(i => i.type === 'Expense').reduce((acc, i) => acc + i.amount, 0);
    return { date, income, expense };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 100);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-white/50 text-sm">Track your wealth</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 rounded-full orange-gradient flex items-center justify-center ios-shadow active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <Card className="orange-gradient !border-none p-6">
        <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold">${balance.toLocaleString()}</h2>
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-white/20 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/70 mb-1">
              <TrendingUp size={14} /> Income
            </div>
            <p className="font-bold">${totalIncome.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/70 mb-1">
              <TrendingDown size={14} /> Expense
            </div>
            <p className="font-bold">${totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-6">Weekly Activity</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {chartData.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center gap-1 h-24 items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.income / maxVal) * 100}%` }}
                  className="w-2 bg-emerald-500 rounded-t-full"
                />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.expense / maxVal) * 100}%` }}
                  className="w-2 bg-red-500 rounded-t-full"
                />
              </div>
              <span className="text-[8px] font-bold text-white/30">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-bold px-1">Recent Transactions</h3>
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.type === 'Income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {item.type === 'Income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <h4 className="font-semibold">{item.category || 'Uncategorized'}</h4>
                <p className="text-xs text-white/40">{item.note}</p>
              </div>
            </div>
            <p className={`font-bold ${item.type === 'Income' ? 'text-emerald-500' : 'text-white'}`}>
              {item.type === 'Income' ? '+' : '-'}${item.amount.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-brand-card rounded-3xl p-6 ios-shadow"
            >
              <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(['Income', 'Expense'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setNewItem({...newItem, type: t})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        newItem.type === t ? 'orange-gradient' : 'bg-white/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  placeholder="Amount"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange text-2xl font-bold text-center"
                  value={newItem.amount}
                  onChange={e => setNewItem({...newItem, amount: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Category (e.g. Food, Salary)"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Note"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newItem.note}
                  onChange={e => setNewItem({...newItem, note: e.target.value})}
                />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 font-medium">Cancel</button>
                  <button onClick={addItem} className="flex-1 py-3 rounded-xl orange-gradient font-bold">Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SkillsView = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setSkills(Storage.get(STORAGE_KEYS.SKILLS, []));
  }, []);

  const saveSkills = (newSkills: Skill[]) => {
    setSkills(newSkills);
    Storage.set(STORAGE_KEYS.SKILLS, newSkills);
  };

  const addSkill = () => {
    if (!newName) return;
    const skill: Skill = {
      id: Date.now(),
      name: newName,
      timeSpent: 0,
      streak: 0,
      completed: false,
      lastUpdated: new Date().toISOString()
    };
    saveSkills([...skills, skill]);
    setNewName('');
    setShowAdd(false);
  };

  const updateSkill = (skill: Skill, minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = skill.lastUpdated?.split('T')[0] !== today;
    
    saveSkills(skills.map(s => s.id === skill.id ? {
      ...s,
      timeSpent: s.timeSpent + minutes,
      streak: isNewDay ? s.streak + 1 : s.streak,
      lastUpdated: new Date().toISOString()
    } : s));
  };

  const toggleSkillCompleted = (skill: Skill) => {
    saveSkills(skills.map(s => s.id === skill.id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-white/50 text-sm">Master your craft</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 rounded-full orange-gradient flex items-center justify-center ios-shadow active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {skills.map(skill => (
          <Card key={skill.id} className={`flex flex-col gap-3 relative overflow-hidden transition-opacity ${skill.completed ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${skill.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {skill.completed ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
              </div>
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <Flame size={14} /> {skill.streak}
              </div>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${skill.completed ? 'line-through' : ''}`}>{skill.name}</h3>
              <p className="text-xs text-white/40 flex items-center gap-1">
                <Clock size={12} /> {skill.timeSpent} mins total
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => updateSkill(skill, 30)}
                disabled={skill.completed}
                className="flex-1 py-2 rounded-xl bg-white/5 text-[10px] font-bold hover:bg-white/10 active:scale-95 transition-all disabled:opacity-0"
              >
                +30m
              </button>
              <button 
                onClick={() => toggleSkillCompleted(skill)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold active:scale-95 transition-all ${
                  skill.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/40'
                }`}
              >
                {skill.completed ? 'Done' : 'Finish'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-brand-card rounded-3xl p-6 ios-shadow"
            >
              <h2 className="text-xl font-bold mb-4">New Skill</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Skill Name (e.g. Piano, Coding)"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 font-medium">Cancel</button>
                  <button onClick={addSkill} className="flex-1 py-3 rounded-xl orange-gradient font-bold">Start Learning</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideosView = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', link: '', category: 'Learning' });

  useEffect(() => {
    setVideos(Storage.get(STORAGE_KEYS.VIDEOS, []));
  }, []);

  const saveVideos = (newVideos: Video[]) => {
    setVideos(newVideos);
    Storage.set(STORAGE_KEYS.VIDEOS, newVideos);
  };

  const addVideo = () => {
    if (!newVideo.title || !newVideo.link) return;
    const video: Video = {
      id: Date.now(),
      ...newVideo,
      watched: false
    };
    saveVideos([...videos, video]);
    setNewVideo({ title: '', link: '', category: 'Learning' });
    setShowAdd(false);
  };

  const toggleWatched = (id: number) => {
    saveVideos(videos.map(v => v.id === id ? { ...v, watched: !v.watched } : v));
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-white/50 text-sm">Save your inspiration</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-12 h-12 rounded-full orange-gradient flex items-center justify-center ios-shadow active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
        <input 
          type="text" 
          placeholder="Search videos or categories..."
          className="w-full bg-brand-card rounded-2xl py-4 pl-12 pr-4 outline-none border border-white/5 focus:ring-2 ring-brand-orange"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredVideos.map(video => (
          <Card key={video.id} className="group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                {video.category}
              </span>
              <button 
                onClick={() => toggleWatched(video.id)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                  video.watched ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/40'
                }`}
              >
                {video.watched ? 'Watched' : 'Mark Watched'}
              </button>
            </div>
            <h3 className={`font-bold text-lg mb-3 ${video.watched ? 'text-white/40' : ''}`}>{video.title}</h3>
            <a 
              href={video.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 font-bold hover:bg-white/10 transition-colors"
            >
              <Youtube size={18} className="text-red-500" />
              Open in YouTube
              <ExternalLink size={14} />
            </a>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-brand-card rounded-3xl p-6 ios-shadow"
            >
              <h2 className="text-xl font-bold mb-4">Save Video</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Video Title"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newVideo.title}
                  onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="YouTube Link"
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange"
                  value={newVideo.link}
                  onChange={e => setNewVideo({...newVideo, link: e.target.value})}
                />
                <select 
                  className="w-full bg-white/5 rounded-xl p-3 outline-none focus:ring-2 ring-brand-orange appearance-none"
                  value={newVideo.category}
                  onChange={e => setNewVideo({...newVideo, category: e.target.value})}
                >
                  <option value="Learning">Learning</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-white/5 font-medium">Cancel</button>
                  <button onClick={addVideo} className="flex-1 py-3 rounded-xl orange-gradient font-bold">Save Video</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'finance' | 'skills' | 'videos'>('tasks');

  const tabs = [
    { id: 'tasks', icon: LayoutDashboard, label: 'Tasks' },
    { id: 'finance', icon: Wallet, label: 'Finance' },
    { id: 'skills', icon: BookOpen, label: 'Skills' },
    { id: 'videos', icon: Youtube, label: 'Watch' },
  ] as const;

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pt-8">
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'finance' && <FinanceView />}
            {activeTab === 'skills' && <SkillsView />}
            {activeTab === 'videos' && <VideosView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto glass rounded-3xl p-2 flex justify-around items-center ios-shadow z-40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              activeTab === tab.id ? 'text-brand-orange' : 'text-white/40'
            }`}
          >
            <tab.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-orange"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
