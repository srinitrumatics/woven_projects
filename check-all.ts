import 'dotenv/config';
import { db } from './db';
import { users, userSalesforceProfiles } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkAll() {
  try {
    const allUsers = await db.select().from(users);
    console.log('--- Users ---');
    for (const u of allUsers) {
      const [profile] = await db.select().from(userSalesforceProfiles).where(eq(userSalesforceProfiles.userId, u.id));
      console.log(`- ${u.email} (ID: ${u.id}) -> ContactID: ${profile?.contactId || 'None'}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkAll();
