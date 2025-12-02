import { createUser, getUserById, assignRolesToUser, getUserRoles, getUserPermissions, userHasPermission } from './user-service';
import { createRole, getRoleById, assignPermissionsToRole } from './role-service';
import { createPermission, getPermissionById } from './permission-service';
import { createOrganization } from './organization-service';
import { db } from '../db';

/**
 * Test function to demonstrate the RBAC (Role-Based Access Control) system
 */
export async function testRBACSystem() {
  try {
    console.log('Starting RBAC system test...');

    // Step 1: Create permissions
    console.log('\n1. Creating permissions...');
    const createPermissionResult = await createPermission({
      name: 'create_user',
      description: 'Ability to create new users'
    });
    console.log(`Created permission: ${createPermissionResult.name}`);

    const deletePermissionResult = await createPermission({
      name: 'delete_user',
      description: 'Ability to delete users'
    });
    console.log(`Created permission: ${deletePermissionResult.name}`);

    const viewDashboardPermissionResult = await createPermission({
      name: 'view_dashboard',
      description: 'Ability to view the dashboard'
    });
    console.log(`Created permission: ${viewDashboardPermissionResult.name}`);

    // Step 2: Create roles
    console.log('\n2. Creating roles...');
    const adminRole = await createRole({
      name: 'Administrator',
      description: 'Full system access'
    });
    console.log(`Created role: ${adminRole.name}`);

    const editorRole = await createRole({
      name: 'Editor',
      description: 'Can edit content but not manage users'
    });
    console.log(`Created role: ${editorRole.name}`);

    // Step 3: Assign permissions to roles
    console.log('\n3. Assigning permissions to roles...');
    await assignPermissionsToRole(adminRole.id, [createPermissionResult.id, deletePermissionResult.id, viewDashboardPermissionResult.id]);
    console.log(`Assigned all permissions to ${adminRole.name} role`);

    await assignPermissionsToRole(editorRole.id, [viewDashboardPermissionResult.id]);
    console.log(`Assigned view dashboard permission to ${editorRole.name} role`);

    // Step 4: Create an organization for testing
    console.log('\n4. Creating organization...');
    const testOrganization = await createOrganization({
      name: 'Test Organization',
      description: 'Organization for RBAC testing'
    });
    console.log(`Created organization: ${testOrganization.name}`);

    // Step 5: Create users
    console.log('\n5. Creating users...');
    const adminUser = await createUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'securePassword123'
    });
    console.log(`Created user: ${adminUser.name}`);

    const editorUser = await createUser({
      name: 'Editor User',
      email: 'editor@example.com',
      password: 'securePassword123'
    });
    console.log(`Created user: ${editorUser.name}`);

    // Step 6: Assign roles to users
    console.log('\n6. Assigning roles to users...');
    await assignRolesToUser(adminUser.id, [adminRole.id], testOrganization.id); // Admin gets admin role in test org
    console.log(`Assigned ${adminRole.name} role to ${adminUser.name} in ${testOrganization.name}`);

    await assignRolesToUser(editorUser.id, [editorRole.id], testOrganization.id); // Editor gets editor role in test org
    console.log(`Assigned ${editorRole.name} role to ${editorUser.name} in ${testOrganization.name}`);

    // Step 7: Test user permissions
    console.log('\n7. Testing user permissions...');
    const adminHasCreatePermission = await userHasPermission(adminUser.id, 'create_user');
    console.log(`${adminUser.name} has 'create_user' permission: ${adminHasCreatePermission}`);

    const editorHasCreatePermission = await userHasPermission(editorUser.id, 'create_user');
    console.log(`${editorUser.name} has 'create_user' permission: ${editorHasCreatePermission}`);

    const editorHasViewPermission = await userHasPermission(editorUser.id, 'view_dashboard');
    console.log(`${editorUser.name} has 'view_dashboard' permission: ${editorHasViewPermission}`);

    // Step 8: Get user roles and permissions
    console.log('\n8. Fetching user roles and permissions...');
    const adminRoles = await getUserRoles(adminUser.id);
    console.log(`${adminUser.name} roles:`, adminRoles.map(r => r.roleName));

    const adminPermissions = await getUserPermissions(adminUser.id);
    console.log(`${adminUser.name} permissions:`, adminPermissions.map(p => p.permissionName));

    const editorRoles = await getUserRoles(editorUser.id);
    console.log(`${editorUser.name} roles:`, editorRoles.map(r => r.roleName));

    const editorPermissions = await getUserPermissions(editorUser.id);
    console.log(`${editorUser.name} permissions:`, editorPermissions.map(p => p.permissionName));

    console.log('\nRBAC system test completed successfully!');
  } catch (error) {
    console.error('Error during RBAC system test:', error);
  }
}

// If this file is run directly, execute the test
if (require.main === module) {
  testRBACSystem();
}