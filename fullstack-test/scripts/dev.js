const { spawn } = require('node:child_process');
const path = require('node:path');

console.log('🚀 Starting Full-Stack Todo Application in Dev Mode...\n');

const projectRoot = path.join(__dirname, '..');

// Start Express Backend
const backend = spawn('node', ['server/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

// Start Vite Frontend
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nGracefully shutting down dev servers...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
