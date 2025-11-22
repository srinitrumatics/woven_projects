// app/api/rbac/users/[id]/roles-with-organizations/route.ts
import { NextRequest } from 'next/server';
import { getAllUserRolesWithOrganizations } from '@/lib/user-service';

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

    const roles = await getAllUserRolesWithOrganizations(userId);
    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user roles with organizations:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user roles with organizations' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}