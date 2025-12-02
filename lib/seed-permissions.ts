import { db } from '../db';
import { permissionGroups, permissions } from '../db/schema';
import { eq, and, ilike } from 'drizzle-orm';

async function seedPermissions() {
  console.log('Seeding permission groups and permissions...');

  try {
    // Define the main menu groups
    const menuGroups = [
      { name: 'Dashboard', description: 'Dashboard related permissions' },
      { name: 'Product Management', description: 'Product related permissions' },
      { name: 'Order Management', description: 'Order related permissions' },
      { name: 'Proposal Management', description: 'Proposal related permissions' },
      { name: 'Quote Management', description: 'Quote related permissions' },
      { name: 'Invoice Management', description: 'Invoice related permissions' },
      { name: 'Shipment Management', description: 'Shipment related permissions' },
      { name: 'Inventory Management', description: 'Inventory related permissions' },
      { name: 'Report Management', description: 'Report related permissions' },
      { name: 'Admin Management', description: 'Admin related permissions' },
    ];

    // CRUDL operations
    const operations = [
      { name: 'create', description: 'Create new items' },
      { name: 'read', description: 'View/Read items' },
      { name: 'update', description: 'Update existing items' },
      { name: 'delete', description: 'Delete items' },
      { name: 'list', description: 'List all items' }
    ];

    // First, create all permission groups
    for (const group of menuGroups) {
      // Check if group already exists using a simple select
      const existingGroups = await db
        .select()
        .from(permissionGroups)
        .where(eq(permissionGroups.name, group.name));

      const existingGroup = existingGroups[0];

      if (!existingGroup) {
        const [newGroup] = await db
          .insert(permissionGroups)
          .values({
            name: group.name,
            description: group.description,
          })
          .returning();

        console.log(`Created permission group: ${newGroup.name}`);

        // For the Admin group, create specific permissions instead of generic CRUDL
        if (group.name === 'Admin Management') {
          const adminPermissions = [
            { name: 'user-management', description: 'Manage users' },
            { name: 'role-management', description: 'Manage roles' },
            { name: 'permission-management', description: 'Manage permissions' }
          ];

          for (const perm of adminPermissions) {
            await db
              .insert(permissions)
              .values({
                name: perm.name,
                description: perm.description,
                groupId: newGroup.id,
              });
          }
          console.log(`  Added admin-specific permissions`);
        } else {
          // For other groups, add CRUDL operations
          for (const operation of operations) {
            const permissionName = `${group.name.split(' ')[0].toLowerCase()}-${operation.name}`;
            const permissionDescription = `${operation.description} for ${group.name.replace(' Management', '')}`;

            await db
              .insert(permissions)
              .values({
                name: permissionName,
                description: permissionDescription,
                groupId: newGroup.id,
              });
          }
          console.log(`  Added CRUDL permissions for ${group.name}`);
        }
      } else {
        console.log(`Permission group already exists: ${group.name}`);
      }
    }

    console.log('Permission seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedPermissions();
}

export { seedPermissions };