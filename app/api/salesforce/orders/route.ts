import { NextResponse } from "next/server";
import { exit } from "process";
import { getOrderslistFromSalesforce, getOrderFromSalesforce, getOrderslocationsFromSalesforce, getContactsFromSalesforce, createOrderFromSalesforce, updateOrderFromSalesforce, cloneOrderFromSalesforce, deleteOrderFromSalesforce, deleteFullOrderFromSalesforce, getFilesFromSalesforce, deleteFileFromSalesforce, uploadFilesToSalesforce, downloadFileFromSalesforce, getFileUrl, getOrderLinesFromSalesforce, getAccountFromSalesforce } from '@/lib/salesforce-service';
import { getProductsFromSalesforce } from '@/lib/product-salesforce-service';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const orderId = searchParams.get("orderId");
    const contactId = searchParams.get("contactId");
    const contentVersionId = searchParams.get("contentVersionId");
    const objectName = searchParams.get("objectName") || "Customer_Order__c";

    const rawAction = (searchParams.get("action") || "").toLowerCase();
    console.log("=== Orders API Route ===");
    console.log("Method: GET");
    console.log("URL:", req.url);
    console.log("accountId:", accountId);
    console.log("contactId:", contactId);
    console.log("action:", rawAction);

    if (!accountId || !contactId) {
      return NextResponse.json({ error: "Missing accountId or contactId" }, { status: 400 });
    }

    // compose Salesforce REST URL

    const baseUrl = (process.env.SF_DATA_URL || "").replace(/\/+$/, "");
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
    } else if (orderId) {
      // support direct order fetch when orderId provided without explicit action
      orderUrl = `${process.env.SF_DATA_URL}/services/apexrest/gtherp/orders`;
      result = await getOrderFromSalesforce(accountId, contactId, orderId, orderUrl);
    } else {
      return NextResponse.json({ error: "Unsupported action or missing orderId" }, { status: 400 });
    }
    console.log('result', result);
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
      console.log('POST /api/salesforce/orders?action=uploadFiles');
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
    console.log('PATCH /api/salesforce/orders - orderId:', orderId);
    console.log('PATCH /api/salesforce/orders - orderData:', JSON.stringify(orderData, null, 2));

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
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        newOrderId = result.data[0].Id;
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
      console.log('DELETE file - accountId:', accountId, 'orderId:', orderId, 'contentDocumentId:', contentDocumentId, 'contactId:', contactId);
      const result = await deleteFileFromSalesforce(accountId, contactId, orderId, contentDocumentId);
      if (!result) {
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "File deleted successfully" });
    }

    if (orderLineId) {
      console.log('DELETE order line - accountId:', accountId, 'orderLineId:', orderLineId, 'contactId:', contactId);
      const result = await deleteOrderFromSalesforce(accountId, contactId, orderLineId);
      if (!result) {
        return NextResponse.json({ error: "Failed to delete order line" }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Order line is deleted successfully" });
    }

    if (orderId) {
      console.log('DELETE full order - accountId:', accountId, 'orderId:', orderId, 'contactId:', contactId);
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
