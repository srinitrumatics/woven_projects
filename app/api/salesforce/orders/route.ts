import { NextResponse } from "next/server";
import { getSalesforceSession, getOrderslistFromSalesforce, getOrderFromSalesforce, getOrderslocationsFromSalesforce, getContactsFromSalesforce, createOrderFromSalesforce, updateOrderFromSalesforce, cloneOrderFromSalesforce, deleteOrderFromSalesforce, deleteFullOrderFromSalesforce, getFilesFromSalesforce, deleteFileFromSalesforce, uploadFilesToSalesforce, downloadFileFromSalesforce, getFileUrl, getOrderLinesFromSalesforce, getAccountFromSalesforce } from '@/lib/salesforce-service';
import { getProductsFromSalesforce } from '@/lib/product-salesforce-service';
import { requireApiAuth } from '@/lib/api-auth';


export async function GET(req: Request) {
  const auth = await requireApiAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const orderId = searchParams.get("orderId");
    const contactId = searchParams.get("contactId");
    const contentVersionId = searchParams.get("contentVersionId");
    const objectName = searchParams.get("objectName") || "Customer_Order__c";

    const rawAction = (searchParams.get("action") || "").toLowerCase();

    if (!accountId || !contactId) {
      return NextResponse.json({ error: "Missing accountId or contactId" }, { status: 400 });
    }

    // Verify the caller can only access their own accounts (admins are exempt)
    const isAdmin = user.permissions.includes('ALL_ACCESS');
    if (!isAdmin) {
      const allowedIds = user.organizations.map((o: any) => o.id);
      if (!allowedIds.includes(accountId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get Salesforce session (uses org config from organizations table, falls back to .env)
    const session = await getSalesforceSession();
    const baseUrl = (session.instanceUrl || "").replace(/\/+$/, "");
    let orderUrl = "";
    let locationUrl = "";
    let contactUrl = "";
    let result: any = [];

    if (rawAction === "list") {
      orderUrl = `${baseUrl}/services/apexrest/gtherp/orders`;
      result = await getOrderslistFromSalesforce(accountId, contactId, orderUrl);
    } else if (rawAction === "locations" || rawAction === "location") {
      locationUrl = `${baseUrl}/services/apexrest/gtherp/authorizedlocations`;
      result = await getOrderslocationsFromSalesforce(accountId, contactId, locationUrl);
    } else if (rawAction === "contacts" || rawAction === "contact") {
      contactUrl = `${baseUrl}/services/apexrest/gtherp/contacts`;
      result = await getContactsFromSalesforce(accountId, contactId, contactUrl);
    } else if (rawAction === "products" || rawAction === "product") {
      result = await getProductsFromSalesforce(accountId, contactId);
    } else if (rawAction === "files") {
      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId for files action" }, { status: 400 });
      }
      result = await getFilesFromSalesforce(accountId, contactId, orderId, objectName);
    } else if (rawAction === "orderlines") {
      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId for orderlines action" }, { status: 400 });
      }
      result = await getOrderLinesFromSalesforce(accountId, contactId, orderId);
    } else if (rawAction === "account") {
      result = await getAccountFromSalesforce(accountId);
    } else if (rawAction === "download") {
      //const contentDocumentId = searchParams.get("contentDocumentId");
      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId for download action" }, { status: 400 });
      }
      if (!contentVersionId) {
        return NextResponse.json({ error: "Missing contentVersionId for download action" }, { status: 400 });
      }
      result = await getFileUrl(contentVersionId);
      if (!result) {
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
      }
    } else if (rawAction === "preview") {
      const contentVersionId = searchParams.get("contentVersionId");
      if (!contentVersionId) {
        return NextResponse.json({ error: "Missing contentVersionId for preview action" }, { status: 400 });
      }
      result = await getFileUrl(contentVersionId);
      //console.log('preview', result);
      if (!result) {
        return NextResponse.json({ error: "Failed to get preview URL" }, { status: 500 });
      }
    } else if (rawAction === "fulfillment") {
      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId for fulfillment action" }, { status: 400 });
      }
      const { getQuotesFromSalesforce } = await import('@/lib/quote-service');
      result = await getQuotesFromSalesforce(accountId, contactId, orderId, "Fulfillment", "Customer_Order__c");
    } else if (rawAction === "returns") {
      if (!orderId) {
        return NextResponse.json({ error: "Missing orderId for returns action" }, { status: 400 });
      }
      const { getQuotesFromSalesforce } = await import('@/lib/quote-service');
      result = await getQuotesFromSalesforce(accountId, contactId, orderId, "Returns", "Customer_Order__c");
    } else if (orderId) {
      // support direct order fetch when orderId provided without explicit action
      orderUrl = `${baseUrl}/services/apexrest/gtherp/orders`;
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

// POST handler for creating new orders or uploading files
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "uploadFiles") {
      const uploadData = await req.json();
      const result = await uploadFilesToSalesforce(uploadData);

      if (!result) {
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
      }
      return NextResponse.json(result, { status: 201 });
    }

    const orderData = await req.json();
    const result = await createOrderFromSalesforce(orderData);

    if (!result) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Create order/upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH handler for updating existing orders
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const orderData = await req.json();

    let result;
    if (orderId) {
      result = await updateOrderFromSalesforce(orderId, orderData);
    }
    else {
      result = await cloneOrderFromSalesforce(orderData);
    }
    if (!result) {
      return NextResponse.json({
        error: orderId ? "Failed to update order" : "Failed to clone order"
      }, { status: 500 });
    }

    // For update operations (orderId present), return simple boolean response
    if (orderId) {
      return NextResponse.json({
        success: true,
        message: "Order updated successfully"
      });
    }

    // For clone operations (no orderId), extract the new order ID and return simple response
    let newOrderId = null;
    if (result && typeof result === 'object') {
      // Extract order ID from the nested Salesforce response
      if (Array.isArray(result) && result.length > 0) {
        newOrderId = result[0].Id || result[0].id || result[0].orderId;
      } else if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        if (result.data[0].Customer_Order__c && Array.isArray(result.data[0].Customer_Order__c) && result.data[0].Customer_Order__c.length > 0) {
          newOrderId = result.data[0].Customer_Order__c[0].Id;
        } else {
          newOrderId = result.data[0].Id;
        }
      } else if (result.Id) {
        newOrderId = result.Id;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order cloned successfully",
      orderId: newOrderId,
      data: result.data // Keep data array for frontend compatibility
    });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({
      error: "Server error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

// DELETE handler for deleting order, order line items or files
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const orderLineId = searchParams.get("orderLineId");
    const contentDocumentId = searchParams.get("contentDocumentId");
    const orderId = searchParams.get("orderId");
    const contactId = searchParams.get("contactId");

    if (!accountId || !contactId) {
      return NextResponse.json(
        { error: "Missing required parameters: accountId and contactId" },
        { status: 400 }
      );
    }

    if (contentDocumentId && orderId) {
      const result = await deleteFileFromSalesforce(accountId, contactId, orderId, contentDocumentId);
      if (!result) {
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "File deleted successfully" });
    }

    if (orderLineId) {
      const result = await deleteOrderFromSalesforce(accountId, contactId, orderLineId);
      if (!result) {
        return NextResponse.json({ error: "Failed to delete order line" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Order line is deleted successfully" });
    }

    if (orderId) {
      const result = await deleteFullOrderFromSalesforce(accountId, contactId, orderId);
      if (!result) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Order and related lines are deleted successfully" });
    }

    return NextResponse.json(
      { error: "Missing required parameters: orderLineId or orderId" },
      { status: 400 }
    );

  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({
      error: "Server error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
