// app/api/rbac/permissions/route.ts
import { NextRequest } from 'next/server';
import { createPermission, getAllPermissions } from '@/lib/permission-service';

export async function GET(request: NextRequest) {
  try {
    const permissions = await getAllPermissions();
    return new Response(JSON.stringify(permissions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch permissions' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const permissionData = await request.json();
    const permission = await createPermission(permissionData);
    return new Response(JSON.stringify(permission), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return new Response(JSON.stringify({ error: 'Failed to create permission' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}