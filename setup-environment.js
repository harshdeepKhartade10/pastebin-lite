#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment files for Pastebin Lite...\n');

// Backend environment files
const backendFiles = [
  {
    source: 'backend/.env.production',
    target: 'backend/.env',
    description: 'Backend production environment'
  },
  {
    source: 'backend/env.local.example',
    target: 'backend/.env.local',
    description: 'Backend local development'
  }
];

// Frontend environment files
const frontendFiles = [
  {
    source: 'frontend/.env.production',
    target: 'frontend/.env',
    description: 'Frontend production environment'
  },
  {
    source: 'frontend/env.local.example',
    target: 'frontend/.env.local',
    description: 'Frontend local development'
  }
];

// Function to copy file if source exists
function copyFile(source, target, description) {
  const sourcePath = path.join(__dirname, source);
  const targetPath = path.join(__dirname, target);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Created: ${description}`);
    console.log(`   Source: ${source}`);
    console.log(`   Target: ${target}\n`);
    return true;
  } else {
    console.log(`❌ Source file not found: ${source}\n`);
    return false;
  }
}

// Copy all environment files
console.log('📁 Backend Environment Files:\n');
backendFiles.forEach(file => {
  copyFile(file.source, file.target, file.description);
});

console.log('📁 Frontend Environment Files:\n');
frontendFiles.forEach(file => {
  copyFile(file.source, file.target, file.description);
});

console.log('🎉 Environment setup complete!');
console.log('\n📋 Next Steps:');
console.log('1. Check the created .env files');
console.log('2. Update environment variables on Render/Vercel');
console.log('3. Test the application');
console.log('\n🌐 Deployed URLs:');
console.log('Frontend: https://pastebin-lite-phi.vercel.app');
console.log('Backend:  https://pastebin-lite-backend-6uu2.onrender.com');
