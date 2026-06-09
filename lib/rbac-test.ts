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
    const createPermissionResult = await createPermission({
      name: 'create_user',
      description: 'Ability to create new users'
    });

    const deletePermissionResult = await createPermission({
      name: 'delete_user',
      description: 'Ability to delete users'
    });

    const viewDashboardPermissionResult = await createPermission({
      name: 'view_dashboard',
      description: 'Ability to view the dashboard'
    });
    const adminRole = await createRole({
      name: 'Administrator',
      description: 'Full system access'
    });

    const editorRole = await createRole({
      name: 'Editor',
      description: 'Can edit content but not manage users'
    });
    await assignPermissionsToRole(adminRole.id, [createPermissionResult.id, deletePermissionResult.id, viewDashboardPermissionResult.id]);

    await assignPermissionsToRole(editorRole.id, [viewDashboardPermissionResult.id]);
    const testOrganization = await createOrganization({
      name: 'Test Organization',
      description: 'Organization for RBAC testing'
    });
    const adminUser = await createUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'securePassword123'
    });

    const editorUser = await createUser({
      name: 'Editor User',
      email: 'editor@example.com',
      password: 'securePassword123'
    });
    await assignRolesToUser(adminUser.id, [adminRole.id], testOrganization.id); // Admin gets admin role in test org

    await assignRolesToUser(editorUser.id, [editorRole.id], testOrganization.id); // Editor gets editor role in test org
    const adminHasCreatePermission = await userHasPermission(adminUser.id, 'create_user');

    const editorHasCreatePermission = await userHasPermission(editorUser.id, 'create_user');

    const editorHasViewPermission = await userHasPermission(editorUser.id, 'view_dashboard');
    const adminRoles = await getUserRoles(adminUser.id);

    const adminPermissions = await getUserPermissions(adminUser.id);

    const editorRoles = await getUserRoles(editorUser.id);

    const editorPermissions = await getUserPermissions(editorUser.id);
  } catch (error) {
    console.error('Error during RBAC system test:', error);
  }
}

// If this file is run directly, execute the test
if (require.main === module) {
  testRBACSystem();
}