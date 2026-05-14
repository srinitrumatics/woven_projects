import { getCategoryFromAccountType, PERMISSIONS_BY_CATEGORY } from './permissions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// lib/session.ts
export interface CurrentUser {
  id: string; // UUID as string
  name: string;
  email: string;
  role: string;
  permissions: string[];
  accountId?: string;
  Id?: string; // Contact Id
  user_details?: any;
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
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decryptedSession = await decrypt(sessionCookie);

    if (!decryptedSession?.email) {
      return null;
    }

    // Check if this is a Postgres admin user
    if (decryptedSession.role === 'Super Admin' || decryptedSession.role === 'Admin') {
      return {
        id: decryptedSession.Id || decryptedSession.userId || 'admin-user',
        name: decryptedSession.contact?.Name || decryptedSession.email,
        email: decryptedSession.email,
        role: decryptedSession.role,
        permissions: ['ALL_ACCESS'],
        accountId: undefined,
        Id: decryptedSession.Id || decryptedSession.userId,
        user_details: decryptedSession.user_details,
        roles: [{
          id: 'admin',
          name: decryptedSession.role,
          description: 'Administrator'
        }],
        organizations: []
      };
    }

    // Get the account type to determine permissions
    // Use the first account as default or the specified accountId if present in session
    const accounts = decryptedSession.accounts || [];
    const currentAccount = accounts.find((a: any) => a.Id === decryptedSession.accountId) || accounts[0];

    const accountType = currentAccount?.Account_Record_Type__c || 'Customer';
    const category = getCategoryFromAccountType(accountType);
    const userPermissions = PERMISSIONS_BY_CATEGORY[category] || [];

    return {
      id: decryptedSession.Id || decryptedSession.userId || 'sf-user',
      name: decryptedSession.contact?.Name || decryptedSession.email,
      email: decryptedSession.email,
      role: category.toUpperCase(), // e.g. 'CUSTOMER', 'PARTNER', 'HYBRID'
      permissions: userPermissions,
      accountId: currentAccount?.Id || decryptedSession.accountId,
      Id: decryptedSession.Id || decryptedSession.contact?.Id,
      user_details: decryptedSession.user_details,
      roles: [{
        id: category,
        name: category,
        description: `Salesforce ${accountType} Role`
      }],
      organizations: accounts.map((a: any) => ({
        id: a.Id || a.id,
        name: a.Name || 'Account',
        description: a.Account_Record_Type__c || null,
        isdirect: a.isdirect || false
      }))
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

  // Minimize payload to stay within 4KB cookie limit
  const minimizedPayload = {
    email: payload.email,
    userId: payload.userId || payload.contact?.Id || payload.Id,
    accountId: payload.accountId,
    Id: payload.Id || payload.contact?.Id,
    expires,
    contact: payload.contact ? {
      Id: payload.contact.Id,
      Name: payload.contact.Name,
      Email: payload.contact.Email
    } : null,
    user_details: payload.contact || null,
    // Only store minimal account data
    accounts: Array.isArray(payload.accounts) ? payload.accounts.map((a: any) => ({
      Id: a.Id || a.id,
      Name: a.Name || a.name,
      Account_Record_Type__c: a.Account_Record_Type__c,
      isdirect: a.isdirect || false
    })) : [],
    role: payload.role || null
  };

  const session = await encrypt(minimizedPayload);
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
  // We use URL encoding to ensure special JSON characters don't break cookie storage
  return encodeURIComponent(JSON.stringify(payload));
}

// Get user data by ID (deprecated - database no longer used for users/permissions)
export async function getUserById(userId: string): Promise<CurrentUser | null> {
  return null;
}

// Delete a session (logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Decrypt the session
export async function decrypt(session: string) {
  try {
    if (!session) return null;
    let parsed;
    try {
      parsed = JSON.parse(session);
    } catch (e) {
      const decoded = session.includes('%') ? decodeURIComponent(session) : session;
      parsed = JSON.parse(decoded);
    }
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