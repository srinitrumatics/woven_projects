// app/api/rbac/organizations/[id]/route.ts
import { NextRequest } from 'next/server';
import { getOrganizationById, updateOrganization, deleteOrganization } from '@/lib/organization-service';
import { requireAuth } from "@/lib/session";

// Get organization by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Add appropriate permission checks here if needed
  // await requireAuth(['read_organization']);
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const organization = await getOrganizationById(id);
    if (!organization) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(organization), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Update organization by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Add appropriate permission checks here if needed
  // await requireAuth(['update_organization']);
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const orgData = await request.json();
    const organization = await updateOrganization(id, orgData);

    if (!organization) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(organization), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to update organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Delete organization by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Add appropriate permission checks here if needed
  // await requireAuth(['delete_organization']);
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    // Basic UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const success = await deleteOrganization(id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
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
    console.error('Error deleting organization:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete organization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}