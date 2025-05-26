#!/usr/bin/env node

/**
 * Production Pre-flight Check Script
 * 
 * Verifies the production environment before running the customer migration.
 * This script is READ-ONLY and makes no changes to the database.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

const checks = {
  passed: [],
  warnings: [],
  failures: []
};

function pass(message) {
  console.log(`✅ ${message}`);
  checks.passed.push(message);
}

function warn(message) {
  console.log(`⚠️  ${message}`);
  checks.warnings.push(message);
}

function fail(message) {
  console.log(`❌ ${message}`);
  checks.failures.push(message);
}

async function checkEnvironment() {
  console.log('\n🔍 Environment Checks');
  console.log('===================');
  
  const env = process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL' : 'PRODUCTION';
  console.log(`Environment: ${env}`);
  
  if (env === 'LOCAL') {
    warn('Running against LOCAL database - use production credentials for actual check');
  } else {
    pass('Running against PRODUCTION database');
  }
  
  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 14) {
    pass(`Node.js version ${nodeVersion} is supported`);
  } else {
    fail(`Node.js version ${nodeVersion} is too old (need v14+)`);
  }
}

async function checkDatabaseConnection() {
  console.log('\n🔍 Database Connection');
  console.log('=====================');
  
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    const pgVersion = result[0].version;
    pass(`Connected to PostgreSQL: ${pgVersion}`);
  } catch (error) {
    fail(`Database connection failed: ${error.message}`);
    throw error;
  }
}

async function checkExistingSchema() {
  console.log('\n🔍 Schema Analysis');
  console.log('=================');
  
  try {
    // Check if customer tables already exist
    const customerTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'customer_profiles', 'customer_sessions', 'customer_restaurants');
    `;
    
    if (customerTables.length > 0) {
      warn(`Found ${customerTables.length}/4 customer tables already exist:`);
      customerTables.forEach(t => console.log(`  - ${t.table_name}`));
    } else {
      pass('No customer tables exist yet (clean migration)');
    }
    
    // Check if reservation/order tables have customer_id column
    const reservationColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reservations' 
      AND column_name = 'customer_id';
    `;
    
    if (reservationColumns.length > 0) {
      warn('Reservations table already has customer_id column');
    } else {
      pass('Reservations table ready for customer_id addition');
    }
    
    const orderColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'customer_id';
    `;
    
    if (orderColumns.length > 0) {
      warn('Orders table already has customer_id column');
    } else {
      pass('Orders table ready for customer_id addition');
    }
    
  } catch (error) {
    fail(`Schema check failed: ${error.message}`);
  }
}

async function checkUserData() {
  console.log('\n🔍 User Data Analysis');
  console.log('====================');
  
  try {
    // Count users by type
    const totalUsers = await prisma.user.count();
    const customers = await prisma.user.count({ where: { isCustomer: true } });
    const staff = await prisma.user.count({ where: { isCustomer: false } });
    const superadmins = await prisma.user.count({ where: { role: 'SUPERADMIN' } });
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`  - Customers: ${customers}`);
    console.log(`  - Staff: ${staff}`);
    console.log(`  - Superadmins: ${superadmins}`);
    
    if (customers === 0) {
      warn('No customers found in users table');
    } else {
      pass(`Found ${customers} customers to migrate`);
    }
    
    if (superadmins === 0) {
      fail('No SUPERADMIN users found!');
    } else {
      pass(`Found ${superadmins} SUPERADMIN user(s)`);
    }
    
    // Check for duplicate emails
    const duplicates = await prisma.$queryRaw`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1;
    `;
    
    if (duplicates.length > 0) {
      fail(`Found ${duplicates.length} duplicate email addresses!`);
      duplicates.forEach(d => console.log(`  - ${d.email}: ${d.count} occurrences`));
    } else {
      pass('No duplicate email addresses found');
    }
    
    // Sample customer data
    if (customers > 0) {
      console.log('\nSample customers:');
      const sampleCustomers = await prisma.user.findMany({
        where: { isCustomer: true },
        take: 3,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true
        }
      });
      
      sampleCustomers.forEach(c => {
        console.log(`  - ${c.email} (ID: ${c.id}, Name: ${c.name || 'N/A'}, Created: ${c.createdAt.toLocaleDateString()})`);
      });
    }
    
  } catch (error) {
    fail(`User data check failed: ${error.message}`);
  }
}

async function checkRelatedData() {
  console.log('\n🔍 Related Data Analysis');
  console.log('=======================');
  
  try {
    // Check reservations
    const totalReservations = await prisma.reservation.count();
    const customerReservations = await prisma.reservation.count({
      where: {
        user: {
          isCustomer: true
        }
      }
    });
    
    console.log(`Total reservations: ${totalReservations}`);
    console.log(`  - Customer reservations: ${customerReservations}`);
    console.log(`  - Staff reservations: ${totalReservations - customerReservations}`);
    
    if (customerReservations > 0) {
      pass(`Found ${customerReservations} customer reservations to update`);
    }
    
    // Check orders
    const totalOrders = await prisma.order.count();
    const customerOrders = await prisma.order.count({
      where: {
        user: {
          isCustomer: true
        }
      }
    });
    
    console.log(`\nTotal orders: ${totalOrders}`);
    console.log(`  - Customer orders: ${customerOrders}`);
    console.log(`  - Staff orders: ${totalOrders - customerOrders}`);
    
    if (customerOrders > 0) {
      pass(`Found ${customerOrders} customer orders to update`);
    }
    
    // Check restaurant staff assignments
    const customerStaffAssignments = await prisma.restaurantStaff.count({
      where: {
        user: {
          isCustomer: true
        }
      }
    });
    
    if (customerStaffAssignments > 0) {
      warn(`Found ${customerStaffAssignments} customers in restaurant_staff table (will be removed)`);
    }
    
  } catch (error) {
    fail(`Related data check failed: ${error.message}`);
  }
}

async function checkBackups() {
  console.log('\n🔍 Backup Status');
  console.log('===============');
  
  try {
    // Check if backup script exists
    const fs = require('fs');
    const backupScriptPath = require('path').join(__dirname, 'production-backup.js');
    
    if (fs.existsSync(backupScriptPath)) {
      pass('Backup script is available');
    } else {
      fail('Backup script not found!');
    }
    
    // Check backup directory
    const backupDir = require('path').join(__dirname, 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
      
      if (backupFiles.length > 0) {
        const latest = backupFiles.sort().reverse()[0];
        const stats = fs.statSync(require('path').join(backupDir, latest));
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        if (ageHours < 24) {
          pass(`Recent backup found: ${latest} (${ageHours.toFixed(1)} hours old)`);
        } else {
          warn(`Latest backup is ${ageHours.toFixed(1)} hours old: ${latest}`);
        }
      } else {
        warn('No backup files found');
      }
    } else {
      warn('Backup directory does not exist');
    }
    
  } catch (error) {
    fail(`Backup check failed: ${error.message}`);
  }
}

async function checkGitStatus() {
  console.log('\n🔍 Git Status');
  console.log('============');
  
  try {
    // Check current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`Current branch: ${branch}`);
    
    if (branch === 'main') {
      warn('On main branch - consider using a feature branch');
    } else {
      pass(`On feature branch: ${branch}`);
    }
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const changedFiles = status.split('\n').filter(line => line.trim());
    
    if (changedFiles.length > 0) {
      warn(`${changedFiles.length} uncommitted changes found`);
    } else {
      pass('No uncommitted changes');
    }
    
  } catch (error) {
    warn(`Git check skipped: ${error.message}`);
  }
}

async function generateReport() {
  console.log('\n📊 PRE-FLIGHT CHECK SUMMARY');
  console.log('==========================');
  
  console.log(`\n✅ Passed: ${checks.passed.length}`);
  checks.passed.forEach(msg => console.log(`   ${msg}`));
  
  if (checks.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${checks.warnings.length}`);
    checks.warnings.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (checks.failures.length > 0) {
    console.log(`\n❌ Failures: ${checks.failures.length}`);
    checks.failures.forEach(msg => console.log(`   ${msg}`));
  }
  
  console.log('\n🎯 RECOMMENDATION:');
  if (checks.failures.length > 0) {
    console.log('   ❌ DO NOT PROCEED - Critical issues found!');
    console.log('   Fix the failures above before attempting migration.');
  } else if (checks.warnings.length > 5) {
    console.log('   ⚠️  PROCEED WITH CAUTION - Multiple warnings detected.');
    console.log('   Review warnings carefully and ensure you have a recent backup.');
  } else {
    console.log('   ✅ READY FOR MIGRATION - System appears ready.');
    console.log('   Remember to:');
    console.log('   1. Take a fresh backup');
    console.log('   2. Run migration in dry-run mode first');
    console.log('   3. Have a rollback plan ready');
  }
}

async function main() {
  console.log('🚀 KitchenSync Production Pre-flight Check');
  console.log('========================================');
  console.log(`Started: ${new Date().toISOString()}`);
  
  try {
    await checkEnvironment();
    await checkDatabaseConnection();
    await checkExistingSchema();
    await checkUserData();
    await checkRelatedData();
    await checkBackups();
    await checkGitStatus();
    await generateReport();
    
  } catch (error) {
    console.error('\n💥 Pre-flight check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 