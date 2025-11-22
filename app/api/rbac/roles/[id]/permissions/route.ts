// app/api/rbac/roles/[id]/permissions/route.ts
import { NextRequest } from 'next/server';
import { assignPermissionsToRole, getRolePermissions } from '@/lib/role-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const roleId = parseInt(resolvedParams.id, 10);
    if (isNaN(roleId)) {
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const roleId = parseInt(resolvedParams.id, 10);
    if (isNaN(roleId)) {
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