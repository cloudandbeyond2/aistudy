import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useTodoCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodoCount = async () => {
      const uid = sessionStorage.getItem('uid') || 'guest';
      const role = sessionStorage.getItem('role') || 'user';
      
      try {
        const response = await fetch(`${API_BASE_URL}/todos?uid=${uid}&role=${role}`);
        const data = await response.json();
        const todos = data.data || [];
        const pending = todos.filter((todo: any) => !todo.completed).length;
        setPendingCount(pending);
      } catch (error) {
        console.error('Error fetching todo count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodoCount();
    
    // Optional: Set up polling to update count every 30 seconds
    const interval = setInterval(fetchTodoCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { pendingCount, loading };
};