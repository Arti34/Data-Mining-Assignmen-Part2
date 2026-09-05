const express = require('express');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const cors = require('cors');

const { initWebSocket } = require('./websocket');
const todosRouter = require('./routes/todos');
const categoriesRouter = require('./routes/categories');
const statsRouter = require('./routes/stats');
const dataRouter = require('./routes/data');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging (clean format)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
  }
  next();
});

// API Routes
app.use('/api/todos', todosRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/data', dataRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Todo App Server running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint available at ws://localhost:${PORT}/ws`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
