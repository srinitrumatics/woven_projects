// app/api/rbac/permission-groups/route.ts
import { NextRequest } from 'next/server';
import { getPermissionGroups, createPermissionGroup } from '@/lib/role-service';

export async function GET(request: NextRequest) {
  try {
    const groups = await getPermissionGroups();
    
    return new Response(JSON.stringify(groups), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching permission groups:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch permission groups' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const groupData = await request.json();
    const group = await createPermissionGroup(groupData);

    return new Response(JSON.stringify(group), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating permission group:', error);
    return new Response(JSON.stringify({ error: 'Failed to create permission group' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}