import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create initial labels
    const labels = [
        { name: 'feature', color: '#0052CC', description: 'New feature request' },
        { name: 'bug', color: '#FF0000', description: 'Something is not working' },
        { name: 'enhancement', color: '#2ECC71', description: 'Improvement to existing feature' },
        { name: 'documentation', color: '#0066FF', description: 'Documentation related' },
        { name: 'security', color: '#FF4500', description: 'Security related' },
        { name: 'performance', color: '#FFD700', description: 'Performance improvement' },
        { name: 'technical-debt', color: '#808080', description: 'Technical debt reduction' },
        { name: 'high-priority', color: '#FF1493', description: 'High priority item' },
        { name: 'good-first-issue', color: '#7FFF00', description: 'Good for newcomers' },
        { name: 'needs-discussion', color: '#9370DB', description: 'Needs further discussion' }
    ];

    console.log('Creating initial labels...');
    for (const label of labels) {
        await prisma.label.upsert({
            where: { name: label.name },
            update: {},
            create: label
        });
    }
    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 