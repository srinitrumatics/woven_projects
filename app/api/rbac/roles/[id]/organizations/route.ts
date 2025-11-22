// app/api/rbac/roles/[id]/organizations/route.ts
import { NextRequest } from 'next/server';
import { getOrganizationsForRole, assignOrganizationsToRole } from '@/lib/role-service';
import { requireAuth } from "@/lib/session";

// Get organizations assigned to a role
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const roleId = parseInt(awaitedParams.id);
    if (isNaN(roleId)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const organizations = await getOrganizationsForRole(roleId);
    return new Response(JSON.stringify(organizations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching organizations for role:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch organizations for role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Assign organizations to a role
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const roleId = parseInt(awaitedParams.id);
    if (isNaN(roleId)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
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

    const success = await assignOrganizationsToRole(roleId, organizationIds);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to assign organizations to role' }), {
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
    console.error('Error assigning organizations to role:', error);
    return new Response(JSON.stringify({ error: 'Failed to assign organizations to role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}