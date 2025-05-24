const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'add_restaurant_settings_mvp.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Running restaurant settings MVP migration...');
    
    // Split the SQL by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration(); 