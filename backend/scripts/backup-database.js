#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * Creates a backup of the database using pg_dump
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const DatabaseConfig = require('../config/database.config');

function extractConnectionDetails() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not found in environment');
  }
  
  // Parse PostgreSQL connection string
  // Handle case where URL might have extra content after database name
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/([^?\/\s]+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4] || '5432',
    database: match[5].split(/[^a-zA-Z0-9_-]/)[0] // Handle any extra content after database name
  };
}

async function createBackup() {
  try {
    const config = DatabaseConfig.getConfig();
    const conn = extractConnectionDetails();
    
    console.log('🔒 Database Backup Utility');
    console.log('========================\n');
    console.log(`Environment: ${config.environment}`);
    console.log(`Database: ${conn.database}`);
    console.log(`Host: ${conn.host}`);
    console.log(`Production: ${config.isProduction ? 'YES ⚠️' : 'NO'}\n`);
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${conn.database}-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);
    
    console.log(`📁 Backup file: ${filename}`);
    console.log('⏳ Creating backup...\n');
    
    // Build pg_dump command
    // Add --no-owner and --no-acl for better compatibility
    const pgDumpCmd = `PGPASSWORD="${conn.password}" pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -f "${filepath}" --verbose --no-owner --no-acl`;
    
    // Execute pg_dump
    exec(pgDumpCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error.message);
        return;
      }
      
      if (stderr) {
        console.log('📋 Backup log:\n', stderr);
      }
      
      // Check file size
      const stats = fs.statSync(filepath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`\n✅ Backup completed successfully!`);
      console.log(`📦 File size: ${fileSizeMB} MB`);
      console.log(`📍 Location: ${filepath}`);
      
      // Add to .gitignore if not already there
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('backups/')) {
        fs.appendFileSync(gitignorePath, '\n# Database backups\nbackups/\n');
        console.log('\n📝 Added backups/ to .gitignore');
      }
      
      console.log('\n💡 Tip: You can restore this backup using:');
      console.log(`   psql "${process.env.DATABASE_URL}" < "${filepath}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if pg_dump is available
exec('which pg_dump', (error) => {
  if (error) {
    console.error('❌ pg_dump not found. Please install PostgreSQL client tools.');
    console.error('   On macOS: brew install postgresql');
    console.error('   On Ubuntu: sudo apt-get install postgresql-client');
    process.exit(1);
  }
  
  createBackup();
}); 