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
} from 'lucide-react';

type TodoPriority = 'Low' | 'Medium' | 'High';
type TodoFilter = 'all' | 'High' | 'Medium' | 'Low';

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

const FILTERS: { key: TodoFilter; label: string; active: string }[] = [
  { key: 'all',    label: 'All',    active: 'bg-white text-slate-700 shadow-sm' },
  { key: 'High',   label: 'High',   active: 'bg-white text-rose-600 shadow-sm'  },
  { key: 'Medium', label: 'Medium', active: 'bg-white text-amber-600 shadow-sm' },
  { key: 'Low',    label: 'Low',    active: 'bg-white text-emerald-600 shadow-sm'},
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDue,   setEditDue]   = useState('');
  const [editPri,   setEditPri]   = useState<TodoPriority>('Medium');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(todos)); }, [storageKey, todos]);

  const isOverdue = (t: TodoItem) => {
    const d = t.dueDate ? new Date(t.dueDate).getTime() : null;
    return !!d && d < new Date().setHours(0, 0, 0, 0) && !t.completed;
  };

  const stats = {
  total: todos.length,
  high: todos.filter(t => t.priority === 'High').length,
  medium: todos.filter(t => t.priority === 'Medium').length,
  low: todos.filter(t => t.priority === 'Low').length,
};

   

  const filtered = todos.filter(t => {
    if (filter === 'High' || filter === 'Medium' || filter === 'Low') return t.priority === filter;
    return true;
  });

  const openEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditNotes(todo.notes);
    setEditDue(todo.dueDate);
    setEditPri(todo.priority);
  };

  const saveEdit = (id: string) => {
    const clean = editTitle.trim();
    if (!clean) return;
    setTodos(p => p.map(t => t.id === id ? { ...t, title: clean, notes: editNotes.trim(), dueDate: editDue, priority: editPri } : t));
    setEditingId(null);
  };

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

  const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <>
      <SEO title="Todo Center" description="Track tasks." />

      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="px-4 py-5 sm:px-6">

          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Todo Center</h1>
                <p className="text-sm text-slate-400">Welcome, <span className="font-semibold text-indigo-500">{userName}</span></p>
              </div>
            </div>
            
            
            </div>
          </div>

         {/* Compact Stats Row */}
<div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
  
  {/* Total */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-col md:items-start md:p-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <LayoutList className="h-4 w-4"/>
    </div>
    <div>
      <p className="text-lg font-bold leading-none text-slate-700 md:text-2xl">{stats.total}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
    </div>
  </div>

  {/* High */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-col md:items-start md:p-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
      <AlertTriangle className="h-4 w-4"/>
    </div>
    <div>
      <p className="text-lg font-bold leading-none text-rose-500 md:text-2xl">{stats.high}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">High</p>
    </div>
  </div>

  {/* Medium */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-col md:items-start md:p-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
      <Clock className="h-4 w-4"/>
    </div>
    <div>
      <p className="text-lg font-bold leading-none text-amber-600 md:text-2xl">{stats.medium}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Med</p>
    </div>
  </div>

  {/* Low */}
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-col md:items-start md:p-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
      <CheckCheck className="h-4 w-4"/>
    </div>
    <div>
      <p className="text-lg font-bold leading-none text-emerald-600 md:text-2xl">{stats.low}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Low</p>
    </div>
  </div>
</div>
          {/* Main grid */}
          <div className="grid gap-5 xl:grid-cols-[400px_1fr]">

            {/* Add task */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">New Task</p>

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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-600 active:scale-[0.98]">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tasks</p>
                <div className="flex w-full gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 sm:w-auto">
                  {FILTERS.map(({ key, label, active }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all sm:flex-none sm:px-3 sm:py-1 ${filter === key ? active : 'text-slate-500 hover:text-slate-700'}`}>
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
                        className={`relative rounded-xl border px-4 py-4 transition-all duration-200 ${
                          editingId === todo.id ? 'border-indigo-200 bg-indigo-50/40'
                          : todo.completed ? 'border-slate-100 bg-slate-50/70'
                          : late ? 'border-rose-100 bg-rose-50/40'
                          : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/60 hover:shadow-sm'}`}>

                        {/* Priority bar */}
                        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${pc.bar} ${todo.completed ? 'opacity-25' : 'opacity-60'}`} />

                        {editingId === todo.id ? (
                          /* ── Inline edit mode ── */
                          <div className="space-y-2">
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(todo.id); if (e.key === 'Escape') setEditingId(null); }}
                              autoFocus
                              className="w-full rounded-lg border border-indigo-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                            <textarea
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              placeholder="Notes…"
                              rows={2}
                              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                            <div className="flex gap-2">
                              <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-300" />
                              <select value={editPri} onChange={e => setEditPri(e.target.value as TodoPriority)}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-300">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div className="flex gap-2 pt-0.5">
                              <button onClick={() => saveEdit(todo.id)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-500 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600">
                                <Check className="h-3.5 w-3.5" /> Save
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
                                <X className="h-3.5 w-3.5" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── View mode ── */
                          <div className="group flex items-start gap-3">
                            {/* Toggle */}
                            <button onClick={() => toggle(todo.id)} className="mt-0.5 shrink-0">
                              {todo.completed
                                ? <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />
                                : <Circle       className="h-[18px] w-[18px] text-slate-300 transition hover:text-indigo-400" />}
                            </button>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-base font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{todo.title}</span>
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

                            {/* Actions */}
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button onClick={() => openEdit(todo)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDelete(todo.id, todo.title)}
                                className="rounded-lg p-1.5 text-rose-400">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
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
      
    </>
  );
}