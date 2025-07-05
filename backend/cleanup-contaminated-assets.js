const { PrismaClient } = require('@prisma/client');

console.log('🧹 ASSET CONTAMINATION CLEANUP FOR COQ AU VIN (Restaurant ID 2)');
console.log('='.repeat(70));

const prisma = new PrismaClient();

const CONTAMINATION_PATTERNS = [
  // Cloudinary samples
  { pattern: 'samples/', reason: 'Cloudinary sample assets' },
  { pattern: 'sample.jpg', reason: 'Cloudinary sample asset' },
  { pattern: 'cld-sample', reason: 'Cloudinary demo asset' },
  
  // Demo assets
  { pattern: 'demo_', reason: 'Demo/placeholder asset' },
  
  // Other restaurant assets (Seabreeze Farm)
  { pattern: 'seabreeze_farm/', reason: 'Belongs to different restaurant (Seabreeze Farm)' },
  { pattern: 'neverstill', reason: 'Belongs to different restaurant (Neverstill Ranch)' },
  { pattern: 'madrona', reason: 'Belongs to different restaurant' },
  
  // Personal/loose files that don't follow folder structure
  { pattern: 'IMG_', reason: 'Loose personal photo files' },
  { pattern: 'Map_', reason: 'Loose document files' },
  { pattern: 'moonrise-farmhouse', reason: 'Belongs to different restaurant' },
  { pattern: '400PX-newLOGO', reason: 'Loose logo file' }
];

async function analyzeContamination() {
  try {
    console.log('📊 ANALYZING CONTAMINATION...\n');
    
    const allAssets = await prisma.brandAsset.findMany({
      where: { restaurantId: 2 },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        assetType: true,
        cloudinaryPublicId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const contaminated = [];
    const legitimate = [];

    allAssets.forEach(asset => {
      const publicId = asset.cloudinaryPublicId || asset.fileName;
      const url = asset.fileUrl;
      
      let isContaminated = false;
      let contaminationReason = '';

      // Check against contamination patterns
      for (const { pattern, reason } of CONTAMINATION_PATTERNS) {
        if (publicId.includes(pattern) || url.includes(pattern) || asset.fileName.includes(pattern)) {
          isContaminated = true;
          contaminationReason = reason;
          break;
        }
      }

      if (isContaminated) {
        contaminated.push({ ...asset, reason: contaminationReason });
      } else {
        legitimate.push(asset);
      }
    });

    console.log('🚨 CONTAMINATED ASSETS TO REMOVE:');
    console.log('-'.repeat(50));
    
    const contaminationStats = {};
    contaminated.forEach((asset, i) => {
      console.log(`${(i+1).toString().padStart(3, ' ')}. ${asset.fileName}`);
      console.log(`     Reason: ${asset.reason}`);
      console.log(`     Public ID: ${asset.cloudinaryPublicId || 'not_stored'}`);
      console.log('');
      
      contaminationStats[asset.reason] = (contaminationStats[asset.reason] || 0) + 1;
    });

    console.log('📊 CONTAMINATION SUMMARY:');
    console.log('-'.repeat(50));
    Object.entries(contaminationStats).forEach(([reason, count]) => {
      console.log(`${reason}: ${count} assets`);
    });

    console.log(`\n✅ LEGITIMATE ASSETS TO KEEP: ${legitimate.length}`);
    console.log(`🚨 CONTAMINATED ASSETS TO REMOVE: ${contaminated.length}`);
    console.log(`📊 TOTAL ASSETS: ${allAssets.length}`);

    console.log('\n🔍 LEGITIMATE ASSET BREAKDOWN:');
    console.log('-'.repeat(50));
    const legitimateFolders = {};
    legitimate.forEach(asset => {
      const url = asset.fileUrl;
      const folderMatch = url.match(/upload\/(?:v\d+\/)?([^\/]+)/);
      const folder = folderMatch ? folderMatch[1] : 'unknown';
      legitimateFolders[folder] = (legitimateFolders[folder] || 0) + 1;
    });
    
    Object.entries(legitimateFolders)
      .sort((a, b) => b[1] - a[1])
      .forEach(([folder, count]) => {
        console.log(`${folder}: ${count} assets`);
      });

    return { contaminated, legitimate };

  } catch (error) {
    console.error('❌ Error analyzing contamination:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function removeContaminatedAssets(dryRun = true) {
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No assets will be deleted');
    console.log('To actually delete contaminated assets, run: node cleanup-contaminated-assets.js --execute');
    return;
  }

  console.log('\n🚨 EXECUTING CLEANUP - DELETING CONTAMINATED ASSETS');
  console.log('This action cannot be undone!');
  
  // Add actual deletion logic here if needed
  // For now, we'll just analyze
}

// Main execution
const main = async () => {
  const isExecuteMode = process.argv.includes('--execute');
  const analysis = await analyzeContamination();
  
  if (analysis) {
    await removeContaminatedAssets(!isExecuteMode);
  }
};

main().catch(console.error); 