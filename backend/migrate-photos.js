#!/usr/bin/env node

// This script compiles and runs the migration script
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

// First, compile the TypeScript file
console.log('Compiling migration script...');
exec('npx tsc src/scripts/migratePhotosToCloudinary.ts --outDir dist/scripts', (error, stdout, stderr) => {
  if (error) {
    console.error('Error compiling migration script:', error);
    console.error(stderr);
    return;
  }
  
  console.log('Compilation successful. Running migration...');
  
  // Then run the compiled JavaScript file
  const migrationScript = path.join(__dirname, 'dist/scripts/migratePhotosToCloudinary.js');
  exec(`node ${migrationScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error running migration script:', error);
    }
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
}); 