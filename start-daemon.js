const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const backendLog = fs.openSync(path.join(rootDir, 'backend.log'), 'a');
const frontendLog = fs.openSync(path.join(rootDir, 'frontend.log'), 'a');

console.log('Spawning independent background servers...');

// 1. Spawn Backend
const backend = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: backendDir,
  detached: true,
  stdio: ['ignore', backendLog, backendLog],
  shell: true,
});
backend.unref();

// 2. Spawn Frontend
const frontend = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--host', '0.0.0.0'], {
  cwd: frontendDir,
  detached: true,
  stdio: ['ignore', frontendLog, frontendLog],
  shell: true,
});
frontend.unref();

console.log(`Backend PID: ${backend.pid}`);
console.log(`Frontend PID: ${frontend.pid}`);
console.log('Servers spawned detached and unrefed successfully.');
