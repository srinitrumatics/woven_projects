import 'dotenv/config';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function resetPassword() {
  const email = 'admin@admin.com';
  const newPassword = 'password123';
  
  try {
    console.log(`Resetting password for ${email}...`);
    const hashedPassword = await hash(newPassword, 10);
    
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email))
      .returning();
      
    if (result.length > 0) {
      console.log(`Successfully reset password for ${email} to ${newPassword}`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    process.exit();
  }
}

resetPassword();
