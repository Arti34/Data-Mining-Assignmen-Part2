const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { broadcast } = require('../websocket');

const router = express.Router();

// GET /api/categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(t.id) as task_count
      FROM categories c
      LEFT JOIN todos t ON c.id = t.category_id AND t.status != 'completed'
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    const tags = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();

    res.json({ success: true, categories, tags });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories
router.post('/', (req, res) => {
  try {
    const { name, color = '#6366f1', icon = 'folder' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Name is required' });

    const id = `cat-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO categories (id, name, color, icon, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), color, icon, now);

    const created = { id, name: name.trim(), color, icon, created_at: now, task_count: 0 };
    broadcast('CATEGORY_CREATED', created);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories/tags
router.post('/tags', (req, res) => {
  try {
    const { name, color = '#64748b' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Tag name is required' });

    const id = `tag-${crypto.randomBytes(4).toString('hex')}`;
    db.prepare('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)').run(id, name.trim(), color);

    const created = { id, name: name.trim(), color };
    broadcast('TAG_CREATED', created);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
