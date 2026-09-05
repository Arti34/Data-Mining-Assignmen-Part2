const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send initial greeting / sync status
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      timestamp: new Date().toISOString(),
      clientsCount: wss.clients.size
    }));

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (err) {
        console.error('WebSocket incoming message error:', err);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  // Keep-alive ping interval every 30 seconds
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('WebSocket server initialized at /ws');
  return wss;
}

function broadcast(eventType, data, excludeWs = null) {
  if (!wss) return;
  const payload = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

module.exports = {
  initWebSocket,
  broadcast
};
