const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    // Get database URL (hide password)
    const dbUrl = process.env.DATABASE_URL || '';
    const sanitizedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
    
    console.log('\n🔍 DATABASE CONNECTION CHECK');
    console.log('━'.repeat(50));
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database URL: ${sanitizedUrl}`);
    
    // Check if this looks like production
    if (dbUrl.includes('render.com') || dbUrl.includes('amazonaws.com') || dbUrl.includes('heroku')) {
      console.log('\n⚠️  WARNING: You are connected to a PRODUCTION database!');
      console.log('⚠️  Be extremely careful with any operations!');
    } else if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      console.log('\n✅ Connected to LOCAL database');
    } else {
      console.log('\n⚠️  Unknown database host - please verify!');
    }
    
    // Count records
    const userCount = await prisma.user.count();
    const customerCount = await prisma.user.count({ where: { isCustomer: true } });
    const staffCount = await prisma.user.count({ where: { isCustomer: false } });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Users: ${userCount}`);
    console.log(`   Staff Users: ${staffCount}`);
    console.log(`   Customer Users: ${customerCount}`);
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection(); 