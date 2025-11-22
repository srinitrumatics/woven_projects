// app/api/rbac/permissions/[id]/route.ts
import { NextRequest } from 'next/server';
import { getPermissionById, updatePermission, deletePermission } from '@/lib/permission-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = await params;
  try {
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid permission ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const permission = await getPermissionById(id);
    if (!permission) {
      return new Response(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(permission), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch permission' }), {
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
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid permission ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const permissionData = await request.json();
    const permission = await updatePermission(id, permissionData);
    if (!permission) {
      return new Response(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(permission), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return new Response(JSON.stringify({ error: 'Failed to update permission' }), {
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
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Invalid permission ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const success = await deletePermission(id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Permission not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Permission deleted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete permission' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}