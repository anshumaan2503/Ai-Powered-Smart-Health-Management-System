#!/usr/bin/env node
/**
 * Quick fix script for frontend issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing frontend configuration...');

// Ensure all required directories exist
const dirs = [
  'components/ui',
  'lib',
  'app'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('✅ Frontend configuration fixed!');
console.log('💡 Try running "npm run dev" again');