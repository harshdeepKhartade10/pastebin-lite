#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up environment files...\n');

// Files to remove
const filesToRemove = [
  'backend/.env.local',
  'backend/.env.production', 
  'backend/env.local.example',
  'backend/env.production.example',
  'frontend/.env.local',
  'frontend/.env.production',
  'frontend/env.local.example',
  'frontend/env.production.example',
  'setup-environment.js',
  'ENVIRONMENT-SETUP.md'
];

// Remove unnecessary files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed: ${file}`);
  }
});

// Copy clean environment files
const cleanFiles = [
  { source: 'backend/.env.clean', target: 'backend/.env' },
  { source: 'frontend/.env.clean', target: 'frontend/.env' }
];

cleanFiles.forEach(file => {
  const sourcePath = path.join(__dirname, file.source);
  const targetPath = path.join(__dirname, file.target);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Updated: ${file.target}`);
  }
});

console.log('\n🎉 Environment cleanup complete!');
console.log('\n📁 Final Environment Files:');
console.log('   backend/.env - Backend configuration');
console.log('   frontend/.env - Frontend configuration');
console.log('\n🌐 Deployed URLs:');
console.log('   Frontend: https://pastebin-lite-phi.vercel.app');
console.log('   Backend:  https://pastebin-lite-backend-6uu2.onrender.com');
