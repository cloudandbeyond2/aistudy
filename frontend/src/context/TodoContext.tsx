import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.colossusiq.ai/api';

interface TodoContextType {
  pendingCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  totalCount: number;
  loading: boolean;
  refreshTodoCount: () => Promise<void>;
  updateTodoCount: (action: 'add' | 'delete' | 'toggle' | 'clear' | 'reset') => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Helper function to check if a task is upcoming (future due date, not completed)
const isUpcoming = (todo: any) => {
  if (todo.completed) return false;
  if (!todo.dueDate) return false;
  const dueDate = new Date(todo.dueDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return dueDate >= today;
};

// Helper function to check if a task is overdue
const isOverdue = (todo: any) => {
  if (todo.completed) return false;
  if (!todo.dueDate) return false;
  const dueDate = new Date(todo.dueDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodoCount = useCallback(async () => {
    const uid = sessionStorage.getItem('uid') || 'guest';
    const role = sessionStorage.getItem('role') || 'user';
    
    try {
      const response = await fetch(`${API_BASE_URL}/todos?uid=${uid}&role=${role}`);
      const data = await response.json();
      const todos = data.data || [];
      
      const pending = todos.filter((todo: any) => !todo.completed).length;
      const upcoming = todos.filter((todo: any) => isUpcoming(todo)).length;
      const overdue = todos.filter((todo: any) => isOverdue(todo)).length;
      const completed = todos.filter((todo: any) => todo.completed).length;
      
      setPendingCount(pending);
      setUpcomingCount(upcoming);
      setOverdueCount(overdue);
      setCompletedCount(completed);
      setTotalCount(todos.length);
    } catch (error) {
      console.error('Error fetching todo count:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic updates for instant UI feedback
  const updateTodoCount = useCallback((action: 'add' | 'delete' | 'toggle' | 'clear' | 'reset') => {
    switch (action) {
      case 'add':
        setPendingCount(prev => prev + 1);
        setTotalCount(prev => prev + 1);
        break;
      case 'delete':
        setPendingCount(prev => Math.max(0, prev - 1));
        setTotalCount(prev => Math.max(0, prev - 1));
        break;
      case 'toggle':
        // Refresh to get accurate counts
        fetchTodoCount();
        break;
      case 'clear':
      case 'reset':
        setPendingCount(0);
        setUpcomingCount(0);
        setOverdueCount(0);
        setCompletedCount(0);
        setTotalCount(0);
        break;
    }
  }, [fetchTodoCount]);

  // Initial fetch
  useEffect(() => {
    fetchTodoCount();
    
    // Polling fallback (every 30 seconds)
    const interval = setInterval(fetchTodoCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTodoCount]);

  return (
    <TodoContext.Provider value={{ 
      pendingCount,
      upcomingCount,
      overdueCount,
      completedCount,
      totalCount,
      loading, 
      refreshTodoCount: fetchTodoCount,
      updateTodoCount 
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider');
  }
  return context;
};