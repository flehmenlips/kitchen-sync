import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('Comprehensive Database Check\n');
    console.log('='.repeat(50));
    
    // Check each table
    const tables = [
      { name: 'users', count: await prisma.user.count() },
      { name: 'recipes', count: await prisma.recipe.count() },
      { name: 'ingredients', count: await prisma.ingredient.count() },
      { name: 'categories', count: await prisma.category.count() },
      { name: 'units_of_measure', count: await prisma.unitOfMeasure.count() },

      { name: 'prep_columns', count: await prisma.prepColumn.count() },
      { name: 'prep_tasks', count: await prisma.prepTask.count() },
    ];
    
    console.log('Table Record Counts:');
    tables.forEach(t => {
      console.log(`  ${t.name}: ${t.count} records`);
    });
    
    // Get sample data if it exists
    const recipeCount = await prisma.recipe.count();
    if (recipeCount > 0) {
      console.log('\nSample Recipes:');
      const recipes = await prisma.recipe.findMany({ take: 3 });
      recipes.forEach(r => {
        console.log(`  - ${r.name} (created: ${r.createdAt.toLocaleDateString()})`);
      });
    }
    
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('\nUsers:');
      const users = await prisma.user.findMany();
      users.forEach(u => {
        console.log(`  - ${u.email} (${u.name})`);
      });
    }
    
    // Check if this might be the wrong database
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 1;
    ` as Array<{migration_name: string, finished_at: Date}>;
    
    if (migrations.length > 0) {
      console.log(`\nLast migration: ${migrations[0].migration_name}`);
      console.log(`Applied on: ${migrations[0].finished_at.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData(); 