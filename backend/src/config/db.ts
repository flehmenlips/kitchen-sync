import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
const { Pool } = pg;

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;

// Log database configuration status (without exposing credentials)
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  console.log('🔧 Database configuration check:');
  console.log(`   DATABASE_URL is ${connectionString ? 'SET' : 'NOT SET'}`);
  if (connectionString) {
    // Parse and log non-sensitive parts of the connection string
    try {
      const url = new URL(connectionString);
      console.log(`   Database host: ${url.hostname}`);
      console.log(`   Database name: ${url.pathname.slice(1) || '(not specified)'}`);
      console.log(`   Database user: ${url.username ? '(set)' : '(not set)'}`);
    } catch (e) {
      console.log('   ⚠️  Could not parse DATABASE_URL - may be malformed');
    }
  }
}

if (!connectionString) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set');
  console.error('   Make sure DATABASE_URL is configured in Render environment variables');
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
});

export default prisma; 