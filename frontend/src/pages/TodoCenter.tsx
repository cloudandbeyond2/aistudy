import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import Swal from 'sweetalert2';
import {
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Trash2,
  CalendarDays,
  CheckCheck,
  AlertTriangle,
  Clock,
  LayoutList,
  ArrowLeft,
  Pencil,
  X,
  Check,
  Calendar,
  CheckCircle,
  Filter,
  ChevronDown,
  Star,
  Sparkles,
  TrendingUp,
  CalendarRange,
  ListTodo,
  Target,
} from 'lucide-react';
import { useTodo } from '@/context/TodoContext';

type TodoPriority = 'Low' | 'Medium' | 'High';
type TodoFilter = 'all' | 'High' | 'Medium' | 'Low' | 'upcoming' | 'finished' | 'overdue';

type TodoItem = {
  _id: string;
  id?: string;
  title: string;
  notes: string;
  dueDate: string;
  priority: TodoPriority;
  completed: boolean;
  createdAt: string;
  uid: string;
  role: string;
  completedAt?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.colossusiq.ai/api';

const PC = {
  High:   { dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200',         bar: 'bg-gradient-to-b from-rose-400 to-rose-500', glow: 'shadow-rose-100' },
  Medium: { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       bar: 'bg-gradient-to-b from-amber-400 to-amber-500', glow: 'shadow-amber-100' },
  Low:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-gradient-to-b from-emerald-400 to-emerald-500', glow: 'shadow-emerald-100' },
};

const FILTERS = [
  { key: 'all', label: 'All Tasks', icon: ListTodo, color: 'text-slate-600' },
  { key: 'upcoming', label: 'Upcoming', icon: CalendarRange, color: 'text-blue-600' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'text-rose-600' },
  // { key: 'finished', label: 'Finished', icon: CheckCircle, color: 'text-emerald-600' },
  { key: 'High', label: 'High Priority', icon: TrendingUp, color: 'text-rose-600' },
  { key: 'Medium', label: 'Medium Priority', icon: Target, color: 'text-amber-600' },
  { key: 'Low', label: 'Low Priority', icon: Star, color: 'text-emerald-600' },
];

const SW = { 
  background: '#ffffff', 
  color: '#1e293b', 
  confirmButtonColor: '#6366f1',
  cancelButtonColor: '#94a3b8'
};

// API Service Class (same as before)
class TodoAPI {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/todos${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  }

  async getAllTodos(uid: string, role: string) {
    return this.request(`?uid=${uid}&role=${role}`);
  }

  async createTodo(uid: string, role: string, todoData: any) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({ uid, role, ...todoData }),
    });
  }

  async updateTodo(id: string, uid: string, updates: any) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ uid, ...updates }),
    });
  }

  async deleteTodo(id: string, uid: string) {
    return this.request(`/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ uid }),
    });
  }

  async toggleTodo(id: string, uid: string) {
    return this.request(`/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ uid }),
    });
  }

  async deleteCompletedTodos(uid: string, role: string) {
    return this.request('/completed/clear', {
      method: 'DELETE',
      body: JSON.stringify({ uid, role }),
    });
  }

  async resetAllTodos(uid: string, role: string) {
    return this.request('/reset/all', {
      method: 'DELETE',
      body: JSON.stringify({ uid, role }),
    });
  }
}

const todoAPI = new TodoAPI(API_BASE_URL);

