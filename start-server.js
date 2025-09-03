const { spawn } = require('child_process');
const path = require('path');

// Start the server using tsx
const server = spawn('npx', ['tsx', path.join(__dirname, 'server', 'index.ts')], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});