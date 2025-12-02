// app/api/rbac/users/[id]/organizations/route.ts
import { NextRequest } from 'next/server';
import { getUserOrganizations, assignOrganizationsToUser, removeOrganizationsFromUser } from '@/lib/user-service';
import { requireAuth } from "@/lib/session";

// Get organizations for a user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const userId = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const userOrganizations = await getUserOrganizations(userId);
    return new Response(JSON.stringify(userOrganizations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user organizations' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Assign organizations to a user
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const userId = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { organizationIds } = await request.json();
    if (!Array.isArray(organizationIds)) {
      return new Response(JSON.stringify({ error: 'organizationIds must be an array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate that all organization IDs are valid UUIDs
    for (const orgId of organizationIds) {
      if (!uuidRegex.test(orgId)) {
        return new Response(JSON.stringify({ error: `Invalid organization ID: ${orgId}` }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    const success = await assignOrganizationsToUser(userId, organizationIds);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to assign organizations to user' }), {
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
    console.error('Error assigning organizations to user:', error);
    return new Response(JSON.stringify({ error: 'Failed to assign organizations to user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}