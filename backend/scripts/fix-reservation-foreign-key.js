require('dotenv').config({ path: '.env' }); // Use production database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixReservationForeignKey() {
  console.log('🔧 Fixing reservation table foreign key constraints...\n');

  try {
    // First, check current constraint
    const currentConstraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = 'reservations' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'customer_id';
    `;

    console.log('Current constraints on reservation.customer_id:');
    console.log(currentConstraints);

    if (currentConstraints.length > 0) {
      const constraint = currentConstraints[0];
      if (constraint.foreign_table_name === 'users') {
        console.log('\n⚠️  Found incorrect foreign key constraint pointing to users table');
        
        // Drop the old constraint
        const constraintName = constraint.constraint_name;
        console.log(`Dropping constraint: ${constraintName}`);
        await prisma.$executeRawUnsafe(`ALTER TABLE reservations DROP CONSTRAINT ${constraintName};`);
        
        console.log('✅ Old constraint dropped successfully');
      }
    }

    // Check if we need to add the new constraint
    const newConstraints = await prisma.$queryRaw`
      SELECT 1 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'reservations' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'customer_id'
        AND ccu.table_name = 'customers';
    `;

    if (newConstraints.length === 0) {
      console.log('\nAdding new foreign key constraint to customers table...');
      
      // First, let's check if all customer_ids in reservations table are valid
      const invalidReservations = await prisma.$queryRaw`
        SELECT r.id, r.customer_id, r.customer_email
        FROM reservations r
        WHERE r.customer_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM customers c WHERE c.id = r.customer_id
          );
      `;

      if (invalidReservations.length > 0) {
        console.log('\n⚠️  Found reservations with invalid customer_ids:');
        console.log(invalidReservations);
        
        // Update these to NULL or find matching customer by email
        for (const reservation of invalidReservations) {
          if (reservation.customer_email) {
            const customer = await prisma.$queryRaw`
              SELECT id FROM customers WHERE email = ${reservation.customer_email} LIMIT 1;
            `;
            
            if (customer.length > 0) {
              console.log(`Updating reservation ${reservation.id} to use customer ${customer[0].id}`);
              await prisma.$executeRaw`
                UPDATE reservations 
                SET customer_id = ${customer[0].id}
                WHERE id = ${reservation.id};
              `;
            } else {
              console.log(`Setting reservation ${reservation.id} customer_id to NULL (no matching customer)`);
              await prisma.$executeRaw`
                UPDATE reservations 
                SET customer_id = NULL
                WHERE id = ${reservation.id};
              `;
            }
          } else {
            console.log(`Setting reservation ${reservation.id} customer_id to NULL (no email)`);
            await prisma.$executeRaw`
              UPDATE reservations 
              SET customer_id = NULL
              WHERE id = ${reservation.id};
            `;
          }
        }
      }

      // Now add the new constraint
      await prisma.$executeRaw`
        ALTER TABLE reservations 
        ADD CONSTRAINT reservations_customer_id_fkey 
        FOREIGN KEY (customer_id) 
        REFERENCES customers(id) 
        ON DELETE SET NULL;
      `;
      
      console.log('✅ New foreign key constraint added successfully');
    } else {
      console.log('\n✅ Foreign key constraint already points to customers table');
    }

    // Also check if user_id column allows NULL
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reservations'
        AND column_name = 'user_id';
    `;

    if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
      console.log('\n⚠️  user_id column is NOT NULL, making it nullable...');
      await prisma.$executeRaw`
        ALTER TABLE reservations 
        ALTER COLUMN user_id DROP NOT NULL;
      `;
      console.log('✅ user_id column is now nullable');
    }

    console.log('\n🎉 Foreign key fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing foreign key:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixReservationForeignKey()
  .catch(console.error)
  .finally(() => process.exit()); 