// app/api/rbac/organizations/route.ts
import { NextRequest } from 'next/server';
import { createOrganization, getAllOrganizations, getOrganizationById, updateOrganization, deleteOrganization } from '@/lib/organization-service';
import { requireAuth } from "@/lib/session";

export async function GET(request: NextRequest) {
  // Add appropriate permission checks here if needed
  // await requireAuth(['list_organization']);
  try {
    const organizations = await getAllOrganizations();
    return new Response(JSON.stringify(organizations), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch organizations' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  // Add appropriate permission checks here if needed
  // await requireAuth(['create_organization']);
  try {
    const orgData = await request.json();
    const organization = await createOrganization(orgData);
    return new Response(JSON.stringify(organization), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to create organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}