#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = join(__dirname, '..', 'src', 'index.ts');

// 嘗試使用 Bun，如果沒有則使用 bunx
const tryBun = () => {
  return new Promise((resolve) => {
    const checkBun = spawn('bun', ['--version'], { stdio: 'ignore' });
    checkBun.on('error', () => resolve(false));
    checkBun.on('exit', (code) => resolve(code === 0));
  });
};

const main = async () => {
  const hasBun = await tryBun();
  
  let command, args;
  if (hasBun) {
    // 直接使用 Bun
    command = 'bun';
    args = ['run', indexPath];
  } else {
    // 使用 bunx（會自動下載 Bun）
    console.error('Bun not found, using bunx (this may take a moment on first run)...');
    command = 'npx';
    args = ['--yes', 'bunx', '--bun', indexPath];
  }
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  
  child.on('error', (err) => {
    console.error('Failed to start:', err.message);
    console.error('Please install Bun: https://bun.sh');
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
};

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});