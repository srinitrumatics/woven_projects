// lib/session.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../db';
import { users, userRoles, roles, rolePermissions, permissions, userOrganizations, organizations, userSalesforceProfiles } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// Interface for current user with permissions
export interface CurrentUser {
  id: string; // UUID as string
  name: string;
  email: string;
  role: string;
  permissions: string[];
  accountId?: string;
  Id?: string; // Contact Id
  roles: {
    id: string; // UUID as string
    name: string;
    description: string | null;
  }[];
  organizations: {
    id: string; // UUID as string
    name: string;
    description: string | null;
  }[];
}

// Get current user from session
export async function getCurrentUser(organizationId?: string): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decryptedSession = await decrypt(sessionCookie);

    if (!decryptedSession?.userId && !decryptedSession?.email) {
      return null;
    }

    // Use organization ID from session if not provided and available in session
    const orgId = organizationId || decryptedSession?.organizationId;

    const userId = decryptedSession.userId;

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, userId));

    // Get Salesforce profile if it exists (for contactId mapping)
    const [sfProfile] = await db
      .select({ contactId: userSalesforceProfiles.contactId })
      .from(userSalesforceProfiles)
      .where(eq(userSalesforceProfiles.userId, userId));

    const contactId = sfProfile?.contactId || decryptedSession.Id || decryptedSession.contact?.Id;
    const accountId = decryptedSession.accountId || decryptedSession.accounts?.[0]?.Id || decryptedSession.accounts?.[0]?.id || orgId;

    if (!user) {
      // If user not in DB, but has SF session, return fallback CurrentUser from SF data
      if (decryptedSession.email) {
        return {
          id: decryptedSession.contact?.Id || decryptedSession.userId || 'sf-user',
          name: decryptedSession.contact?.Name || decryptedSession.email,
          email: decryptedSession.email,
          role: 'USER',
          accountId: decryptedSession.accountId || decryptedSession.accounts?.[0]?.Id || decryptedSession.accounts?.[0]?.id,
          Id: decryptedSession.Id || decryptedSession.contact?.Id,
          permissions: [
            'product-list', 'product-read', 
            'inventory-list', 'inventory-read',
            'order-list', 'order-read', 'order-create', 'order-update',
            'proposal-list', 'proposal-read',
            'quote-list', 'quote-read',
            'shipment-list', 'shipment-read',
            'invoice-list', 'invoice-read',
            'report-list', 'report-read',
            'location-list', 'location-read', 'location-create', 'location-update'
          ],
          roles: [],
          organizations: decryptedSession.accounts?.map((a: any) => ({
            id: a.Id || a.id,
            name: a.Name || 'Account',
            description: null
          })) || []
        };
      }
      return null;
    }

    // Get user's roles for the specific organization if provided
    let userRolesData;
    if (orgId) {
      // Get user's roles for the specific organization
      userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          organizationId: userRoles.organizationId
        })
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, user.id),
          eq(userRoles.organizationId, orgId)
        ));
    } else {
      // Get all user's roles across all organizations
      userRolesData = await db
        .select({
          roleId: userRoles.roleId,
          organizationId: userRoles.organizationId
        })
        .from(userRoles)
        .where(eq(userRoles.userId, user.id));
    }

    if (userRolesData.length === 0) {
      // User has no roles but exists, return user with empty permissions and organizations
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'USER', // Default role
        permissions: [],
        accountId,
        Id: contactId,
        roles: [],
        organizations: []
      };
    }

    const roleIds = userRolesData.map(ur => ur.roleId);

    // Get role details
    const rolesData = await db
      .select()
      .from(roles)
      .where(inArray(roles.id, roleIds));

    // Get all permissions for these roles within the specific organization context
    const rolePermissionsData = await db
      .select({
        permissionId: rolePermissions.permissionId,
        permissionName: permissions.name
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Extract unique permission names
    const userPermissions = Array.from(
      new Set(rolePermissionsData.map(rp => rp.permissionName))
    );

    // Get user's organizations
    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        description: organizations.description
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, user.id));

    // Get the primary role (first role, or highest priority role if defined)
    const primaryRole = rolesData[0]?.name || 'USER';

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: primaryRole,
      permissions: userPermissions,
      accountId,
      Id: contactId,
      roles: rolesData.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
      })),
      organizations: userOrgs
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  console.log('called requireAuth, session cookie exists:', !!sessionCookie);

  if (!sessionCookie) {
    redirect('/auth');
  }

  const user = await getSFSession(sessionCookie);
  if (!user || !user.email) {
    redirect('/auth');
  }

  return user;
}

// Create a new Salesforce session
export async function createSFSession(payload: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = { ...payload, expires };
  const session = await encrypt(sessionData);
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

// Get the Salesforce session payload
export async function getSFSession(sessionCookie: string) {
  try {
    return await decrypt(sessionCookie);
  } catch (error) {
    return null;
  }
}


// Encrypt the session
export async function encrypt(payload: any) {
  // In a real app, use a robust encryption library like iron-session or jose
  return JSON.stringify(payload);
}

// Get user data by ID (used during login to get complete user info)
export async function getUserById(userId: string, organizationId?: string): Promise<CurrentUser | null> {
  // Get user from database
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return null;
  }

  // Get user's roles for the specific organization if provided
  let userRolesData;
  if (organizationId) {
    // Get user's roles for the specific organization
    userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        organizationId: userRoles.organizationId
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, user.id),
        eq(userRoles.organizationId, organizationId)
      ));
  } else {
    // Get all user's roles across all organizations
    userRolesData = await db
      .select({
        roleId: userRoles.roleId,
        organizationId: userRoles.organizationId
      })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));
  }

  if (userRolesData.length === 0) {
    // User has no roles but exists, return user with empty permissions and organizations
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'USER', // Default role
      permissions: [],
      roles: [],
      organizations: []
    };
  }

  const roleIds = userRolesData.map(ur => ur.roleId);

  // Get role details
  const rolesData = await db
    .select()
    .from(roles)
    .where(inArray(roles.id, roleIds));

  // Get all permissions for these roles within the specific organization context
  const rolePermissionsData = await db
    .select({
      permissionId: rolePermissions.permissionId,
      permissionName: permissions.name
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds));

  // Extract unique permission names
  const userPermissions = Array.from(
    new Set(rolePermissionsData.map(rp => rp.permissionName))
  );

  // Get user's organizations
  const userOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      description: organizations.description
    })
    .from(userOrganizations)
    .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
    .where(eq(userOrganizations.userId, user.id));

  // Get the primary role (first role, or highest priority role if defined)
  const primaryRole = rolesData[0]?.name || 'USER';

  // Get Salesforce profile if it exists (for contactId mapping)
  const [sfProfile] = await db
    .select({ contactId: userSalesforceProfiles.contactId })
    .from(userSalesforceProfiles)
    .where(eq(userSalesforceProfiles.userId, userId));

  const contactId = sfProfile?.contactId || '';
  const accountId = organizationId || '';

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: primaryRole,
    permissions: userPermissions,
    accountId,
    Id: contactId,
    roles: rolesData.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description
    })),
    organizations: userOrgs
  };
}

// Delete a session (logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Decrypt the session
export async function decrypt(session: string) {
  // In a real app, use a robust decryption library that matches the encryption
  try {
    const parsed = JSON.parse(session);
    // Ensure backward compatibility with old session format
    if (parsed.hasOwnProperty('userId') && !parsed.hasOwnProperty('organizationId')) {
      // Old format: { userId, expires } - set organizationId to undefined
      return { ...parsed, organizationId: undefined };
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}