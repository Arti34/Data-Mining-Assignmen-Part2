import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { triggerConfetti } from '../utils/confetti';

export function useTodos(sound) {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category_id: 'all',
    search: '',
    sort: 'order'
  });

  const wsRef = useRef(null);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  // Add toast helper
  const addToast = useCallback((message, type = 'info', action = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type, action, duration: action ? 6000 : 3500 }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch todos with current filters
  const fetchTodos = useCallback(async (customFilters = null) => {
    try {
      const activeFilters = customFilters || filters;
      const res = await api.getTodos(activeFilters);
      if (res.success) {
        setTodos(res.data);
      }
    } catch (err) {
      console.error('Failed to load todos:', err);
      addToast('Failed to sync tasks with server', 'error');
    }
  }, [filters, addToast]);

  // Fetch categories, tags, and stats
  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, statsRes] = await Promise.all([
        api.getCategories(),
        api.getStats()
      ]);
      if (catRes.success) {
        setCategories(catRes.categories || []);
        setTags(catRes.tags || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTodos(), fetchMeta()]).finally(() => setLoading(false));
  }, [filters, fetchTodos, fetchMeta]);

  // WebSocket Live Sync
  useEffect(() => {
    let socket = null;
    let reconnectTimer = null;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          switch (type) {
            case 'TODO_CREATED':
              setTodos(prev => {
                const exists = prev.some(t => t.id === data.id);
                if (exists) return prev;
                return [data, ...prev];
              });
              fetchMeta();
              break;

            case 'TODO_UPDATED':
              setTodos(prev => prev.map(t => (t.id === data.id ? data : t)));
              fetchMeta();
              break;

            case 'TODO_DELETED':
              setTodos(prev => prev.filter(t => t.id !== data.id));
              fetchMeta();
              break;

            case 'TODOS_REORDERED':
            case 'TODOS_BULK_UPDATED':
            case 'TODOS_IMPORTED':
              fetchTodos();
              fetchMeta();
              break;

            case 'CATEGORY_CREATED':
              fetchMeta();
              break;

            case 'TAG_CREATED':
              fetchMeta();
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        setWsConnected(false);
      };
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, [fetchTodos, fetchMeta]);

  // Action: Toggle task completion status
  const toggleTodoStatus = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
    const isNowCompleted = newStatus === 'completed';

    // Optimistic update
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));

    if (isNowCompleted) {
      soundRef.current?.playComplete();
      // Check if all tasks completed for confetti
      const remaining = todos.filter(t => t.id !== id && t.status !== 'completed');
      if (remaining.length === 0) {
        triggerConfetti();
      }
    }

    try {
      await api.updateTodo(id, { status: newStatus });
      fetchMeta();
    } catch (err) {
      // Rollback
      setTodos(prev => prev.map(t => (t.id === id ? todo : t)));
      addToast('Failed to update task status', 'error');
    }
  }, [todos, fetchMeta, addToast]);

  // Action: Create task
  const createTodo = useCallback(async (data) => {
    soundRef.current?.playPop();
    try {
      const res = await api.createTodo(data);
      if (res.success) {
        setTodos(prev => [res.data, ...prev]);
        fetchMeta();
        addToast('Task created successfully', 'success');
        return res.data;
      }
    } catch (err) {
      addToast(err.message || 'Error creating task', 'error');
      throw err;
    }
  }, [fetchMeta, addToast]);

  // Action: Update task
  const updateTodo = useCallback(async (id, updates) => {
    const original = todos.find(t => t.id === id);
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    try {
      const res = await api.updateTodo(id, updates);
      if (res.success) {
        setTodos(prev => prev.map(t => (t.id === id ? res.data : t)));
        fetchMeta();
        addToast('Task updated', 'success');
        return res.data;
      }
    } catch (err) {
      if (original) {
        setTodos(prev => prev.map(t => (t.id === id ? original : t)));
      }
      addToast(err.message || 'Error updating task', 'error');
      throw err;
    }
  }, [todos, fetchMeta, addToast]);

  // Action: Delete task with Undo option
  const deleteTodo = useCallback(async (id) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    // Optimistic deletion
    setTodos(prev => prev.filter(t => t.id !== id));

    let undone = false;
    const timeout = setTimeout(async () => {
      if (!undone) {
        try {
          await api.deleteTodo(id);
          fetchMeta();
        } catch (err) {
          console.error('Delete failed:', err);
          // Restore if server delete failed
          setTodos(prev => [...prev, todoToDelete]);
        }
      }
    }, 5000);

    addToast(
      `Deleted "${todoToDelete.title.substring(0, 24)}${todoToDelete.title.length > 24 ? '...' : ''}"`,
      'info',
      {
        label: 'Undo',
        onClick: () => {
          undone = true;
          clearTimeout(timeout);
          setTodos(prev => [todoToDelete, ...prev]);
          addToast('Task restored', 'success');
        }
      }
    );
  }, [todos, fetchMeta, addToast]);

  // Action: Duplicate task
  const duplicateTodo = useCallback(async (id) => {
    try {
      const res = await api.duplicateTodo(id);
      if (res.success) {
        setTodos(prev => [res.data, ...prev]);
        fetchMeta();
        soundRef.current?.playPop();
        addToast('Task duplicated', 'success');
      }
    } catch (err) {
      addToast('Failed to duplicate task', 'error');
    }
  }, [fetchMeta, addToast]);

  // Action: Toggle Pin/Star
  const togglePin = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newPinned = !todo.is_pinned;

    setTodos(prev => prev.map(t => (t.id === id ? { ...t, is_pinned: newPinned } : t)));
    try {
      await api.updateTodo(id, { is_pinned: newPinned });
      fetchMeta();
    } catch (err) {
      setTodos(prev => prev.map(t => (t.id === id ? todo : t)));
      addToast('Failed to pin task', 'error');
    }
  }, [todos, fetchMeta, addToast]);

  // Action: Subtasks
  const addSubtask = useCallback(async (todoId, title) => {
    try {
      const res = await api.addSubtask(todoId, title);
      if (res.success) {
        setTodos(prev => prev.map(t => (t.id === todoId ? res.data : t)));
      }
    } catch (err) {
      addToast('Failed to add subtask', 'error');
    }
  }, [addToast]);

  const toggleSubtask = useCallback(async (todoId, subtaskId, isCompleted) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== todoId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, is_completed: isCompleted } : st)
      };
    }));

    if (isCompleted) soundRef.current?.playComplete();

    try {
      const res = await api.updateSubtask(todoId, subtaskId, { is_completed: isCompleted });
      if (res.success) {
        setTodos(prev => prev.map(t => (t.id === todoId ? res.data : t)));
      }
    } catch (err) {
      fetchTodos();
      addToast('Failed to update subtask', 'error');
    }
  }, [fetchTodos, addToast]);

  const deleteSubtask = useCallback(async (todoId, subtaskId) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== todoId) return t;
      return {
        ...t,
        subtasks: t.subtasks.filter(st => st.id !== subtaskId)
      };
    }));

    try {
      const res = await api.deleteSubtask(todoId, subtaskId);
      if (res.success) {
        setTodos(prev => prev.map(t => (t.id === todoId ? res.data : t)));
      }
    } catch (err) {
      fetchTodos();
      addToast('Failed to delete subtask', 'error');
    }
  }, [fetchTodos, addToast]);

  // Action: Reorder tasks
  const reorderTodos = useCallback(async (newTodos) => {
    setTodos(newTodos);
    const payload = newTodos.map((t, idx) => ({
      id: t.id,
      order_index: idx,
      status: t.status
    }));

    try {
      await api.reorderTodos(payload);
    } catch (err) {
      fetchTodos();
      addToast('Failed to save task order', 'error');
    }
  }, [fetchTodos, addToast]);

  // Action: Bulk
  const bulkAction = useCallback(async (action, ids = []) => {
    try {
      const res = await api.bulkAction(action, ids);
      if (res.success) {
        addToast(res.message, 'success');
        fetchTodos();
        fetchMeta();
        if (action === 'complete_all') {
          soundRef.current?.playComplete();
          triggerConfetti();
        }
      }
    } catch (err) {
      addToast('Bulk action failed', 'error');
    }
  }, [fetchTodos, fetchMeta, addToast]);

  return {
    todos,
    categories,
    tags,
    stats,
    loading,
    wsConnected,
    toasts,
    removeToast,
    addToast,
    filters,
    setFilters,
    fetchTodos,
    toggleTodoStatus,
    createTodo,
    updateTodo,
    deleteTodo,
    duplicateTodo,
    togglePin,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTodos,
    bulkAction
  };
}
