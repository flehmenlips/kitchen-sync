#!/usr/bin/env node

/**
 * Database Backup Script (using psql)
 * 
 * Alternative backup method that's more compatible with version mismatches
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
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/([^?\/\s]+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4] || '5432',
    database: match[5].split(/[^a-zA-Z0-9_-]/)[0],
    fullUrl: dbUrl.split(/\s/)[0] // Get just the URL part
  };
}

async function createBackup() {
  try {
    const config = DatabaseConfig.getConfig();
    const conn = extractConnectionDetails();
    
    console.log('🔒 Database Backup Utility (psql method)');
    console.log('========================================\n');
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
    console.log('⏳ Creating backup (this may take a while)...\n');
    
    // Create backup using psql with \copy commands for each table
    const backupScript = `
-- Database backup created on ${new Date().toISOString()}
-- Database: ${conn.database}
-- Host: ${conn.host}

BEGIN;

`;

    // Write initial script
    fs.writeFileSync(filepath, backupScript);
    
    // Get list of tables
    const getTablesCmd = `PGPASSWORD="${conn.password}" psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"`;
    
    exec(getTablesCmd, (error, stdout) => {
      if (error) {
        console.error('❌ Failed to get table list:', error.message);
        return;
      }
      
      const tables = stdout.split('\n').map(t => t.trim()).filter(t => t && t !== '');
      console.log(`📊 Found ${tables.length} tables to backup\n`);
      
      // For each table, export data
      let completed = 0;
      let hasErrors = false;
      
      tables.forEach((table, index) => {
        const exportCmd = `PGPASSWORD="${conn.password}" psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -c "\\COPY (SELECT * FROM ${table}) TO STDOUT WITH CSV HEADER" >> "${filepath}"`;
        
        // Add table header to file
        fs.appendFileSync(filepath, `\n-- Table: ${table}\n`);
        
        exec(exportCmd, (err) => {
          if (err) {
            console.error(`❌ Error backing up table ${table}:`, err.message);
            hasErrors = true;
          } else {
            console.log(`✓ Backed up table: ${table}`);
          }
          
          completed++;
          
          if (completed === tables.length) {
            // Add closing statement
            fs.appendFileSync(filepath, '\nCOMMIT;\n');
            
            // Check file size
            const stats = fs.statSync(filepath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            if (!hasErrors) {
              console.log(`\n✅ Backup completed successfully!`);
            } else {
              console.log(`\n⚠️  Backup completed with some errors`);
            }
            
            console.log(`📦 File size: ${fileSizeMB} MB`);
            console.log(`📍 Location: ${filepath}`);
            
            // Add to .gitignore if not already there
            const gitignorePath = path.join(__dirname, '..', '.gitignore');
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
            if (!gitignoreContent.includes('backups/')) {
              fs.appendFileSync(gitignorePath, '\n# Database backups\nbackups/\n');
              console.log('\n📝 Added backups/ to .gitignore');
            }
            
            console.log('\n⚠️  Note: This is a CSV-based backup. For a full SQL backup,');
            console.log('consider upgrading your local PostgreSQL client to match the server version.');
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the backup
createBackup(); 