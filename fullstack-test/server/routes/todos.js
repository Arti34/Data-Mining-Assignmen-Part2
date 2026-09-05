const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { broadcast } = require('../websocket');

const router = express.Router();

// Helper to fetch full todo object with subtasks & tags
function getFullTodo(id) {
  const todo = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM todos t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `).get(id);

  if (!todo) return null;

  const subtasks = db.prepare(`
    SELECT * FROM subtasks WHERE todo_id = ? ORDER BY order_index ASC, created_at ASC
  `).all(id);

  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN todo_tags tt ON t.id = tt.tag_id
    WHERE tt.todo_id = ?
  `).all(id);

  return {
    ...todo,
    is_pinned: Boolean(todo.is_pinned),
    subtasks: subtasks.map(st => ({ ...st, is_completed: Boolean(st.is_completed) })),
    tags
  };
}

// GET /api/todos
router.get('/', (req, res) => {
  try {
    const { status, priority, category_id, search, sort = 'order' } = req.query;

    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM todos t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (category_id && category_id !== 'all') {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (search && search.trim()) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Pinned items always stay at top, then sort
    switch (sort) {
      case 'due_date':
        query += ' ORDER BY t.is_pinned DESC, (t.due_date IS NULL) ASC, t.due_date ASC, t.order_index ASC';
        break;
      case 'priority':
        query += ` ORDER BY t.is_pinned DESC,
          CASE t.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END ASC, t.order_index ASC`;
        break;
      case 'created_at':
        query += ' ORDER BY t.is_pinned DESC, t.created_at DESC';
        break;
      case 'order':
      default:
        query += ' ORDER BY t.is_pinned DESC, t.order_index ASC, t.created_at DESC';
        break;
    }

    const todos = db.prepare(query).all(...params);

    // Hydrate subtasks and tags efficiently
    const allSubtasks = db.prepare('SELECT * FROM subtasks ORDER BY order_index ASC').all();
    const allTodoTags = db.prepare(`
      SELECT tt.todo_id, t.id, t.name, t.color
      FROM todo_tags tt
      JOIN tags t ON tt.tag_id = t.id
    `).all();

    const subtasksByTodo = {};
    for (const st of allSubtasks) {
      if (!subtasksByTodo[st.todo_id]) subtasksByTodo[st.todo_id] = [];
      subtasksByTodo[st.todo_id].push({ ...st, is_completed: Boolean(st.is_completed) });
    }

    const tagsByTodo = {};
    for (const tt of allTodoTags) {
      if (!tagsByTodo[tt.todo_id]) tagsByTodo[tt.todo_id] = [];
      tagsByTodo[tt.todo_id].push({ id: tt.id, name: tt.name, color: tt.color });
    }

    const result = todos.map(t => ({
      ...t,
      is_pinned: Boolean(t.is_pinned),
      subtasks: subtasksByTodo[t.id] || [],
      tags: tagsByTodo[t.id] || []
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/todos/:id
router.get('/:id', (req, res) => {
  try {
    const todo = getFullTodo(req.params.id);
    if (!todo) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: todo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos
router.post('/', (req, res) => {
  try {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      due_date = null,
      category_id = null,
      is_pinned = false,
      estimated_minutes = 0,
      subtasks = [],
      tags = []
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Determine highest order_index
    const maxOrderRow = db.prepare('SELECT MIN(order_index) as minOrder FROM todos').get();
    const orderIndex = maxOrderRow.minOrder != null ? maxOrderRow.minOrder - 1 : 0;

    const completedAt = status === 'completed' ? now : null;

    db.prepare(`
      INSERT INTO todos (
        id, title, description, status, priority, due_date, category_id,
        is_pinned, order_index, estimated_minutes, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title.trim(),
      description.trim(),
      status,
      priority,
      due_date || null,
      category_id || null,
      is_pinned ? 1 : 0,
      orderIndex,
      Number(estimated_minutes) || 0,
      now,
      now,
      completedAt
    );

    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const insertSt = db.prepare(`
        INSERT INTO subtasks (id, todo_id, title, is_completed, order_index, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      subtasks.forEach((st, idx) => {
        const titleText = typeof st === 'string' ? st : st.title;
        if (titleText && titleText.trim()) {
          insertSt.run(
            crypto.randomUUID(),
            id,
            titleText.trim(),
            st.is_completed ? 1 : 0,
            idx,
            now
          );
        }
      });
    }

    if (Array.isArray(tags) && tags.length > 0) {
      const insertTagRel = db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)');
      tags.forEach(tagId => {
        insertTagRel.run(id, tagId);
      });
    }

    const createdTodo = getFullTodo(id);
    broadcast('TODO_CREATED', createdTodo);
    res.status(201).json({ success: true, data: createdTodo });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/todos/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });

    const {
      title,
      description,
      status,
      priority,
      due_date,
      category_id,
      is_pinned,
      order_index,
      estimated_minutes,
      subtasks,
      tags
    } = req.body;

    const now = new Date().toISOString();
    let completedAt = existing.completed_at;

    if (status !== undefined) {
      if (status === 'completed' && existing.status !== 'completed') {
        completedAt = now;
      } else if (status !== 'completed' && existing.status === 'completed') {
        completedAt = null;
      }
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedStatus = status !== undefined ? status : existing.status;
    const updatedPriority = priority !== undefined ? priority : existing.priority;
    const updatedDueDate = due_date !== undefined ? (due_date || null) : existing.due_date;
    const updatedCategoryId = category_id !== undefined ? (category_id || null) : existing.category_id;
    const updatedPinned = is_pinned !== undefined ? (is_pinned ? 1 : 0) : existing.is_pinned;
    const updatedOrder = order_index !== undefined ? Number(order_index) : existing.order_index;
    const updatedEst = estimated_minutes !== undefined ? Number(estimated_minutes) : existing.estimated_minutes;

    db.prepare(`
      UPDATE todos SET
        title = ?, description = ?, status = ?, priority = ?, due_date = ?,
        category_id = ?, is_pinned = ?, order_index = ?, estimated_minutes = ?,
        updated_at = ?, completed_at = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedDesc,
      updatedStatus,
      updatedPriority,
      updatedDueDate,
      updatedCategoryId,
      updatedPinned,
      updatedOrder,
      updatedEst,
      now,
      completedAt,
      id
    );

    // If subtasks array is passed, update them
    if (Array.isArray(subtasks)) {
      db.prepare('DELETE FROM subtasks WHERE todo_id = ?').run(id);
      const insertSt = db.prepare(`
        INSERT INTO subtasks (id, todo_id, title, is_completed, order_index, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      subtasks.forEach((st, idx) => {
        const titleText = typeof st === 'string' ? st : st.title;
        if (titleText && titleText.trim()) {
          insertSt.run(
            st.id || crypto.randomUUID(),
            id,
            titleText.trim(),
            st.is_completed ? 1 : 0,
            idx,
            now
          );
        }
      });
    }

    // If tags array is passed, update associations
    if (Array.isArray(tags)) {
      db.prepare('DELETE FROM todo_tags WHERE todo_id = ?').run(id);
      const insertTagRel = db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)');
      tags.forEach(t => {
        const tagId = typeof t === 'object' ? t.id : t;
        insertTagRel.run(id, tagId);
      });
    }

    const updatedTodo = getFullTodo(id);
    broadcast('TODO_UPDATED', updatedTodo);
    res.json({ success: true, data: updatedTodo });
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    broadcast('TODO_DELETED', { id });
    res.json({ success: true, message: 'Task deleted successfully', id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  try {
    const original = getFullTodo(req.params.id);
    if (!original) return res.status(404).json({ success: false, error: 'Task not found' });

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO todos (
        id, title, description, status, priority, due_date, category_id,
        is_pinned, order_index, estimated_minutes, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      `${original.title} (Copy)`,
      original.description,
      'todo',
      original.priority,
      original.due_date,
      original.category_id,
      original.is_pinned ? 1 : 0,
      original.order_index - 1,
      original.estimated_minutes,
      now,
      now,
      null
    );

    const insertSt = db.prepare(`
      INSERT INTO subtasks (id, todo_id, title, is_completed, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    original.subtasks.forEach((st, idx) => {
      insertSt.run(crypto.randomUUID(), newId, st.title, 0, idx, now);
    });

    const insertTag = db.prepare('INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)');
    original.tags.forEach(t => {
      insertTag.run(newId, t.id);
    });

    const duplicated = getFullTodo(newId);
    broadcast('TODO_CREATED', duplicated);
    res.status(201).json({ success: true, data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/:id/subtasks
router.post('/:id/subtasks', (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: 'Title required' });

    const subtaskId = crypto.randomUUID();
    const now = new Date().toISOString();
    const maxIdx = db.prepare('SELECT MAX(order_index) as maxIdx FROM subtasks WHERE todo_id = ?').get(id).maxIdx || 0;

    db.prepare(`
      INSERT INTO subtasks (id, todo_id, title, is_completed, order_index, created_at)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(subtaskId, id, title.trim(), maxIdx + 1, now);

    const updated = getFullTodo(id);
    broadcast('TODO_UPDATED', updated);
    res.status(201).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/todos/:id/subtasks/:subtaskId
router.put('/:id/subtasks/:subtaskId', (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    const { is_completed, title } = req.body;

    if (is_completed !== undefined) {
      db.prepare('UPDATE subtasks SET is_completed = ? WHERE id = ? AND todo_id = ?').run(
        is_completed ? 1 : 0, subtaskId, id
      );
    }
    if (title !== undefined && title.trim()) {
      db.prepare('UPDATE subtasks SET title = ? WHERE id = ? AND todo_id = ?').run(
        title.trim(), subtaskId, id
      );
    }

    const updated = getFullTodo(id);
    broadcast('TODO_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/todos/:id/subtasks/:subtaskId
router.delete('/:id/subtasks/:subtaskId', (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    db.prepare('DELETE FROM subtasks WHERE id = ? AND todo_id = ?').run(subtaskId, id);
    const updated = getFullTodo(id);
    broadcast('TODO_UPDATED', updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/reorder (Batch updates order/status for Kanban/List drag-drop)
router.post('/reorder', (req, res) => {
  try {
    const { items } = req.body; // array of { id, order_index, status }
    if (!Array.isArray(items)) return res.status(400).json({ success: false, error: 'Items must be an array' });

    const updateStmt = db.prepare(`
      UPDATE todos SET order_index = ?, status = COALESCE(?, status), updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    for (const item of items) {
      updateStmt.run(item.order_index, item.status || null, now, item.id);
    }

    broadcast('TODOS_REORDERED', { items });
    res.json({ success: true, message: 'Tasks reordered' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/todos/bulk (Bulk actions: complete_all, delete_completed)
router.post('/bulk', (req, res) => {
  try {
    const { action, ids } = req.body;
    const now = new Date().toISOString();

    if (action === 'complete_all') {
      db.prepare("UPDATE todos SET status = 'completed', completed_at = ?, updated_at = ? WHERE status != 'completed'").run(now, now);
      broadcast('TODOS_BULK_UPDATED', { action });
      return res.json({ success: true, message: 'All tasks marked complete' });
    }

    if (action === 'delete_completed') {
      db.prepare("DELETE FROM todos WHERE status = 'completed'").run();
      broadcast('TODOS_BULK_UPDATED', { action });
      return res.json({ success: true, message: 'Completed tasks cleared' });
    }

    if (action === 'delete_selected' && Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`DELETE FROM todos WHERE id IN (${placeholders})`).run(...ids);
      broadcast('TODOS_BULK_UPDATED', { action, ids });
      return res.json({ success: true, message: 'Selected tasks deleted' });
    }

    res.status(400).json({ success: false, error: 'Unknown bulk action' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
