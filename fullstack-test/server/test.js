const http = require('node:http');
const { app, server } = require('./index');

async function runTests() {
  console.log('Running backend automated sanity tests...');

  // 1. Test /api/health
  const healthRes = await fetch('http://localhost:3000/api/health').then(r => r.json());
  console.log('✔ Health Check:', healthRes);
  if (healthRes.status !== 'healthy') throw new Error('Health check failed');

  // 2. Test GET /api/todos
  const todosRes = await fetch('http://localhost:3000/api/todos').then(r => r.json());
  console.log(`✔ GET /api/todos returned ${todosRes.count} seeded tasks`);
  if (!todosRes.success || todosRes.count === 0) throw new Error('Failed to retrieve seeded tasks');

  // 3. Test POST /api/todos (create task)
  const createRes = await fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Automated Test Task',
      description: 'Testing API pipeline',
      priority: 'high',
      status: 'todo',
      subtasks: [{ title: 'Subtask 1', is_completed: false }]
    })
  }).then(r => r.json());

  console.log('✔ POST /api/todos created task:', createRes.data?.id);
  if (!createRes.success || !createRes.data?.id) throw new Error('Task creation failed');

  // 4. Test PUT /api/todos/:id (toggle completion)
  const putRes = await fetch(`http://localhost:3000/api/todos/${createRes.data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  }).then(r => r.json());
  console.log('✔ PUT /api/todos/:id updated status:', putRes.data?.status);
  if (putRes.data?.status !== 'completed') throw new Error('Task update failed');

  // 5. Test GET /api/stats
  const statsRes = await fetch('http://localhost:3000/api/stats').then(r => r.json());
  console.log('✔ GET /api/stats:', statsRes.data?.summary);

  // 6. Test DELETE /api/todos/:id
  const delRes = await fetch(`http://localhost:3000/api/todos/${createRes.data.id}`, { method: 'DELETE' }).then(r => r.json());
  console.log('✔ DELETE /api/todos/:id:', delRes.message);

  console.log('\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!\n');
  server.close();
  process.exit(0);
}

// Give server 500ms to bind, then run tests
setTimeout(runTests, 500);
