// app/api/rbac/roles/[id]/permissions/route.ts
import { NextRequest } from 'next/server';
import { assignPermissionsToRole, getRolePermissions } from '@/lib/role-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const roleId = resolvedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roleId)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const permissions = await getRolePermissions(roleId);

    return new Response(JSON.stringify(permissions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch role permissions' }), {
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
    const roleId = resolvedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roleId)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { permissionIds } = await request.json();
    if (!Array.isArray(permissionIds)) {
      return new Response(JSON.stringify({ error: 'permissionIds must be an array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate that all permission IDs are valid UUIDs
    for (const permissionId of permissionIds) {
      if (!uuidRegex.test(permissionId)) {
        return new Response(JSON.stringify({ error: `Invalid permission ID: ${permissionId}` }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    const success = await assignPermissionsToRole(roleId, permissionIds);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to assign permissions to role' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Permissions assigned successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error assigning permissions to role:', error);
    return new Response(JSON.stringify({ error: 'Failed to assign permissions to role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}