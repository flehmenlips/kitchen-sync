import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting local database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isCustomer: false,
    },
  });
  console.log('✅ Created test user:', testUser.email);

  // Create restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'seabreeze-kitchen' },
    update: {},
    create: {
      name: 'Seabreeze Kitchen',
      slug: 'seabreeze-kitchen',
      description: 'Farm-to-table cuisine with ocean views',
      cuisine: 'Contemporary American',
      phone: '(555) 123-4567',
      email: 'info@seabreezekitchen.com',
      isActive: true,
    },
  });
  console.log('✅ Created restaurant:', restaurant.name);

  // Create restaurant settings
  const settings = await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantId: restaurant.id,
      websiteName: 'Seabreeze Kitchen',
      tagline: 'Farm-to-table cuisine with ocean views',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      accentColor: '#ff9800',
      fontPrimary: 'Roboto, sans-serif',
      fontSecondary: 'Playfair Display, serif',
      metaTitle: 'Seabreeze Kitchen - Farm-to-Table Restaurant',
      metaDescription: 'Experience fresh, locally-sourced cuisine with stunning ocean views at Seabreeze Kitchen.',
      metaKeywords: 'restaurant, farm-to-table, ocean view, fresh cuisine, local food',
      facebookUrl: 'https://facebook.com/seabreezekitchen',
      instagramUrl: 'https://instagram.com/seabreezekitchen',
      twitterUrl: 'https://twitter.com/seabreezekitchen',
      openingHours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      }
    },
  });
  console.log('✅ Created restaurant settings');

  // Create unit of measure
  const cupUnit = await prisma.unitOfMeasure.upsert({
    where: { 
      name_userId: {
        name: 'Cup',
        userId: testUser.id
      }
    },
    update: {},
    create: {
      name: 'Cup',
      abbreviation: 'cup',
      type: 'VOLUME',
      userId: testUser.id,
    },
  });

  const ozUnit = await prisma.unitOfMeasure.upsert({
    where: { 
      name_userId: {
        name: 'Ounce',
        userId: testUser.id
      }
    },
    update: {},
    create: {
      name: 'Ounce',
      abbreviation: 'oz',
      type: 'WEIGHT',
      userId: testUser.id,
    },
  });

  const lbUnit = await prisma.unitOfMeasure.upsert({
    where: { 
      name_userId: {
        name: 'Pound',
        userId: testUser.id
      }
    },
    update: {},
    create: {
      name: 'Pound',
      abbreviation: 'lb',
      type: 'WEIGHT',
      userId: testUser.id,
    },
  });

  console.log('✅ Created units of measure');

  // Create some test ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: {
        name_userId: {
          name: 'Tomato',
          userId: testUser.id
        }
      },
      update: {},
      create: {
        name: 'Tomato',
        userId: testUser.id,
      },
    }),
    prisma.ingredient.upsert({
      where: {
        name_userId: {
          name: 'Basil',
          userId: testUser.id
        }
      },
      update: {},
      create: {
        name: 'Basil',
        userId: testUser.id,
      },
    }),
    prisma.ingredient.upsert({
      where: {
        name_userId: {
          name: 'Olive Oil',
          userId: testUser.id
        }
      },
      update: {},
      create: {
        name: 'Olive Oil',
        userId: testUser.id,
      },
    }),
  ]);
  console.log(`✅ Created ${ingredients.length} test ingredients`);

  // Create a test recipe
  const recipe = await prisma.recipe.create({
    data: {
      name: 'Caprese Salad',
      description: 'Fresh mozzarella, tomatoes, and basil',
      instructions: '1. Slice tomatoes and mozzarella\n2. Arrange on plate\n3. Add basil leaves\n4. Drizzle with olive oil',
      prepTimeMinutes: 10,
      cookTimeMinutes: 0,
      userId: testUser.id,
      categoryId: null,
      tags: ['vegetarian', 'salad', 'appetizer'],
    },
  });
  console.log('✅ Created test recipe:', recipe.name);

  // Create a test menu
  const menu = await prisma.menu.create({
    data: {
      name: 'Summer Menu',
      title: 'Summer Specials',
      subtitle: 'Fresh seasonal offerings',
      richTextEnabled: true,
      userId: testUser.id,
    },
  });
  console.log('✅ Created test menu:', menu.name);

  // Create restaurant staff relationship
  await prisma.restaurantStaff.create({
    data: {
      userId: testUser.id,
      restaurantId: restaurant.id,
      role: 'OWNER',
      isActive: true,
    },
  });
  console.log('✅ Linked user as restaurant owner');

  console.log('🎉 Local database seed completed!');
  console.log('\nYou can log in with:');
  console.log('Email: test@example.com');
  console.log('Password: testpassword');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 