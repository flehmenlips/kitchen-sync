#!/usr/bin/env node

console.log('🔍 Checking Environment Variables');
console.log('=================================\n');

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
  'NODE_ENV'
];

const optionalEnvVars = [
  'PORT',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_FROM'
];

console.log('Required variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'DATABASE_URL' || varName === 'JWT_SECRET' ? '[SET]' : value}`);
  } else {
    console.log(`❌ ${varName}: [NOT SET]`);
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${value ? '✅' : '⚠️'} ${varName}: ${value || '[NOT SET]'}`);
});

console.log('\nFrontend URL:', process.env.FRONTEND_URL || '[NOT SET]');
console.log('This should match:', 'https://kitchen-sync-app.onrender.com'); 