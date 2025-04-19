const fs = require('fs');
const path = require('path');

const sourcePrisma = path.join(__dirname, '..', 'src', 'generated', 'prisma');
const destPrisma = path.join(__dirname, '..', 'dist', 'generated', 'prisma');

const sourceSchema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const destSchemaDir = path.join(__dirname, '..', 'dist', 'prisma');
const destSchema = path.join(destSchemaDir, 'schema.prisma');

// Ensure destination directories exist
fs.mkdirSync(path.join(__dirname, '..', 'dist', 'generated'), { recursive: true });
fs.mkdirSync(destPrisma, { recursive: true });
fs.mkdirSync(destSchemaDir, { recursive: true });

// Copy Prisma client files recursively
if (fs.existsSync(sourcePrisma)) {
    console.log(`Copying ${sourcePrisma} to ${destPrisma}...`);
    fs.cpSync(sourcePrisma, destPrisma, { recursive: true });
    console.log('Prisma client copied successfully.');
} else {
    console.error(`Source directory not found: ${sourcePrisma}`);
    process.exit(1);
}

// Copy schema.prisma
if (fs.existsSync(sourceSchema)) {
    console.log(`Copying ${sourceSchema} to ${destSchema}...`);
    fs.copyFileSync(sourceSchema, destSchema);
    console.log('schema.prisma copied successfully.');
} else {
     console.error(`Source file not found: ${sourceSchema}`);
     process.exit(1);
}

// Verify copy (optional)
try {
    console.log('--- Verifying copied Prisma Client Files: ---');
    const files = fs.readdirSync(destPrisma);
    console.log(files.join('\n'));
    console.log('--- Verification complete. ---')
} catch (err) {
    console.error('Error verifying copied files:', err);
} 