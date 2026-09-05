const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { broadcast } = require('../websocket');

const router = express.Router();

// GET /api/data/export/json
router.get('/export/json', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos').all();
    const categories = db.prepare('SELECT * FROM categories').all();
    const tags = db.prepare('SELECT * FROM tags').all();
    const subtasks = db.prepare('SELECT * FROM subtasks').all();
    const todoTags = db.prepare('SELECT * FROM todo_tags').all();

    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      categories,
      tags,
      todos,
      subtasks,
      todoTags
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=todos-backup-${Date.now()}.json`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/data/export/csv
router.get('/export/csv', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
             c.name as category, t.is_pinned, t.estimated_minutes, t.created_at, t.completed_at
      FROM todos t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.created_at DESC
    `).all();

    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Category', 'Pinned', 'Est Minutes', 'Created At', 'Completed At'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.id}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.priority}"`,
        `"${r.due_date || ''}"`,
        `"${(r.category || '').replace(/"/g, '""')}"`,
        r.is_pinned ? 'Yes' : 'No',
        r.estimated_minutes || 0,
        `"${r.created_at}"`,
        `"${r.completed_at || ''}"`
      ];
      csvLines.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=todos-export-${Date.now()}.csv`);
    res.send(csvLines.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/data/import
router.post('/import', (req, res) => {
  try {
    const { categories, tags, todos, subtasks, todoTags } = req.body;

    if (!Array.isArray(todos)) {
      return res.status(400).json({ success: false, error: 'Invalid backup file format: missing todos array' });
    }

    const now = new Date().toISOString();

    // Import categories
    if (Array.isArray(categories)) {
      const insCat = db.prepare('INSERT OR REPLACE INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)');
      categories.forEach(c => insCat.run(c.id, c.name, c.color || '#6366f1', c.icon || 'folder', c.created_at || now));
    }

    // Import tags
    if (Array.isArray(tags)) {
      const insTag = db.prepare('INSERT OR REPLACE INTO tags (id, name, color) VALUES (?, ?, ?)');
      tags.forEach(t => insTag.run(t.id, t.name, t.color || '#64748b'));
    }

    // Import todos
    const insTodo = db.prepare(`
      INSERT OR REPLACE INTO todos (
        id, title, description, status, priority, due_date, category_id,
        is_pinned, order_index, estimated_minutes, created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    todos.forEach(t => {
      insTodo.run(
        t.id || crypto.randomUUID(),
        t.title,
        t.description || '',
        t.status || 'todo',
        t.priority || 'medium',
        t.due_date || null,
        t.category_id || null,
        t.is_pinned ? 1 : 0,
        t.order_index || 0,
        t.estimated_minutes || 0,
        t.created_at || now,
        t.updated_at || now,
        t.completed_at || null
      );
    });

    // Import subtasks
    if (Array.isArray(subtasks)) {
      const insSt = db.prepare('INSERT OR REPLACE INTO subtasks (id, todo_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      subtasks.forEach(st => insSt.run(st.id || crypto.randomUUID(), st.todo_id, st.title, st.is_completed ? 1 : 0, st.order_index || 0, st.created_at || now));
    }

    // Import todoTags
    if (Array.isArray(todoTags)) {
      const insRel = db.prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)');
      todoTags.forEach(rel => insRel.run(rel.todo_id, rel.tag_id));
    }

    broadcast('TODOS_IMPORTED', { count: todos.length });
    res.json({ success: true, message: `Successfully imported ${todos.length} tasks` });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
