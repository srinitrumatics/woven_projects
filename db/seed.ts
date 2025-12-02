import { db } from './index';
import { users, organizations, roles, userRoles, permissions, permissionGroups, userOrganizations } from './schema_uuid'; // Use the new schema file
import { hash } from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create permission groups
    const userManagementGroup = await db
      .insert(permissionGroups)
      .values({ name: 'User Management', description: 'Permissions related to user management' })
      .returning({ id: permissionGroups.id });

    const orderManagementGroup = await db
      .insert(permissionGroups)
      .values({ name: 'Order Management', description: 'Permissions related to order management' })
      .returning({ id: permissionGroups.id });

    // Create permissions
    const permissionsToInsert = [
      // User Management Permissions
      { name: 'user-list', description: 'List users', groupId: userManagementGroup[0].id },
      { name: 'user-create', description: 'Create users', groupId: userManagementGroup[0].id },
      { name: 'user-update', description: 'Update users', groupId: userManagementGroup[0].id },
      { name: 'user-delete', description: 'Delete users', groupId: userManagementGroup[0].id },
      
      // Order Management Permissions
      { name: 'order-list', description: 'List orders', groupId: orderManagementGroup[0].id },
      { name: 'order-create', description: 'Create orders', groupId: orderManagementGroup[0].id },
      { name: 'order-update', description: 'Update orders', groupId: orderManagementGroup[0].id },
      { name: 'order-delete', description: 'Delete orders', groupId: orderManagementGroup[0].id },
    ];

    const insertedPermissions = await db
      .insert(permissions)
      .values(permissionsToInsert)
      .returning({ id: permissions.id, name: permissions.name });

    // Create organizations
    const orgsToInsert = [
      { name: 'Main Organization', description: 'The main organization' },
      { name: 'Secondary Organization', description: 'A secondary organization' },
    ];

    const insertedOrgs = await db
      .insert(organizations)
      .values(orgsToInsert)
      .returning({ id: organizations.id, name: organizations.name });

    // Create roles
    const rolesToInsert = [
      { name: 'SUPER_ADMIN', description: 'Super administrator with all permissions' },
      { name: 'ADMIN', description: 'Administrator with most permissions' },
      { name: 'USER', description: 'Regular user with limited permissions' },
    ];

    const insertedRoles = await db
      .insert(roles)
      .values(rolesToInsert)
      .returning({ id: roles.id, name: roles.name });

    // Create a sample user
    const hashedPassword = await hash('password123', 10);
    const sampleUser = await db
      .insert(users)
      .values({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      })
      .returning({ id: users.id, email: users.email });

    // Assign user to organizations
    await db
      .insert(userOrganizations)
      .values([
        { userId: sampleUser[0].id, organizationId: insertedOrgs[0].id },
        { userId: sampleUser[0].id, organizationId: insertedOrgs[1].id },
      ]);

    // Assign roles to user
    // Assign SUPER_ADMIN role to first organization
    await db
      .insert(userRoles)
      .values({
        userId: sampleUser[0].id,
        roleId: insertedRoles[0].id, // SUPER_ADMIN
        organizationId: insertedOrgs[0].id,
      });

    // Assign USER role to second organization  
    await db
      .insert(userRoles)
      .values({
        userId: sampleUser[0].id,
        roleId: insertedRoles[2].id, // USER
        organizationId: insertedOrgs[1].id,
      });

    console.log('Database seeding completed successfully!');
    console.log(`Created ${insertedOrgs.length} organizations`);
    console.log(`Created ${insertedRoles.length} roles`);
    console.log(`Created ${insertedPermissions.length} permissions`);
    console.log(`Created 1 sample user: ${sampleUser[0].email}`);
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };