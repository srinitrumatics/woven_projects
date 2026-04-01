import 'dotenv/config';
import { db } from './db';
import { users } from './db/schema';

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log('Total users in DB:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
    });
  } catch (err) {
    console.error('Error checking users:', err);
  } finally {
    process.exit();
  }
}

checkUsers();
