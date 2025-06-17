#!/usr/bin/env node

/**
 * Production Database Backup Script
 * For Website Builder Content Block Migration Deployment
 * 
 * This script creates a comprehensive backup before deploying
 * the content block migration changes to production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../database-backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const BACKUP_PREFIX = `website-builder-deployment-${TIMESTAMP}`;

console.log('🚨 PRODUCTION DEPLOYMENT BACKUP SCRIPT');
console.log('=====================================');
console.log(`Backup Directory: ${BACKUP_DIR}`);
console.log(`Backup Prefix: ${BACKUP_PREFIX}`);
console.log('');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✅ Created backup directory');
}

// Check if we're in production mode
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  WARNING: NODE_ENV is not set to "production"');
  console.log('   Make sure you have the production DATABASE_URL configured');
  console.log('');
}

// Check for required environment variables
const requiredEnvVars = ['DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: ${envVar} environment variable is required`);
    process.exit(1);
  }
}

console.log('✅ Environment variables validated');
console.log('');

try {
  // 1. Full database backup using pg_dump
  console.log('📦 Creating full database backup...');
  const fullBackupFile = path.join(BACKUP_DIR, `${BACKUP_PREFIX}-full-backup.sql`);
  
  execSync(`pg_dump "${process.env.DATABASE_URL}" > "${fullBackupFile}"`, {
    stdio: 'inherit'
  });
  
  console.log(`✅ Full backup created: ${fullBackupFile}`);
  
  // 2. Specific table backups for critical data
  console.log('📋 Creating specific table backups...');
  
  const criticalTables = [
    'restaurants',
    'users', 
    'customers',
    'content_blocks',
    'restaurant_settings'
  ];
  
  for (const table of criticalTables) {
    const tableBackupFile = path.join(BACKUP_DIR, `${BACKUP_PREFIX}-${table}.sql`);
    
    try {
      execSync(`pg_dump "${process.env.DATABASE_URL}" --table=${table} > "${tableBackupFile}"`, {
        stdio: 'inherit'
      });
      console.log(`  ✅ ${table} backup created`);
    } catch (error) {
      console.warn(`  ⚠️  Warning: Could not backup table ${table} (may not exist)`);
    }
  }
  
  // 3. Data validation queries
  console.log('🔍 Running pre-deployment data validation...');
  
  const validationQueries = [
    {
      name: 'Restaurant count',
      query: 'SELECT COUNT(*) as count FROM restaurants;'
    },
    {
      name: 'Content blocks count', 
      query: 'SELECT COUNT(*) as count FROM content_blocks;'
    },
    {
      name: 'Restaurant settings count',
      query: 'SELECT COUNT(*) as count FROM restaurant_settings;'
    },
    {
      name: 'Active restaurants with settings',
      query: `
        SELECT r.name, r.slug, rs.id as settings_id 
        FROM restaurants r 
        LEFT JOIN restaurant_settings rs ON r.id = rs.restaurant_id 
        WHERE r.is_active = true;
      `
    }
  ];
  
  const validationResults = {};
  
  for (const validation of validationQueries) {
    try {
      const result = execSync(`psql "${process.env.DATABASE_URL}" -c "${validation.query}"`, {
        encoding: 'utf8'
      });
      
      validationResults[validation.name] = result;
      console.log(`  ✅ ${validation.name} validated`);
    } catch (error) {
      console.warn(`  ⚠️  Warning: Could not validate ${validation.name}`);
      validationResults[validation.name] = `Error: ${error.message}`;
    }
  }
  
  // 4. Save validation results
  const validationFile = path.join(BACKUP_DIR, `${BACKUP_PREFIX}-validation-results.json`);
  fs.writeFileSync(validationFile, JSON.stringify(validationResults, null, 2));
  console.log(`✅ Validation results saved: ${validationFile}`);
  
  // 5. Create deployment summary
  const deploymentSummary = {
    timestamp: new Date().toISOString(),
    backupFiles: {
      fullBackup: fullBackupFile,
      tableBackups: criticalTables.map(table => 
        path.join(BACKUP_DIR, `${BACKUP_PREFIX}-${table}.sql`)
      ),
      validationResults: validationFile
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]'
    },
    deploymentChanges: [
      'Enhanced contentBlockController.ts with restaurant slug detection',
      'Added backward compatibility for restaurant detection',
      'Enhanced error handling in frontend services',
      'Added comprehensive logging for debugging',
      'Improved navigation URL handling for development mode'
    ],
    rollbackInstructions: [
      '1. Stop application traffic',
      `2. Restore database: psql "${process.env.DATABASE_URL}" < "${fullBackupFile}"`,
      '3. Revert code changes if necessary',
      '4. Verify application functionality'
    ]
  };
  
  const summaryFile = path.join(BACKUP_DIR, `${BACKUP_PREFIX}-deployment-summary.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(deploymentSummary, null, 2));
  
  console.log('');
  console.log('🎉 BACKUP COMPLETED SUCCESSFULLY!');
  console.log('=================================');
  console.log(`Backup files created in: ${BACKUP_DIR}`);
  console.log(`Deployment summary: ${summaryFile}`);
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review validation results');
  console.log('2. Proceed with deployment');
  console.log('3. Monitor application after deployment');
  console.log('4. Keep backup files safe for rollback if needed');
  console.log('');
  
} catch (error) {
  console.error('❌ BACKUP FAILED!');
  console.error('================');
  console.error('Error:', error.message);
  console.error('');
  console.error('🚨 DO NOT PROCEED WITH DEPLOYMENT');
  console.error('   Fix backup issues before deploying to production');
  process.exit(1);
} 