export default function TodoCenter() {
  const navigate = useNavigate();
  const uid = sessionStorage.getItem('uid') || 'guest';
  const role = sessionStorage.getItem('role') || 'user';
  const userName = sessionStorage.getItem('mName') || 'Learner';

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editPri, setEditPri] = useState<TodoPriority>('Medium');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { updateTodoCount, refreshTodoCount } = useTodo();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getAllTodos(uid, role);
      setTodos(response.data || []);
      await refreshTodoCount();
    } catch (error: any) {
      Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to load todos', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (t: TodoItem) => {
    if (t.completed) return false;
    const d = t.dueDate ? new Date(t.dueDate).getTime() : null;
    return !!d && d < new Date().setHours(0, 0, 0, 0);
  };

  const isUpcoming = (t: TodoItem) => {
    if (t.completed) return false;
    const d = t.dueDate ? new Date(t.dueDate).getTime() : null;
    const today = new Date().setHours(0, 0, 0, 0);
    return !!d && d >= today;
  };

  const getFilteredTodos = () => {
    switch(filter) {
      case 'upcoming':
        return todos.filter(t => isUpcoming(t));
      case 'overdue':
        return todos.filter(t => isOverdue(t));
      case 'finished':
        return todos.filter(t => t.completed);
      case 'High':
      case 'Medium':
      case 'Low':
        return todos.filter(t => t.priority === filter);
      default:
        return todos;
    }
  };

  const stats = {
    total: todos.length,
    upcoming: todos.filter(t => isUpcoming(t)).length,
    overdue: todos.filter(t => isOverdue(t)).length,
    completed: todos.filter(t => t.completed).length,
    high: todos.filter(t => t.priority === 'High').length,
    medium: todos.filter(t => t.priority === 'Medium').length,
    low: todos.filter(t => t.priority === 'Low').length,
  };

  const filtered = getFilteredTodos();
  const currentFilter = FILTERS.find(f => f.key === filter) || FILTERS[0];

  const handleAdd = async () => {
    const clean = title.trim();
    if (!clean) { 
      Swal.fire({ ...SW, title: 'Title required', icon: 'info' }); 
      return; 
    }
    
    Swal.fire({ 
      ...SW, 
      title: 'Add task?', 
      text: `"${clean}"`, 
      icon: 'question', 
      showCancelButton: true, 
      confirmButtonText: 'Add', 
      reverseButtons: true 
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      
      updateTodoCount('add');
      
      try {
        const response = await todoAPI.createTodo(uid, role, {
          title: clean,
          notes: notes.trim(),
          dueDate: dueDate || null,
          priority
        });
        
        setTodos(prev => [response.data, ...prev]);
        setTitle('');
        setNotes('');
        setDueDate('');
        setPriority('Medium');
        await refreshTodoCount();
        
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW })
          .fire({ icon: 'success', title: 'Task added' });
      } catch (error: any) {
        updateTodoCount('delete');
        Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to add task', icon: 'error' });
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    Swal.fire({ 
      ...SW, 
      title: 'Delete?', 
      text: `"${title}"`, 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#ef4444', 
      confirmButtonText: 'Delete', 
      reverseButtons: true 
    }).then(async (r) => { 
      if (r.isConfirmed) {
        updateTodoCount('delete');
        
        try {
          await todoAPI.deleteTodo(id, uid);
          setTodos(prev => prev.filter(x => (x._id || x.id) !== id));
          await refreshTodoCount();
          
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW })
            .fire({ icon: 'success', title: 'Task deleted' });
        } catch (error: any) {
          updateTodoCount('add');
          Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to delete task', icon: 'error' });
        }
      }
    });
  };

  const toggle = async (id: string) => {
    try {
      const response = await todoAPI.toggleTodo(id, uid);
      setTodos(prev => prev.map(t => {
        const todoId = t._id || t.id;
        return todoId === id ? { ...response.data, completedAt: response.data.completed ? new Date().toISOString() : undefined } : t;
      }));
      await refreshTodoCount();
    } catch (error: any) {
      Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to update task', icon: 'error' });
    }
  };

  const clearDone = async () => {
    Swal.fire({ 
      ...SW, 
      title: 'Clear completed?', 
      text: 'This will delete all completed tasks', 
      icon: 'question', 
      showCancelButton: true, 
      confirmButtonText: 'Clear', 
      reverseButtons: true 
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await todoAPI.deleteCompletedTodos(uid, role);
          setTodos(prev => prev.filter(t => !t.completed));
          await refreshTodoCount();
          
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW })
            .fire({ icon: 'success', title: 'Completed tasks cleared' });
        } catch (error: any) {
          Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to clear completed tasks', icon: 'error' });
        }
      }
    });
  };

  const handleReset = () => {
    Swal.fire({ 
      ...SW, 
      title: 'Reset all?', 
      text: 'This will delete ALL tasks!', 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#ef4444', 
      confirmButtonText: 'Clear all', 
      reverseButtons: true 
    }).then(async (r) => { 
      if (r.isConfirmed) {
        try {
          await todoAPI.resetAllTodos(uid, role);
          setTodos([]);
          updateTodoCount('reset');
          await refreshTodoCount();
          
          Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW })
            .fire({ icon: 'success', title: 'All tasks cleared' });
        } catch (error: any) {
          Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to reset tasks', icon: 'error' });
        }
      }
    });
  };

  const handleClearForm = () => {
    setTitle('');
    setNotes('');
    setDueDate('');
    setPriority('Medium');
  };

  const openEdit = (todo: TodoItem) => {
    setEditingId(todo._id || todo.id || '');
    setEditTitle(todo.title);
    setEditNotes(todo.notes);
    setEditDue(todo.dueDate);
    setEditPri(todo.priority);
  };

  const saveEdit = async (id: string) => {
    const clean = editTitle.trim();
    if (!clean) return;
    
    try {
      const response = await todoAPI.updateTodo(id, uid, {
        title: clean,
        notes: editNotes.trim(),
        dueDate: editDue,
        priority: editPri
      });
      
      setTodos(prev => prev.map(t => {
        const todoId = t._id || t.id;
        return todoId === id ? response.data : t;
      }));
      setEditingId(null);
      
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW })
        .fire({ icon: 'success', title: 'Task updated' });
    } catch (error: any) {
      Swal.fire({ ...SW, title: 'Error', text: error.message || 'Failed to update task', icon: 'error' });
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const inp = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Todo Center" description="Track tasks with smart filters" />

      <div className="min-h-screen via-white to-indigo-50/30">
        <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto relative pt-6 lg:pt-20">
          
          {/* Header Section */}
          <div className="relative">
            <div className="absolute inset-0 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* <button 
                  onClick={() => navigate(-1)} 
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                </button> */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Task Manager
                  </h1>
                  {/* <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Welcome back, {userName}
                  </p> */}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleReset} 
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-rose-200 hover:text-rose-600 hover:bg-white transition-all"
                >
                  <RotateCcw className="h-4 w-4" /> Reset All
                </button>
                {todos.some(t => t.completed) && (
                  <button 
                    onClick={clearDone} 
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-emerald-200 hover:text-emerald-600 hover:bg-white transition-all"
                  >
                    <CheckCheck className="h-4 w-4" /> Clear Done
                  </button>
                )}
              </div>
            </div>
          </div>

       {/* Stats Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {[
    { label: 'Total', value: stats.total, icon: ListTodo, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50' },
    { label: 'Upcoming', value: stats.upcoming, icon: CalendarRange, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
    { label: 'High Priority', value: stats.high, icon: TrendingUp, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50' },
  ].map((stat, idx) => (
    <div key={idx} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-3xl`}></div>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {stat.value}
          </p>
        </div>
        <div className={`p-2 rounded-xl ${stat.bg}`}>
          <stat.icon className={`h-4 w-4 ${stat.color.replace('from-', 'text-').replace(' to-', '')}`} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} w-0 group-hover:w-full transition-all duration-300 rounded-full`}></div>
    </div>
  ))}
</div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
            
            {/* Add Task Panel - Redesigned */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50">
                        <Plus className="h-4 w-4 text-indigo-600" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Create New Task</p>
                    </div>
                    <button
                      onClick={handleClearForm}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      <X className="h-3 w-3" /> Clear
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Task Title <span className="text-rose-400">*</span></label>
                      <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleAdd()} 
                        placeholder="What needs to be done?" 
                        className={inp}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Notes</label>
                      <textarea 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        placeholder="Add details, checklist, or context..." 
                        rows={3} 
                        className={`${inp} resize-none`} 
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Due Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="date" 
                          value={dueDate} 
                          onChange={e => setDueDate(e.target.value)} 
                          className={`${inp} pl-9`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Priority Level</label>
                      <div className="flex gap-2">
                        {(['Low', 'Medium', 'High'] as TodoPriority[]).map(p => (
                          <button 
                            key={p} 
                            onClick={() => setPriority(p)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-semibold transition-all ${
                              priority === p 
                                ? `${PC[p].badge} border-current shadow-sm` 
                                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}>
                            <span className={`h-2 w-2 rounded-full ${priority === p ? PC[p].dot : 'bg-slate-300'}`} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleAdd}
                      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <Plus className="inline-block h-4 w-4 mr-2" /> Add Task
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Task List Section - Redesigned with Better Filter UI */}
           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
  {/* Filter Header */}
  <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 sm:p-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Filters</span>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
        >
          <currentFilter.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${currentFilter.color}`} />
          {currentFilter.label}
          <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
        </button>
        
        {showFilterMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)}></div>
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key as TodoFilter);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm transition-all ${
                    filter === f.key 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <f.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${filter === f.key ? f.color : 'text-slate-400'}`} />
                  {f.label}
                  {filter === f.key && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-auto text-indigo-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </div>

  {/* Task Items */}
  <div className="p-3 sm:p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
    {filtered.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
          <currentFilter.icon className="h-6 w-6 sm:h-7 sm:w-7 text-slate-400" />
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-600">No tasks found</p>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          {filter === 'all' ? 'Create your first task to get started' : `No ${currentFilter.label.toLowerCase()} tasks available`}
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        {filtered.map(todo => {
          const todoId = todo._id || todo.id || '';
          const late = isOverdue(todo);
          const upcoming = isUpcoming(todo);
          const pc = PC[todo.priority];
          return (
            <div
              key={todoId}
              className={`group relative rounded-xl border transition-all duration-200 ${
                editingId === todoId
                  ? 'border-indigo-300 bg-indigo-50/60 shadow-md'
                  : todo.completed
                  ? 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'
                  : late
                  ? 'border-rose-200 bg-gradient-to-r from-rose-50/50 to-white hover:shadow-md'
                  : upcoming
                  ? 'border-blue-100 bg-gradient-to-r from-blue-50/30 to-white hover:border-blue-200 hover:shadow-md'
                  : 'border-slate-100 hover:border-indigo-100 hover:shadow-md'
              }`}
            >
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${pc.bar} ${todo.completed ? 'opacity-25' : ''}`} />

              {editingId === todoId ? (
                <div className="p-3 sm:p-4 space-y-3">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(todoId); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Notes…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="date" 
                      value={editDue} 
                      onChange={e => setEditDue(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-indigo-300" 
                    />
                    <select 
                      value={editPri} 
                      onChange={e => setEditPri(e.target.value as TodoPriority)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-indigo-300">
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button 
                      onClick={() => saveEdit(todoId)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-all">
                      <Check className="h-4 w-4" /> Save Changes
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 sm:p-4 group">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <button 
                      onClick={() => toggle(todoId)} 
                      className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                    >
                      {todo.completed
                        ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                        : <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 transition hover:text-indigo-400" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className={`text-sm sm:text-base font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {todo.title}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-semibold ${pc.badge}`}>
                          <span className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${pc.dot}`} />
                          {todo.priority}
                        </span>
                        {late && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-semibold text-rose-600">
                            <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Overdue
                          </span>
                        )}
                        {upcoming && !late && !todo.completed && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-semibold text-blue-600">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Upcoming
                          </span>
                        )}
                      </div>
                      {todo.notes && (
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2">{todo.notes}</p>
                      )}
                      {todo.dueDate && (
                        <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-slate-400">
                          <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>Due {fmtDate(todo.dueDate)}</span>
                          {upcoming && !late && !todo.completed && (
                            <span className="text-blue-500 ml-0.5 sm:ml-1">
                              • {Math.ceil((new Date(todo.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(todo)}
                        className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        title="Edit task"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(todoId, todo.title)}
                        className="rounded-lg p-1.5 sm:p-2 text-rose-400 hover:bg-rose-50 transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>

  {/* Footer Stats */}
  {filtered.length > 0 && (
    <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] sm:text-xs">
        <span className="text-slate-500 text-center sm:text-left">
          Showing {filtered.length} of {todos.length} tasks
        </span>
        <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
          <span className="text-emerald-600 flex items-center gap-1">
            <span>✓</span> {stats.completed} completed
          </span>
          {stats.overdue > 0 && (
            <span className="text-rose-600 flex items-center gap-1">
              <span>⚠</span> {stats.overdue} overdue
            </span>
          )}
        </div>
      </div>
    </div>
  )}
</div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}