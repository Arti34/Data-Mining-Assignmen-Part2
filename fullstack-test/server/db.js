const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'todos.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency and enable foreign key enforcement
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'folder',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#64748b'
  );

  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS todo_tags (
    todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (todo_id, tag_id)
  );

  CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
  CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
  CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category_id);
  CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(order_index);
  CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
  CREATE INDEX IF NOT EXISTS idx_subtasks_todo ON subtasks(todo_id);
`);

// Seed default data if empty
const countTodos = db.prepare('SELECT COUNT(*) as count FROM todos').get().count;

if (countTodos === 0) {
  console.log('Seeding initial categories, tags, and tasks...');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Seed Categories
  const categories = [
    { id: 'cat-work', name: 'Work & Projects', color: '#6366f1', icon: 'briefcase' },
    { id: 'cat-personal', name: 'Personal Life', color: '#10b981', icon: 'user' },
    { id: 'cat-health', name: 'Health & Fitness', color: '#f43f5e', icon: 'heart' },
    { id: 'cat-learning', name: 'Learning & Growth', color: '#f59e0b', icon: 'book-open' },
  ];

  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.color, c.icon, now.toISOString());
  }

  // Seed Tags
  const tags = [
    { id: 'tag-1', name: 'High-Impact', color: '#ef4444' },
    { id: 'tag-2', name: 'Frontend', color: '#3b82f6' },
    { id: 'tag-3', name: 'Backend', color: '#8b5cf6' },
    { id: 'tag-4', name: 'Habit', color: '#10b981' },
    { id: 'tag-5', name: 'Quick-Win', color: '#06b6d4' },
  ];

  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (id, name, color) VALUES (?, ?, ?)');
  for (const t of tags) {
    insertTag.run(t.id, t.name, t.color);
  }

  // Seed Todos
  const seedTasks = [
    {
      id: crypto.randomUUID(),
      title: 'Review System Architecture & Sprint Goals',
      description: 'Audit microservice boundaries and sync with the core engineering leads.',
      status: 'in_progress',
      priority: 'urgent',
      due_date: todayStr,
      category_id: 'cat-work',
      is_pinned: 1,
      order_index: 0,
      estimated_minutes: 45,
      subtasks: [
        { title: 'Check database WAL mode and migration logs', completed: 1 },
        { title: 'Review API contract schemas for v2 release', completed: 1 },
        { title: 'Write sprint review summary memo', completed: 0 }
      ],
      tags: ['tag-1', 'tag-3']
    },
    {
      id: crypto.randomUUID(),
      title: 'Design Dark Mode Design Tokens & Polish UI',
      description: 'Ensure AAA color contrast compliance and seamless glassmorphic shadows across all panels.',
      status: 'todo',
      priority: 'high',
      due_date: todayStr,
      category_id: 'cat-work',
      is_pinned: 1,
      order_index: 1,
      estimated_minutes: 60,
      subtasks: [
        { title: 'Test Radix/Tailwind CSS slate palette', completed: 1 },
        { title: 'Add keyboard shortcut command palette (Ctrl+K)', completed: 0 },
        { title: 'Verify mobile tap targets meet 48px standard', completed: 0 }
      ],
      tags: ['tag-2', 'tag-5']
    },
    {
      id: crypto.randomUUID(),
      title: '5km Morning Run & Mobility Workout',
      description: 'Maintain 5:20/km pace followed by 15 mins hamstring and shoulder stretches.',
      status: 'completed',
      priority: 'medium',
      due_date: todayStr,
      category_id: 'cat-health',
      is_pinned: 0,
      order_index: 2,
      estimated_minutes: 35,
      completed_at: now.toISOString(),
      subtasks: [
        { title: 'Hydration and pre-run warmup', completed: 1 },
        { title: '5km outdoor run tracking on GPS', completed: 1 },
        { title: 'Mobility cooldown routine', completed: 1 }
      ],
      tags: ['tag-4']
    },
    {
      id: crypto.randomUUID(),
      title: 'Read Chapters 4-6 of "Designing Data-Intensive Applications"',
      description: 'Focus on replication logs, leader-follower consensus, and conflict resolution.',
      status: 'todo',
      priority: 'medium',
      due_date: tomorrow,
      category_id: 'cat-learning',
      is_pinned: 0,
      order_index: 3,
      estimated_minutes: 90,
      subtasks: [
        { title: 'Read Chapter 4: Encoding and Evolution', completed: 1 },
        { title: 'Read Chapter 5: Replication', completed: 0 },
        { title: 'Summarize key takeaways in Obsidian', completed: 0 }
      ],
      tags: ['tag-3']
    },
    {
      id: crypto.randomUUID(),
      title: 'Plan Weekend Trip & Grocery Essentials',
      description: 'Pick up seasonal fresh produce and organic whole beans from the farmer market.',
      status: 'todo',
      priority: 'low',
      due_date: nextWeek,
      category_id: 'cat-personal',
      is_pinned: 0,
      order_index: 4,
      estimated_minutes: 30,
      subtasks: [
        { title: 'Check pantry inventory', completed: 0 },
        { title: 'Book train tickets for Saturday', completed: 0 }
      ],
      tags: ['tag-5']
    }
  ];

  const insertTodo = db.prepare(`
    INSERT INTO todos (
      id, title, description, status, priority, due_date, category_id,
      is_pinned, order_index, estimated_minutes, created_at, updated_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSubtask = db.prepare(`
    INSERT INTO subtasks (id, todo_id, title, is_completed, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertTodoTag = db.prepare(`
    INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)
  `);

  for (const task of seedTasks) {
    insertTodo.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.due_date,
      task.category_id,
      task.is_pinned,
      task.order_index,
      task.estimated_minutes,
      now.toISOString(),
      now.toISOString(),
      task.completed_at || null
    );

    if (task.subtasks) {
      task.subtasks.forEach((st, idx) => {
        insertSubtask.run(crypto.randomUUID(), task.id, st.title, st.completed, idx, now.toISOString());
      });
    }

    if (task.tags) {
      task.tags.forEach((tagId) => {
        insertTodoTag.run(task.id, tagId);
      });
    }
  }
  console.log('Seeding complete.');
}

module.exports = db;
