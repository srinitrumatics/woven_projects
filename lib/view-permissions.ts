import { db } from '../db';
import { permissionGroups, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';

async function viewPermissions() {
  try {
    // Get all permission groups with their permissions
    const groups = await db.select().from(permissionGroups);

    for (const group of groups) {
      const groupPermissions = await db
        .select()
        .from(permissions)
        .where(eq(permissions.groupId, group.id));

      for (const perm of groupPermissions) {}
    }
  } catch (error) {
    console.error('Error viewing permissions:', error);
  }
}

// Run the viewing function if this file is executed directly
if (require.main === module) {
  viewPermissions();
}

export { viewPermissions };