# RBAC (Role-Based Access Control) System

This document describes the Role-Based Access Control system implemented using Drizzle ORM in the Client Partner Portal application.

## Overview

The RBAC system provides fine-grained access control through a three-tiered approach:
- **Users**: Individuals who interact with the system
- **Roles**: Collections of permissions that can be assigned to users
- **Permissions**: Specific actions that can be performed within the system

## Database Schema

The system consists of 5 tables:

### users
- `id`: Unique identifier for each user
- `name`: User's full name
- `email`: User's email address (unique)
- `password`: Hashed password
- `created_at`: Timestamp when the user was created
- `updated_at`: Timestamp when the user was last updated

### roles
- `id`: Unique identifier for each role
- `name`: Name of the role
- `description`: Description of the role
- `created_at`: Timestamp when the role was created
- `updated_at`: Timestamp when the role was last updated

### permissions
- `id`: Unique identifier for each permission
- `name`: Name of the permission (e.g., 'create_user', 'delete_role')
- `description`: Description of the permission
- `created_at`: Timestamp when the permission was created
- `updated_at`: Timestamp when the permission was last updated

### user_roles (junction table)
- `user_id`: Reference to the user
- `role_id`: Reference to the role
- Establishes the many-to-many relationship between users and roles

### role_permissions (junction table)
- `role_id`: Reference to the role
- `permission_id`: Reference to the permission
- Establishes the many-to-many relationship between roles and permissions

## Services

### User Service (`lib/user-service.ts`)

- `createUser(userData)`: Creates a new user with hashed password
- `updateUser(id, userData)`: Updates an existing user
- `deleteUser(id)`: Deletes a user
- `getAllUsers()`: Gets all users (without passwords)
- `getUserById(id)`: Gets a user by ID (without password)
- `getUserByEmail(email)`: Gets a user by email (without password)
- `assignRolesToUser(userId, roleIds)`: Assigns roles to a user
- `removeRolesFromUser(userId, roleIds)`: Removes roles from a user
- `getUserRoles(userId)`: Gets all roles assigned to a user
- `getUserPermissions(userId)`: Gets all permissions for a user (through their roles)
- `userHasPermission(userId, permissionName)`: Checks if a user has a specific permission

### Role Service (`lib/role-service.ts`)

- `createRole(roleData)`: Creates a new role
- `updateRole(id, roleData)`: Updates an existing role
- `deleteRole(id)`: Deletes a role and its associations
- `getAllRoles()`: Gets all roles
- `getRoleById(id)`: Gets a role by ID
- `assignPermissionsToRole(roleId, permissionIds)`: Assigns permissions to a role
- `getRolePermissions(roleId)`: Gets all permissions assigned to a role

### Permission Service (`lib/permission-service.ts`)

- `createPermission(permissionData)`: Creates a new permission
- `updatePermission(id, permissionData)`: Updates an existing permission
- `deletePermission(id)`: Deletes a permission
- `getAllPermissions()`: Gets all permissions
- `getPermissionById(id)`: Gets a permission by ID
- `getPermissionByName(name)`: Gets a permission by name

## Usage Examples

### Creating a New Role with Permissions

```typescript
import { createRole, assignPermissionsToRole } from '../lib/role-service';
import { createPermission } from '../lib/permission-service';

// Create permissions
const viewPermission = await createPermission({
  name: 'view_reports',
  description: 'Ability to view reports'
});

const editPermission = await createPermission({
  name: 'edit_reports',
  description: 'Ability to edit reports'
});

// Create a role
const reporterRole = await createRole({
  name: 'Report Editor',
  description: 'Can view and edit reports'
});

// Assign permissions to the role
await assignPermissionsToRole(reporterRole.id, [
  viewPermission.id,
  editPermission.id
]);
```

### Assigning a Role to a User

```typescript
import { createUser, assignRolesToUser } from '../lib/user-service';

// Create a user
const user = await createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword'
});

// Assign the 'Report Editor' role to the user
await assignRolesToUser(user.id, [reporterRole.id]);
```

### Checking User Permissions

```typescript
import { userHasPermission } from '../lib/user-service';

// Check if user can edit reports
const canEditReports = await userHasPermission(user.id, 'edit_reports');
if (canEditReports) {
  // Allow user to edit reports
} else {
  // Deny access
}
```

## Security Considerations

- Passwords are automatically hashed using bcrypt before storage
- User functions that return user data exclude the password field for security
- Proper foreign key constraints ensure data integrity
- All database operations include error handling

## Environment Variables

The system requires the following environment variables:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Database Migrations

To generate and apply database migrations:

```bash
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations to the database
```