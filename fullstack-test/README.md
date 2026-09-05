# TaskFlow — Modern End-to-End Dynamic Todo Application

A high-performance, dynamic full-stack Todo & Productivity platform built with **React**, **Tailwind CSS**, **Node.js**, **Native SQLite**, and **Real-Time WebSockets**.

Inspired by the polished interactions of **Linear**, **Things 3**, and **Notion**.

---

## ✨ Features & UX Highlights

### 1. Dual Views & Analytics
- **List View**: Grouped by Pinned Focus and active tasks, equipped with smooth drag-and-drop manual reordering.
- **Kanban Board**: Three interactive status columns (*To Do*, *In Progress*, *Completed*) with drag-and-drop card status updates.
- **Productivity Insights**: Real-time completion rate, consecutive streak counter (🔥), planned focus time vs. completed hours, category breakdown, and priority workload distribution.

### 2. Rich Task Capabilities
- **Priority Levels**: Urgent 🔴 (pulse indicator), High 🟠, Medium 🟡, and Low 🟢.
- **Due Date Badging**: Smart relative badges (*Overdue* with warning styling, *Today*, *Tomorrow*, or scheduled date).
- **Interactive Checklists**: Nested subtasks with mini progress bars and inline toggle capability.
- **Color-Coded Categories & Tags**: Work, Personal, Health, Learning with custom color tokens.
- **Quick Actions**: One-click Pin/Star, Duplicate, Edit, and Delete with a 5-second **Undo** grace window.

### 3. Power-User Polish & Micro-Interactions
- **Command Palette (`Ctrl+K` or `Cmd+K`)**: Fast Spotlight-style search to jump between views, toggle themes, create tasks, or run bulk actions.
- **Sound Effects (Web Audio API)**: Synthesized musical chords on task completion (customizable & toggleable, zero external audio assets).
- **Celebration Confetti**: Physics-based canvas confetti burst on task completion milestones.
- **Global Keyboard Shortcuts**:
  - `N` → Open new task modal
  - `Ctrl + K` / `Cmd + K` → Open Command Palette
  - `/` → Quick search
  - `1`, `2`, `3` → Switch between List, Board, and Insights views
  - `D` → Toggle Dark / Light mode
  - `?` → Open Keyboard Shortcuts cheat sheet
  - `Esc` → Close modals and clear active inputs
  - `Ctrl + Enter` → Save task from modal

### 4. Robust Full-Stack Architecture
- **Zero-Dependency Native SQLite**: Built directly on Node.js's built-in `node:sqlite` (`DatabaseSync`) engine with **WAL (Write-Ahead Logging)** mode for lightning fast concurrent operations.
- **Live Multi-Tab Sync (WebSockets)**: All state changes (task additions, status toggles, edits, deletions, reorders) instantly broadcast across all connected browsers and tabs.
- **Data Mobility**: 1-click **Export to CSV** for spreadsheets and **Export/Import JSON** for complete database backups.
- **Unified Deployment**: A single Node.js process serves the REST API, WebSocket hub, and optimized React SPA on `http://localhost:3000`.

---

## 🚀 Quick Start

### 1. Unified Launch (Production Mode)
```bash
# Start unified server (Port 3000)
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 2. Live Development Mode (Vite HMR)
```bash
npm run dev
```
- Frontend: **[http://localhost:5173](http://localhost:5173)**
- Backend API: **[http://localhost:3000](http://localhost:3000)**

### 3. Run Automated Tests
```bash
npm test
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server uptime and health check |
| `GET` | `/api/todos` | List all tasks (supports `status`, `priority`, `category_id`, `search`, `sort`) |
| `POST` | `/api/todos` | Create a new task with subtasks & tags |
| `GET` | `/api/todos/:id` | Get single task details |
| `PUT` | `/api/todos/:id` | Update task properties or completion status |
| `DELETE` | `/api/todos/:id` | Delete task (cascades subtasks & tags) |
| `POST` | `/api/todos/:id/duplicate` | Duplicate an existing task |
| `POST` | `/api/todos/reorder` | Batch reorder tasks |
| `POST` | `/api/todos/bulk` | Bulk actions (`complete_all`, `delete_completed`) |
| `GET` | `/api/categories` | Retrieve all categories and tags |
| `GET` | `/api/stats` | Productivity metrics and streak analytics |
| `GET` | `/api/data/export/csv` | Download tasks in CSV format |
| `GET` | `/api/data/export/json` | Download complete database backup in JSON |
| `POST` | `/api/data/import` | Restore database from JSON backup |
| `WS` | `/ws` | Real-time WebSocket event subscription |

---

## 📁 Project Structure

```
fullstack-test/
├── package.json               # Root scripts & dependencies
├── README.md                  # Documentation & API reference
├── data/
│   └── todos.db               # SQLite database file (WAL mode)
├── scripts/
│   └── dev.js                 # Concurrent dev runner
├── server/
│   ├── index.js               # Express + WebSocket + Static file server
│   ├── db.js                  # SQLite schema, indices & seed data
│   ├── websocket.js           # WebSocket broadcasting hub
│   ├── test.js                # Automated backend test suite
│   └── routes/
│       ├── todos.js           # Task CRUD & reorder routes
│       ├── categories.js      # Categories & tags routes
│       ├── stats.js           # Productivity analytics routes
│       └── data.js            # Export (CSV, JSON) and Import routes
└── client/
    ├── package.json           # Client dependencies (React, Vite, Tailwind)
    ├── vite.config.js         # Vite configuration with API & WS proxy
    ├── tailwind.config.js     # Tailwind CSS theme configuration
    ├── index.html             # HTML entry point with theme initializer
    └── src/
        ├── main.jsx           # React DOM root
        ├── App.jsx            # Main app container & shortcut bindings
        ├── index.css          # Tailwind CSS & glassmorphic utilities
        ├── components/
        │   ├── Navbar.jsx
        │   ├── FilterBar.jsx
        │   ├── TaskItem.jsx
        │   ├── ListView.jsx
        │   ├── KanbanView.jsx
        │   ├── AnalyticsView.jsx
        │   ├── TaskModal.jsx
        │   ├── CommandPalette.jsx
        │   ├── KeyboardModal.jsx
        │   └── ToastContainer.jsx
        ├── hooks/
        │   ├── useTodos.js    # State management, optimistic UI & WS sync
        │   ├── useSound.js    # Web Audio synthetic chime synthesizer
        │   └── useKeyboard.js # Global keyboard shortcuts
        └── utils/
            ├── api.js         # Fetch client wrapper
            └── confetti.js    # Particle confetti celebration
```
