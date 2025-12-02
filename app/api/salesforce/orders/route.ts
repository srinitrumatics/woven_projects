import { NextResponse } from "next/server";
import { exit } from "process";
import { getOrderslistFromSalesforce, getOrderFromSalesforce, getOrderslocationsFromSalesforce, getContactsFromSalesforce, getProductsFromSalesforce, createOrderFromSalesforce, updateOrderFromSalesforce } from '@/lib/salesforce-service';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const orderId = searchParams.get("orderId");
    const contactId = searchParams.get("contactId") ?? "abc";

    const rawAction = (searchParams.get("action") || "").toLowerCase();
    console.log("action:", rawAction);

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    // compose Salesforce REST URL

    let orderUrl = "";
    let locationUrl = "";
    let contactUrl = "";
    let result: any = [];

    if (rawAction === "list") {
      orderUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
      result = await getOrderslistFromSalesforce(accountId, contactId, orderUrl);
    } else if (rawAction === "locations" || rawAction === "location") {
      locationUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/authorizedlocations`;
      result = await getOrderslocationsFromSalesforce(accountId, contactId, locationUrl);
    } else if (rawAction === "contacts" || rawAction === "contact") {
      contactUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/contacts`;
      result = await getContactsFromSalesforce(accountId, contactId, contactUrl);
    } else if (rawAction === "products" || rawAction === "product") {
      result = await getProductsFromSalesforce(accountId, contactId);
    } else if (orderId) {
      // support direct order fetch when orderId provided without explicit action
      orderUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
      result = await getOrderFromSalesforce(accountId, contactId, orderId, orderUrl);
    } else {
      return NextResponse.json({ error: "Unsupported action or missing orderId" }, { status: 400 });
    }

    // The service functions return the data directly (or empty array on error)
    return NextResponse.json(result);
  } catch (err) {
    console.error("Orders route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST handler for creating new orders
export async function POST(req: Request) {
  try {
    const orderData = await req.json();
    const result = await createOrderFromSalesforce(orderData);

    if (!result) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH handler for updating existing orders
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const orderData = await req.json();
    console.log('PATCH /api/salesforce/orders - orderId:', orderId);
    console.log('PATCH /api/salesforce/orders - orderData:', JSON.stringify(orderData, null, 2));

    const result = await updateOrderFromSalesforce(orderId, orderData);

    if (!result) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({
      error: "Server error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
