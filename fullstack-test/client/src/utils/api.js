// API Client wrapper for TaskFlow
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Todos
  getTodos: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, v);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/todos${queryString}`);
  },
  getTodo: (id) => request(`/todos/${id}`),
  createTodo: (todoData) => request('/todos', { method: 'POST', body: JSON.stringify(todoData) }),
  updateTodo: (id, updates) => request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTodo: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
  duplicateTodo: (id) => request(`/todos/${id}/duplicate`, { method: 'POST' }),

  // Subtasks
  addSubtask: (todoId, title) => request(`/todos/${todoId}/subtasks`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateSubtask: (todoId, subtaskId, updates) => request(`/todos/${todoId}/subtasks/${subtaskId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteSubtask: (todoId, subtaskId) => request(`/todos/${todoId}/subtasks/${subtaskId}`, { method: 'DELETE' }),

  // Reorder & Bulk
  reorderTodos: (items) => request('/todos/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  bulkAction: (action, ids = []) => request('/todos/bulk', { method: 'POST', body: JSON.stringify({ action, ids }) }),

  // Categories & Tags
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  createTag: (data) => request('/categories/tags', { method: 'POST', body: JSON.stringify(data) }),

  // Stats
  getStats: () => request('/stats'),

  // Import
  importData: (backupData) => request('/data/import', { method: 'POST', body: JSON.stringify(backupData) }),
};
