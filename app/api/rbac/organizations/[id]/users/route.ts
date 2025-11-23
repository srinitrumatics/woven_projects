// app/api/rbac/organizations/[id]/users/route.ts
import { NextRequest } from 'next/server';
import { getUsersInOrganization, assignUsersToOrganization } from '@/lib/organization-service';
import { requireAuth } from "@/lib/session";

// Get users in an organization
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const orgId = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orgId)) {
      return new Response(JSON.stringify({ error: 'Invalid organization ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const users = await getUsersInOrganization(orgId);
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching users in organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users in organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Assign users to an organization
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const orgId = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orgId)) {
      return new Response(JSON.stringify({ error: 'Invalid organization ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { userIds } = await request.json();
    if (!Array.isArray(userIds)) {
      return new Response(JSON.stringify({ error: 'userIds must be an array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Additional validation to ensure userIds are valid UUIDs
    for (const userId of userIds) {
      if (typeof userId !== 'string' || !uuidRegex.test(userId)) {
        return new Response(JSON.stringify({ error: 'All userIds must be valid UUIDs' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    const success = await assignUsersToOrganization(orgId, userIds);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to assign users to organization' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error assigning users to organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to assign users to organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}