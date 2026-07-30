import 'dotenv/config';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkAll() {
  try {
    const allUsers = await db.select().from(users);
    console.log('--- Users ---');
    for (const u of allUsers) {
      console.log(`- ${u.email} (ID: ${u.id})`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkAll();
