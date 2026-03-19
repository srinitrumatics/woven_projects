import { NextRequest, NextResponse } from "next/server";
import { getDeliveryWindowsFromSalesforce, createDeliveryWindowInSalesforce, updateDeliveryWindowInSalesforce, deleteDeliveryWindowFromSalesforce } from "@/lib/authorized-location-service";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const locationId = searchParams.get("locationId");

        if (!accountId || !contactId || !locationId) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters: accountId, contactId, or locationId" },
                { status: 400 }
            );
        }

        const data = await getDeliveryWindowsFromSalesforce(accountId, contactId, locationId);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Route Error (deliverywindows):", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch delivery windows" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload.accountId || !payload.contactId || !payload.deliveryWindows) {
            return NextResponse.json(
                { success: false, message: "Missing required fields in payload" },
                { status: 400 }
            );
        }

        const data = await createDeliveryWindowInSalesforce(payload);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Route Error (POST deliverywindows):", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create delivery window" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload.accountId || !payload.contactId || !payload.deliveryWindows) {
            return NextResponse.json(
                { success: false, message: "Missing required fields in payload" },
                { status: 400 }
            );
        }

        const data = await updateDeliveryWindowInSalesforce(payload);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Route Error (PATCH deliverywindows):", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update delivery window" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId");
        const deliveryWindowId = searchParams.get("deliveryWindowId");

        if (!accountId || !contactId || !deliveryWindowId) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters: accountId, contactId, or deliveryWindowId" },
                { status: 400 }
            );
        }

        const data = await deleteDeliveryWindowFromSalesforce(accountId, contactId, deliveryWindowId);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Route Error (DELETE deliverywindows):", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete delivery window" },
            { status: 500 }
        );
    }
}
