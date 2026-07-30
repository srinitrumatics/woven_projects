import 'dotenv/config';
import { db } from '../db';
import { users, organizations, userOrganizations, userRoles, roles } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function seedUsers() {
  try {
    console.log('Starting database seeding...');

    // 1. Get default organization (LocalInfinity)
    const orgs = await db.select().from(organizations);
    if (orgs.length === 0) {
      console.error('❌ Error: No organization found in the database. Please create an organization first.');
      process.exit(1);
    }
    const defaultOrg = orgs[0];
    console.log(`Using organization: ${defaultOrg.name} (${defaultOrg.id})`);

    // 2. Get roles
    const dbRoles = await db.select().from(roles);
    const superAdminRole = dbRoles.find(r => r.name.toLowerCase() === 'super admin');

    if (!superAdminRole) {
      console.error('❌ Error: Required role "Super Admin" not found in database.');
      process.exit(1);
    }

    // 3. Define users to seed (Only admin user)
    const adminPasswordHash = await hash('Password@1234', 10);
    const u = {
      email: 'admin@admin.com',
      name: 'admin',
      role: superAdminRole,
      contactId: process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID || '003RL00001RXyq9YAD'
    };

    console.log(`Seeding user: ${u.email}...`);

    // A. Insert or update user (always hash new password if updating/inserting)
    let userId: string;
    const existingUsers = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    
    if (existingUsers.length === 0) {
      const [insertedUser] = await db.insert(users).values({
        name: u.name,
        email: u.email,
        password: adminPasswordHash,
      }).returning();
      userId = insertedUser.id;
      console.log(`✅ Created user ${u.email} (ID: ${userId})`);
    } else {
      userId = existingUsers[0].id;
      // Update password to match "Password@1234"
      await db.update(users)
        .set({ password: adminPasswordHash, name: u.name })
        .where(eq(users.id, userId));
      console.log(`✅ Updated existing user ${u.email} (ID: ${userId}) with new password`);
    }

    // B. Link user to organization in userOrganizations table
    const existingUserOrg = await db.select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, defaultOrg.id)
        )
      )
      .limit(1);

    if (existingUserOrg.length === 0) {
      await db.insert(userOrganizations).values({
        userId,
        organizationId: defaultOrg.id,
      });
      console.log(`✅ Linked user to organization: ${defaultOrg.name}`);
    } else {
      console.log(`ℹ️ User already linked to organization: ${defaultOrg.name}`);
    }

    // C. Assign role to user in userRoles table
    const existingUserRole = await db.select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, u.role.id),
          eq(userRoles.organizationId, defaultOrg.id)
        )
      )
      .limit(1);

    if (existingUserRole.length === 0) {
      await db.insert(userRoles).values({
        userId,
        roleId: u.role.id,
        organizationId: defaultOrg.id,
      });
      console.log(`✅ Assigned role: ${u.role.name}`);
    } else {
      console.log(`ℹ️ Role ${u.role.name} already assigned to user`);
    }


    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
