// app/api/rbac/roles/[id]/route.ts
import { NextRequest } from 'next/server';
import { getRoleById, updateRole, deleteRole } from '@/lib/role-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const id = resolvedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const role = await getRoleById(id);
    if (!role) {
      return new Response(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(role), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const id = resolvedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const roleData = await request.json();
    const role = await updateRole(id, roleData);
    if (!role) {
      return new Response(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(role), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return new Response(JSON.stringify({ error: 'Failed to update role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const id = resolvedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid role ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const success = await deleteRole(id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Role not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Role deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}