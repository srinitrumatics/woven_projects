// app/api/rbac/roles/route.ts
import { NextRequest } from 'next/server';
import { createRole, getAllRoles } from '@/lib/role-service';

export async function GET(request: NextRequest) {
  try {
    const roles = await getAllRoles();
    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch roles' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleData = await request.json();
    const role = await createRole(roleData);
    return new Response(JSON.stringify(role), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return new Response(JSON.stringify({ error: 'Failed to create role' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}