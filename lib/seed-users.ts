import 'dotenv/config';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function seedUsers() {
  try {
    console.log('Starting database seeding...');

    const adminPasswordHash = await hash('Password@1234', 10);
    const u = {
      email: 'admin@admin.com',
      name: 'admin',
    };

    console.log(`Seeding user: ${u.email}...`);

    const existingUsers = await db.select().from(users).where(eq(users.email, u.email)).limit(1);

    if (existingUsers.length === 0) {
      const [insertedUser] = await db.insert(users).values({
        name: u.name,
        email: u.email,
        password: adminPasswordHash,
      }).returning();
      console.log(`✅ Created user ${u.email} (ID: ${insertedUser.id})`);
    } else {
      const userId = existingUsers[0].id;
      await db.update(users)
        .set({ password: adminPasswordHash, name: u.name })
        .where(eq(users.id, userId));
      console.log(`✅ Updated existing user ${u.email} (ID: ${userId}) with new password`);
    }

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
