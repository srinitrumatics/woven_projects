import { db } from '../db';
import { permissionGroups, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';

async function viewPermissions() {
  console.log('Viewing permission groups and permissions...\n');

  try {
    // Get all permission groups with their permissions
    const groups = await db.select().from(permissionGroups);
    
    for (const group of groups) {
      console.log(`Group: ${group.name}`);
      console.log(`Description: ${group.description}`);
      
      const groupPermissions = await db
        .select()
        .from(permissions)
        .where(eq(permissions.groupId, group.id));
      
      console.log('Permissions:');
      for (const perm of groupPermissions) {
        console.log(`  - ${perm.name}: ${perm.description}`);
      }
      console.log(''); // Empty line for readability
    }
    
    console.log('Permission view completed successfully!');
  } catch (error) {
    console.error('Error viewing permissions:', error);
  }
}

// Run the viewing function if this file is executed directly
if (require.main === module) {
  viewPermissions();
}

export { viewPermissions };