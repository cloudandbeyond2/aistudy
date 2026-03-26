import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SEO from '@/components/SEO';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Filter,
  Flag,
  ListTodo,
  Plus,
  RotateCcw,
  Clock,
  Sparkles,
  Trash2,
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

const TodoCenter = () => {
  const navigate = useNavigate();
  const storageKey = getStorageKey();
  const role = (sessionStorage.getItem('role') || 'user').toLowerCase();
  const userName = sessionStorage.getItem('mName') || 'Learner';
  const [todos, setTodos] = useState<TodoItem[]>(() => readTodos(storageKey));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('Medium');
  const [filter, setFilter] = useState<TodoFilter>('all');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [storageKey, todos]);

  const addTodo = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const nextTodo: TodoItem = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: cleanTitle,
      notes: notes.trim(),
      dueDate,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [nextTodo, ...prev]);
    setTitle('');
    setNotes('');
    setDueDate('');
    setPriority('Medium');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const resetAll = () => {
    setTodos([]);
  };

  const filteredTodos = todos.filter((todo) => {
    const dueTime = todo.dueDate ? new Date(todo.dueDate).getTime() : null;
    const isOverdue = dueTime ? dueTime < new Date().setHours(0, 0, 0, 0) && !todo.completed : false;

    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'overdue') return isOverdue;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    pending: todos.filter((todo) => !todo.completed).length,
    overdue: todos.filter((todo) => {
      const dueTime = todo.dueDate ? new Date(todo.dueDate).getTime() : null;
      return !!dueTime && dueTime < new Date().setHours(0, 0, 0, 0) && !todo.completed;
    }).length,
  };

  const roleLabel =
    role === 'student' ? 'Student Panel' : role === 'dept_admin' ? 'Staff Panel' : 'User Panel';

  const priorityTone = (value: TodoPriority) => {
    if (value === 'High') return 'bg-rose-500/10 text-rose-700 border-rose-200';
    if (value === 'Medium') return 'bg-amber-500/10 text-amber-700 border-amber-200';
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
      <SEO title="Todo Center" description="Track personal, learning, and work tasks from one place." />

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-cyan-500/10 p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Shared task workflow
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Todo Center</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Keep study tasks, support follow-ups, and daily priorities in one place for {userName} in the {roleLabel.toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary"
              onClick={addTodo}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Todo
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.total}</span>
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Pending</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.pending}</span>
              <Circle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Completed</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.completed}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Overdue</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.overdue}</span>
              <Flag className="h-5 w-5 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Add Task</CardTitle>
            <CardDescription>Capture a task and keep it tied to the current role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish assignment draft" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context, links, or follow-up details."
                className="min-h-28"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TodoPriority)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <Button
              onClick={addTodo}
              className="w-full bg-gradient-to-r from-primary to-indigo-500 text-white hover:from-indigo-500 hover:to-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Save Task
            </Button>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Completed
              </Button>
              <Button variant="outline" size="sm" onClick={resetAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Task List</CardTitle>
              <CardDescription>Manage the current to-do queue.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'completed', 'overdue'] as TodoFilter[]).map((value) => (
                <Button
                  key={value}
                  variant={filter === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(value)}
                >
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => {
                const isOverdue = !!todo.dueDate && new Date(todo.dueDate).getTime() < new Date().setHours(0, 0, 0, 0) && !todo.completed;

                return (
                  <div
                    key={todo.id}
                    className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm transition hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="mt-1 rounded-full p-0.5 text-muted-foreground transition hover:text-primary"
                        aria-label={todo.completed ? 'Mark as pending' : 'Mark as complete'}
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`font-medium ${todo.completed ? 'text-muted-foreground line-through' : ''}`}>
                            {todo.title}
                          </p>
                          <Badge className={`border ${priorityTone(todo.priority)}`}>{todo.priority}</Badge>
                          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                        </div>

                        {todo.notes && (
                          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{todo.notes}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {todo.dueDate && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Added {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTodo(todo.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
                <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a task for this {roleLabel.toLowerCase()} to start tracking work.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodoCenter;
