import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient({
  // Optionally add logging
  // log: ['query', 'info', 'warn', 'error'],
});

export default prisma; 