require('dotenv').config();

console.log('\n=== CURRENT DATABASE CONNECTION ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const isLocal = process.env.DATABASE_URL?.includes('localhost');
const isProduction = process.env.DATABASE_URL?.includes('render.com');

if (isLocal) {
  console.log('\n✅ SAFE: You are connected to LOCAL database');
  console.log('It is safe to run migrations and make changes.\n');
} else if (isProduction) {
  console.log('\n⚠️  WARNING: You are connected to PRODUCTION database!');
  console.log('DO NOT run migrations or make destructive changes!\n');
} else {
  console.log('\n❓ Unknown database connection');
  console.log('Please verify before making any changes.\n');
} 