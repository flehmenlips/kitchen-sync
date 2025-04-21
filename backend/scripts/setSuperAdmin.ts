import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setSuperAdmin(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'SUPERADMIN'
            }
        });
        console.log(`Successfully updated user ${user.email} to SuperAdmin role`);
    } catch (error) {
        console.error('Error updating user role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Check if email argument is provided
const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address as an argument');
    process.exit(1);
}

setSuperAdmin(email); 