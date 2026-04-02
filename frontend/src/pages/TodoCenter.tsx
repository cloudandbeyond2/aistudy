
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
} from 'lucide-react';
 
type TodoPriority = 'Low' | 'Medium' | 'High';
type TodoFilter = 'all' | 'pending' | 'completed' | 'overdue';
 
type TodoItem = {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  priority: TodoPriority;
  completed: boolean;
  createdAt: string;
};
 
const getStorageKey = () => {
  const uid = sessionStorage.getItem('uid') || 'guest';
  const role = sessionStorage.getItem('role') || 'user';
  return `aistudy.todo.${uid}.${role}`;
};
 
const readTodos = (storageKey: string): TodoItem[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
 
const PC = {
  High:   { dot: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-600 border-rose-200',     bar: 'bg-rose-400'    },
  Medium: { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-600 border-amber-200',   bar: 'bg-amber-400'   },
  Low:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', bar: 'bg-emerald-400' },
};
 
const FILTERS: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Done' },
  { key: 'overdue', label: 'Overdue' },
];
 
const SW = { background: '#ffffff', color: '#1e293b', confirmButtonColor: '#6366f1' };
 
export default function TodoCenter() {
  const navigate   = useNavigate();
  const storageKey = getStorageKey();
  const userName   = sessionStorage.getItem('mName') || 'Learner';
 
  const [todos,    setTodos]    = useState<TodoItem[]>(() => readTodos(storageKey));
  const [title,    setTitle]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [dueDate,  setDueDate]  = useState('');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [filter,   setFilter]   = useState<TodoFilter>('all');
 
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(todos)); }, [storageKey, todos]);
 
  const isOverdue = (t: TodoItem) => {
    const d = t.dueDate ? new Date(t.dueDate).getTime() : null;
    return !!d && d < new Date().setHours(0, 0, 0, 0) && !t.completed;
  };
 
  const stats = {
    total:     todos.length,
    pending:   todos.filter(t => !t.completed).length,
    completed: todos.filter(t =>  t.completed).length,
    overdue:   todos.filter(isOverdue).length,
  };
 
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
 
  const filtered = todos.filter(t => {
    if (filter === 'pending')   return !t.completed;
    if (filter === 'completed') return  t.completed;
    if (filter === 'overdue')   return  isOverdue(t);
    return true;
  });
 
  const handleAdd = () => {
    const clean = title.trim();
    if (!clean) { Swal.fire({ ...SW, title: 'Title required', icon: 'info' }); return; }
    Swal.fire({ ...SW, title: 'Add task?', text: `"${clean}"`, icon: 'question', showCancelButton: true, cancelButtonColor: '#94a3b8', confirmButtonText: 'Add', reverseButtons: true })
      .then(r => {
        if (!r.isConfirmed) return;
        setTodos(p => [{ id: crypto.randomUUID?.() || `${Date.now()}`, title: clean, notes: notes.trim(), dueDate, priority, completed: false, createdAt: new Date().toISOString() }, ...p]);
        setTitle(''); setNotes(''); setDueDate(''); setPriority('Medium');
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1400, ...SW }).fire({ icon: 'success', title: 'Task added' });
      });
  };
 
  const handleDelete = (id: string, t: string) =>
    Swal.fire({ ...SW, title: 'Delete?', text: `"${t}"`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8', confirmButtonText: 'Delete', reverseButtons: true })
      .then(r => { if (r.isConfirmed) setTodos(p => p.filter(x => x.id !== id)); });
 
  const handleReset = () =>
    Swal.fire({ ...SW, title: 'Reset all?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8', confirmButtonText: 'Clear all', reverseButtons: true })
      .then(r => { if (r.isConfirmed) setTodos([]); });
 
  const toggle   = (id: string) => setTodos(p => p.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const clearDone = () => setTodos(p => p.filter(t => !t.completed));
  const fmtDate  = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
 
  const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
 
  return (
    <>
      <SEO title="Todo Center" description="Track tasks." />
 
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
 
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Todo Center</h1>
                <p className="text-xs text-slate-400">Welcome, <span className="font-semibold text-indigo-500">{userName}</span></p>
              </div>
            </div>
            {/* Ring progress */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="relative h-8 w-8">
                <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#6366f1" strokeWidth="3.5"
                    strokeDasharray={`${(pct / 100) * 75.4} 75.4`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">{pct}%</span>
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-700">{stats.completed}/{stats.total} done</p>
                <p className="text-[10px] text-slate-400">completion</p>
              </div>
            </div>
          </div>
 
          {/* Stats */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Total',   val: stats.total,     icon: <LayoutList    className="h-3.5 w-3.5"/>, num: 'text-slate-700',   ic: 'bg-slate-100 text-slate-500'   },
              { label: 'Pending', val: stats.pending,   icon: <Clock         className="h-3.5 w-3.5"/>, num: 'text-amber-600',   ic: 'bg-amber-50 text-amber-500'    },
              { label: 'Done',    val: stats.completed, icon: <CheckCheck    className="h-3.5 w-3.5"/>, num: 'text-emerald-600', ic: 'bg-emerald-50 text-emerald-500'},
              { label: 'Overdue', val: stats.overdue,   icon: <AlertTriangle className="h-3.5 w-3.5"/>, num: 'text-rose-500',    ic: 'bg-rose-50 text-rose-400'      },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-md ${s.ic}`}>{s.icon}</div>
                <p className={`text-2xl font-bold tabular-nums ${s.num}`}>{s.val}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
 
          {/* Main grid */}
          <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
 
            {/* Add task */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">New Task</p>
 
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Title <span className="text-rose-400">*</span></label>
                    <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="What needs to be done?" className={inp} />
                  </div>
 
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details…" rows={2} className={`${inp} resize-none`} />
                  </div>
 
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">Due Date</label>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
                      <select value={priority} onChange={e => setPriority(e.target.value as TodoPriority)} className={inp}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
 
                  {/* Priority pills */}
                  <div className="flex gap-1.5">
                    {(['Low', 'Medium', 'High'] as TodoPriority[]).map(p => (
                      <button key={p} onClick={() => setPriority(p)}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${priority === p ? `${PC[p].badge} border-current` : 'border-slate-200 text-slate-400 hover:text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priority === p ? PC[p].dot : 'bg-slate-300'}`} />
                        {p}
                      </button>
                    ))}
                  </div>
 
                  <button onClick={handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 active:scale-[0.98]">
                    <Plus className="h-4 w-4" /> Add Task
                  </button>
                </div>
              </div>
 
              <div className="flex gap-2">
                <button onClick={clearDone} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-500 shadow-sm hover:border-emerald-200 hover:text-emerald-600">
                  <CheckCheck className="h-3.5 w-3.5" /> Clear Done
                </button>
                <button onClick={handleReset} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-500 shadow-sm hover:border-rose-200 hover:text-rose-500">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset All
                </button>
              </div>
            </div>
 
            {/* Task list */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tasks</p>
                <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {FILTERS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${filter === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
 
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                    <LayoutList className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No tasks</p>
                  <p className="mt-0.5 text-xs text-slate-400">{filter === 'all' ? 'Add your first task' : `No ${filter} tasks`}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(todo => {
                    const late = isOverdue(todo);
                    const pc   = PC[todo.priority];
                    return (
                      <div key={todo.id}
                        className={`group relative flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                          todo.completed ? 'border-slate-100 bg-slate-50/70'
                          : late ? 'border-rose-100 bg-rose-50/40 hover:border-rose-200'
                          : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/60 hover:shadow-sm'}`}>
 
                        {/* Priority bar */}
                        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${pc.bar} ${todo.completed ? 'opacity-25' : 'opacity-60'}`} />
 
                        {/* Toggle */}
                        <button onClick={() => toggle(todo.id)} className="mt-0.5 shrink-0">
                          {todo.completed
                            ? <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />
                            : <Circle       className="h-[18px] w-[18px] text-slate-300 transition hover:text-indigo-400" />}
                        </button>
 
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-sm font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{todo.title}</span>
                            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${pc.badge}`}>
                              <span className={`h-1 w-1 rounded-full ${pc.dot}`} />{todo.priority}
                            </span>
                            {late && (
                              <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                                <AlertTriangle className="h-2.5 w-2.5" /> Late
                              </span>
                            )}
                          </div>
                          {todo.notes   && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{todo.notes}</p>}
                          {todo.dueDate && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                              <CalendarDays className="h-3 w-3" />{fmtDate(todo.dueDate)}
                            </div>
                          )}
                        </div>
 
                        {/* Delete */}
                        <button onClick={() => handleDelete(todo.id, todo.title)}
                          className="shrink-0 rounded-lg p-1.5 text-rose-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
 
              {filtered.length > 0 && (
                <p className="mt-3 text-center text-[11px] text-slate-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
 
        </div>
      </div>
    </>
  );
}