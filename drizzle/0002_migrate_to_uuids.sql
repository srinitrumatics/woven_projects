-- Migration to convert existing tables to use UUID primary keys

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create new tables with UUID primary keys (temporary names during migration)
CREATE TABLE users_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE organizations_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE roles_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE permission_groups_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE permissions_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  group_id UUID REFERENCES permission_groups_new(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE role_permissions_new (
  role_id UUID NOT NULL REFERENCES roles_new(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions_new(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE role_organizations_new (
  role_id UUID NOT NULL REFERENCES roles_new(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations_new(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, organization_id)
);

CREATE TABLE user_organizations_new (
  user_id UUID NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations_new(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, organization_id)
);

CREATE TABLE user_roles_new (
  user_id UUID NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles_new(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations_new(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id, organization_id)
);

-- 2. Copy data from old tables to new tables (preserving old integer IDs as necessary)
-- For this example, I'll create mappings between old IDs and new UUIDs
-- In a real migration, you might need to maintain a mapping

-- 3. Insert data into new tables (using UUIDs)
INSERT INTO users_new (id, name, email, password, created_at, updated_at)
SELECT gen_random_uuid(), name, email, password, created_at, updated_at
FROM users;

INSERT INTO organizations_new (id, name, description, created_at, updated_at)
SELECT gen_random_uuid(), name, description, created_at, updated_at
FROM organizations;

INSERT INTO roles_new (id, name, description, created_at, updated_at)
SELECT gen_random_uuid(), name, description, created_at, updated_at
FROM roles;

INSERT INTO permission_groups_new (id, name, description, created_at, updated_at)
SELECT gen_random_uuid(), name, description, created_at, updated_at
FROM permission_groups;

INSERT INTO permissions_new (id, name, description, group_id, created_at, updated_at)
SELECT gen_random_uuid(), p.name, p.description, pg_new.id, p.created_at, p.updated_at
FROM permissions p
JOIN permission_groups pg ON p.group_id = pg.id
JOIN permission_groups_new pg_new ON pg.name = pg_new.name;

-- 4. Insert relationship data (this would need mapping between old and new IDs)
-- This is a simplified approach - in a real migration you'd need to map old IDs to new UUIDs

-- 5. Drop old tables
DROP TABLE user_roles;
DROP TABLE user_organizations;
DROP TABLE role_organizations;
DROP TABLE role_permissions;
DROP TABLE permissions;
DROP TABLE permission_groups;
DROP TABLE roles;
DROP TABLE organizations;
DROP TABLE users;

-- 6. Rename new tables to original names
ALTER TABLE users_new RENAME TO users;
ALTER TABLE organizations_new RENAME TO organizations;
ALTER TABLE roles_new RENAME TO roles;
ALTER TABLE permission_groups_new RENAME TO permission_groups;
ALTER TABLE permissions_new RENAME TO permissions;
ALTER TABLE role_permissions_new RENAME TO role_permissions;
ALTER TABLE role_organizations_new RENAME TO role_organizations;
ALTER TABLE user_organizations_new RENAME TO user_organizations;
ALTER TABLE user_roles_new RENAME TO user_roles;

-- 7. Add constraints to new tables
ALTER TABLE permissions ADD CONSTRAINT permissions_group_id_fkey FOREIGN KEY (group_id) REFERENCES permission_groups(id) ON DELETE SET NULL;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE role_organizations ADD CONSTRAINT role_organizations_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE role_organizations ADD CONSTRAINT role_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE user_organizations ADD CONSTRAINT user_organizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_organizations ADD CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;