// app/api/rbac/users/[id]/roles/route.ts
import { NextRequest } from 'next/server';
import { getUserRoles, assignRolesToUser } from '@/lib/user-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const userId = parseInt(resolvedParams.id, 10);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check for organizationId in query parameters
    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organizationId');

    let roles;
    if (organizationId) {
      const orgId = parseInt(organizationId, 10);
      if (isNaN(orgId)) {
        return new Response(JSON.stringify({ error: 'Invalid organization ID' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      roles = await getUserRoles(userId, orgId);
    } else {
      roles = await getUserRoles(userId);
    }

    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user roles' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const userId = parseInt(resolvedParams.id, 10);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { roleIds, organizationId } = await request.json();
    if (!Array.isArray(roleIds)) {
      return new Response(JSON.stringify({ error: 'roleIds must be an array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'organizationId is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const orgId = parseInt(organizationId, 10);
    if (isNaN(orgId)) {
      return new Response(JSON.stringify({ error: 'Invalid organization ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const success = await assignRolesToUser(userId, roleIds, orgId);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to assign roles to user' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Roles assigned successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error assigning roles to user:', error);
    return new Response(JSON.stringify({ error: 'Failed to assign roles to user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}