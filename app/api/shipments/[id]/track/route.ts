import { NextResponse } from "next/server";
import { getTrackingStatusFromSalesforce } from "@/lib/shipment-service";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Missing shipment ID" }, { status: 400 });
        }

        const result = await getTrackingStatusFromSalesforce(id);
        return NextResponse.json(result);
    } catch (err) {
        console.error("Tracking API route error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
