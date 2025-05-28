const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMigrations() {
  try {
    console.log('Checking production migrations...\n');
    
    // Check if _prisma_migrations table exists and get applied migrations
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations
      WHERE finished_at IS NOT NULL
      ORDER BY finished_at DESC
    `;
    
    console.log('Applied migrations:');
    migrations.forEach(m => {
      console.log(`- ${m.migration_name} (applied: ${m.finished_at})`);
    });
    
    // Check if platform tables exist
    console.log('\nChecking for platform tables...');
    
    const tables = [
      'platform_admins',
      'platform_actions',
      'subscriptions',
      'invoices',
      'restaurant_notes',
      'support_tickets'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✓ ${table} exists (${count[0].count} records)`);
      } catch (e) {
        console.log(`✗ ${table} does NOT exist`);
      }
    }
    
  } catch (error) {
    console.error('Error checking migrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations(); 