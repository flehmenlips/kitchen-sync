#!/usr/bin/env node

/**
 * Database Backup Script (JSON format)
 * 
 * Creates a JSON backup of all database tables
 * Works regardless of PostgreSQL version differences
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const DatabaseConfig = require('../config/database.config');

const prisma = new PrismaClient();

async function createBackup() {
  try {
    const config = DatabaseConfig.getConfig();
    
    console.log('🔒 Database Backup Utility (JSON format)');
    console.log('========================================\n');
    console.log(`Environment: ${config.environment}`);
    console.log(`Production: ${config.isProduction ? 'YES ⚠️' : 'NO'}\n`);
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-json-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    console.log(`📁 Backup file: ${filename}`);
    console.log('⏳ Creating backup...\n');
    
    // Backup data
    const backup = {
      metadata: {
        createdAt: new Date().toISOString(),
        environment: config.environment,
        isProduction: config.isProduction
      },
      data: {}
    };
    
    // Define tables to backup with their relationships
    const tables = [
      { name: 'users', model: prisma.user },
      { name: 'restaurants', model: prisma.restaurant },
      { name: 'restaurantSettings', model: prisma.restaurantSettings },
      { name: 'categories', model: prisma.category },
      { name: 'ingredientCategories', model: prisma.ingredientCategory },
      { name: 'unitsOfMeasure', model: prisma.unitOfMeasure },
      { name: 'ingredients', model: prisma.ingredient },
      { name: 'recipes', model: prisma.recipe },
      { name: 'recipeIngredients', model: prisma.recipeIngredient },
      { name: 'menus', model: prisma.menu },
      { name: 'menuSections', model: prisma.menuSection },
      { name: 'menuItems', model: prisma.menuItem },
      { name: 'prepColumns', model: prisma.prepColumn },
      { name: 'prepTasks', model: prisma.prepTask },
      { name: 'reservations', model: prisma.reservation },
      { name: 'orders', model: prisma.order },
      { name: 'orderItems', model: prisma.orderItem },
      { name: 'issues', model: prisma.issue },
      { name: 'comments', model: prisma.comment },
      { name: 'labels', model: prisma.label },
      { name: 'issueLabels', model: prisma.issueLabel }
    ];
    
    // Backup each table
    for (const table of tables) {
      try {
        const data = await table.model.findMany();
        backup.data[table.name] = data;
        console.log(`✓ Backed up ${table.name}: ${data.length} records`);
      } catch (error) {
        console.error(`❌ Error backing up ${table.name}:`, error.message);
        backup.data[table.name] = [];
      }
    }
    
    // Calculate counts
    const totalRecords = Object.values(backup.data).reduce((sum, records) => sum + records.length, 0);
    backup.metadata.totalRecords = totalRecords;
    backup.metadata.tableCount = Object.keys(backup.data).length;
    
    // Write backup to file
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    // Check file size
    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📊 Total records: ${totalRecords}`);
    console.log(`📦 File size: ${fileSizeMB} MB`);
    console.log(`📍 Location: ${filepath}`);
    
    // Add to .gitignore if not already there
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('backups/')) {
        fs.appendFileSync(gitignorePath, '\n# Database backups\nbackups/\n');
        console.log('\n📝 Added backups/ to .gitignore');
      }
    }
    
    console.log('\n💡 This is a JSON backup that can be restored using a custom restore script.');
    console.log('For a full PostgreSQL backup, consider upgrading your pg_dump to version 16+');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
createBackup(); 