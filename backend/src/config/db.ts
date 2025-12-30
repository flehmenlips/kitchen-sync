import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
const { Pool } = pg;

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// ALWAYS log database configuration status at startup (without exposing credentials)
console.log('========================================');
console.log('🔧 DATABASE CONFIGURATION CHECK');
console.log('========================================');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   DATABASE_URL is: ${connectionString ? 'SET ✓' : 'NOT SET ✗'}`);

if (connectionString) {
  // Parse and log non-sensitive parts of the connection string
  try {
    const url = new URL(connectionString);
    console.log(`   Database host: ${url.hostname}`);
    console.log(`   Database port: ${url.port || '5432 (default)'}`);
    console.log(`   Database name: ${url.pathname.slice(1) || '(not specified in URL)'}`);
    console.log(`   Database user: ${url.username ? '(set)' : '(not set)'}`);
    console.log(`   SSL mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
  } catch (e) {
    console.log('   ⚠️  Could not parse DATABASE_URL - may be malformed');
    console.log(`   Error: ${e instanceof Error ? e.message : String(e)}`);
  }
} else {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set');
  console.error('   Make sure DATABASE_URL is configured in Render environment variables');
  throw new Error('DATABASE_URL environment variable is not set');
}
console.log('========================================');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
});

// Test database connection at startup
pool.query('SELECT 1 as connection_test')
  .then(() => {
    console.log('✅ Database connection test: SUCCESS');
  })
  .catch((err: Error) => {
    console.error('❌ Database connection test: FAILED');
    console.error(`   Error: ${err.message}`);
    // Don't throw here - let the app continue and fail on actual queries
    // This provides better error messages
  });

export default prisma; 