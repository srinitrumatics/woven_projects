import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { createSFSession } from '@/lib/session';

export async function adminLoginWithPostgres(email: string, password: string) {
  // Authenticate via Postgres users table
  const userResult = await db.select().from(users).where(eq(users.email, email));
  
  if (userResult.length === 0) {
    return { success: false, error: 'Invalid admin credentials' };
  }

  const user = userResult[0];

  // Verify password using bcrypt
  const isPasswordValid = await compare(password, user.password);
  
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid admin credentials' };
  }

  // Assign "Admin" role directly without using roles table
  const sessionPayload = {
    email: user.email,
    userId: user.id,
    Id: user.id,
    contact: {
      Id: user.id,
      Name: user.name,
      Email: user.email
    },
    accounts: [],
    role: 'Super Admin' // This ensures the session handler recognizes the user as admin
  };

  await createSFSession(sessionPayload);

  return { 
    success: true, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'Super Admin',
    }
  };
}
