# RBAC UI Components

This directory contains the user interface components for Role-Based Access Control (RBAC) management in the Client Partner Portal.

## Components Structure

```
app/admin/rbac/
├── layout.tsx          # Main RBAC layout with navigation
├── page.tsx            # RBAC dashboard page
├── users/
│   └── page.tsx        # User management interface
├── roles/
│   └── page.tsx        # Role management interface
└── permissions/
    └── page.tsx        # Permission management interface
```

## Available Pages

### Dashboard (`/admin/rbac`)
- Overview of RBAC system
- Quick links to user, role, and permission management

### User Management (`/admin/rbac/users`)
- Create, update, delete users
- Assign roles to users
- View user roles

### Role Management (`/admin/rbac/roles`)
- Create, update, delete roles
- Assign permissions to roles
- View role permissions

### Permission Management (`/admin/rbac/permissions`)
- Create, update, delete permissions
- View permissions

## API Routes

The UI components interact with the following API routes:

```
/api/rbac/
├── users/
│   ├── GET     # Get all users
│   ├── POST    # Create a user
│   └── [id]/
│       ├── GET # Get specific user
│       ├── PUT # Update user
│       ├── DELETE # Delete user
│       └── roles/
│           ├── GET # Get user's roles
│           └── POST # Assign roles to user
├── roles/
│   ├── GET     # Get all roles
│   ├── POST    # Create a role
│   └── [id]/
│       ├── GET # Get specific role
│       ├── PUT # Update role
│       ├── DELETE # Delete role
│       └── permissions/
│           └── POST # Assign permissions to role
└── permissions/
    ├── GET     # Get all permissions
    ├── POST    # Create a permission
    └── [id]/
        ├── GET # Get specific permission
        ├── PUT # Update permission
        └── DELETE # Delete permission
```

## Running the Application

To run the application with RBAC UI:

```bash
npm run dev
```

Then navigate to `http://localhost:3000/admin/rbac` to access the RBAC dashboard.

## Testing

To run the RBAC system test:

```bash
npm run test:rbac
```

This will execute a comprehensive test of the RBAC functionality including:
- Creating permissions
- Creating roles
- Creating users
- Assigning roles to users
- Verifying permissions

## Dependencies

- Next.js 15+
- React 19+
- Drizzle ORM
- Lucide React icons
- TypeScript

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```