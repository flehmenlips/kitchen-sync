import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function checkUserRole(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                email: true,
                role: true
            }
        });
        console.log('User role:', user);
    } catch (error) {
        console.error('Error checking user role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Check if email argument is provided
const email = process.argv[2] || 'george@seabreeze.farm';
checkUserRole(email); 