"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import LineTaxesTab from "../../components/LineTaxesTab";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";

// Import sub-components
import LineHeader from "./components/LineHeader";
import ProductCarousel from "./components/ProductCarousel";
import OrderLineNotes from "./components/OrderLineNotes";
import ProductInfo from "./components/ProductInfo";
import OrderDetailsTable from "./components/OrderDetailsTable";
import LineNavigation from "./components/LineNavigation";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";

// Interface for order line item from Salesforce
interface OrderLineItem {
  Id: string;
  Name: string;
  Product_Name?: string;
  Product_Name__c?: string;
  Product_Description__c?: string;
  Unit_Price__c: number;
  Order_Qty__c: number;
  Total_Price__c: number;
  MOQ__c?: number;
  Manufacturer_Name__c?: string;
  Product_Brand_Name__c?: string;
  ProductFamily?: string;
  Product_Grouping__c?: string;
  Grouping__c?: string;
  Site__c?: string;
  Inventory_Account__c?: string;
  IsTaxable__c?: boolean;
  Available_To_Sell__c?: number;
  Qty_Shipped__c?: number;
  Unit_Cost__c?: number;
  Total_Cost__c?: number;
  Manufacturer_DBA__c?: string;
  Lead_Time_Wks__c?: number;
  ShippingDimensions__c?: string;
  Site_Name?: string;
  Inventory_Account_Name?: string;
  Customer_Order_Line_Notes__c?: string;
  // Tax Fields
  Sales_Tax_Rate__c?: number;
  Sales_Tax_Amount__c?: number;
  Use_Tax_Rate__c?: number;
  Use_Tax_Amount__c?: number;
  Local_Tax_Rate__c?: number;
  Local_Tax_Amount__c?: number;
  Excise_Tax_Rate__c?: number;
  Excise_Tax_Amount__c?: number;
  Gross_Receipts_Tax_Rate__c?: number;
  Gross_Receipts_Tax_Amount__c?: number;
  GST_Rate__c?: number;
  GST_Amount__c?: number;
  VAT_Rate__c?: number;
  Total_VAT_Amount__c?: number;
  Total_Taxes_Amount__c?: number;
}

// Interface for mapped product data
interface ProductData {
  id: string;
  orderLineId: string; // Salesforce order line ID for navigation
  name: string;
  sku: string;
  description: string;
  productFamily: string;
  brand: string;
  manufacturer: string;
  manufacturerDBA: string;
  moq: number;
  unitPrice: number;
  orderQty: number;
  subtotal: number;
  productGrouping: string;
  grouping: string;
  site: string;
  inventoryAccount: string;
  isTaxable: string;
  availableToSell: number;
  leadTimeWks?: number;
  shippingDimensions: string;
  qtyShipped: number;
  unitCost: string;
  totalCost: string;
  orderLineNotes: string;
  // Tax Fields
  Sales_Tax_Rate__c?: number;
  Sales_Tax_Amount__c?: number;
  Use_Tax_Rate__c?: number;
  Use_Tax_Amount__c?: number;
  Local_Tax_Rate__c?: number;
  Local_Tax_Amount__c?: number;
  Excise_Tax_Rate__c?: number;
  Excise_Tax_Amount__c?: number;
  Gross_Receipts_Tax_Rate__c?: number;
  Gross_Receipts_Tax_Amount__c?: number;
  GST_Rate__c?: number;
  GST_Amount__c?: number;
  VAT_Rate__c?: number;
  Total_VAT_Amount__c?: number;
  Total_Taxes_Amount__c?: number;
}

export default function OrderLineDetailPage({
  params,
}: {
  params: Promise<{ id: string; lineId: string }>;
}) {
  const { id, lineId } = use(params);
  const router = useRouter();
  const { success, error: toastError } = useToast();

  // State for order data
  const [loading, setLoading] = useState(true);
  const [orderLines, setOrderLines] = useState<ProductData[]>([]);
  const [orderName, setOrderName] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("Draft");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrderQty, setEditedOrderQty] = useState<number>(0);
  const [editedLineNotes, setEditedLineNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Salesforce credentials
  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";


  // Fetch order data from Salesforce
  useEffect(() => {
    async function fetchOrderData() {
      try {
        setLoading(true);

        // Fetch Order Details (for name) and Order Lines in parallel
        const [orderRes, linesRes] = await Promise.all([
          fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&orderId=${encodeURIComponent(id)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`),
          fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&orderId=${encodeURIComponent(id)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&action=orderlines`)
        ]);

        if (!orderRes.ok || !linesRes.ok) {
          throw new Error("Failed to fetch order data");
        }

        const orderData = await orderRes.json();
        const linesData = await linesRes.json();

        let order = null;
        if (Array.isArray(orderData) && orderData.length > 0) {
          if (orderData[0].Customer_Order__c && Array.isArray(orderData[0].Customer_Order__c) && orderData[0].Customer_Order__c.length > 0) {
            order = orderData[0].Customer_Order__c[0];
          } else {
            order = orderData[0];
          }
        }

        if (order) {
          // Display Proposal_Name if available as the "Order Name", falling back to the Salesforce Name (Order Number)
          setOrderName(order.Name || order.Name__c || order.Proposal_Name || order.Proposal_Name__c || id);
          setOrderStatus(order.Status__c || "Draft");
        }

        if (linesData && linesData.length > 0) {
          const orderlines = linesData;

          // Map Order Lines to products
          if (orderlines && orderlines.length > 0) {
            const mappedProducts: ProductData[] = orderlines.map((item: OrderLineItem) => ({
              id: item.Product_Name__c || item.Id,
              orderLineId: item.Id, // Store the actual order line ID
              name: item.Product_Name || "Unknown Product",
              sku: item.Name || "",
              description: item.Product_Description__c || "",
              productFamily: item.ProductFamily || "General",
              brand: item.Product_Brand_Name__c || "-",
              manufacturerDBA: item.Manufacturer_DBA__c || item.Manufacturer_Name__c || "",
              manufacturer: item.Manufacturer_Name__c || "",
              moq: item.MOQ__c || 1,
              unitPrice: item.Unit_Price__c || 0,
              orderQty: item.Order_Qty__c || 0,
              subtotal: item.Total_Price__c || 0,
              productGrouping: item.Product_Grouping__c || "",
              grouping: item.Grouping__c || "",
              site: item.Site_Name || item.Site__c || "",
              inventoryAccount: item.Inventory_Account_Name || item.Inventory_Account__c || "",
              isTaxable: item.IsTaxable__c === true ? "Yes" : "No",
              availableToSell: item.Available_To_Sell__c || 0,
              leadTimeWks: item.Lead_Time_Wks__c,
              shippingDimensions: item.ShippingDimensions__c || "",
              qtyShipped: item.Qty_Shipped__c || 0,
              unitCost: item.Unit_Cost__c != null ? `$${item.Unit_Cost__c.toFixed(2)}` : "Hide",
              totalCost: item.Total_Cost__c != null ? `$${item.Total_Cost__c.toFixed(2)}` : "Hide",
              orderLineNotes: item.Customer_Order_Line_Notes__c || "",
              // Map Tax Fields
              Sales_Tax_Rate__c: item.Sales_Tax_Rate__c,
              Sales_Tax_Amount__c: item.Sales_Tax_Amount__c,
              Use_Tax_Rate__c: item.Use_Tax_Rate__c,
              Use_Tax_Amount__c: item.Use_Tax_Amount__c,
              Local_Tax_Rate__c: item.Local_Tax_Rate__c,
              Local_Tax_Amount__c: item.Local_Tax_Amount__c,
              Excise_Tax_Rate__c: item.Excise_Tax_Rate__c,
              Excise_Tax_Amount__c: item.Excise_Tax_Amount__c,
              Gross_Receipts_Tax_Rate__c: item.Gross_Receipts_Tax_Rate__c,
              Gross_Receipts_Tax_Amount__c: item.Gross_Receipts_Tax_Amount__c,
              GST_Rate__c: item.GST_Rate__c,
              GST_Amount__c: item.GST_Amount__c,
              VAT_Rate__c: item.VAT_Rate__c,
              Total_VAT_Amount__c: item.Total_VAT_Amount__c,
              Total_Taxes_Amount__c: item.Total_Taxes_Amount__c,
            }));

            setOrderLines(mappedProducts);

            // Find the index of the current line by matching lineId with the order line's Id
            const lineIndex = mappedProducts.findIndex((product) => {
              return product.orderLineId === lineId;
            });

            // If found, set the current index; otherwise default to first line
            if (lineIndex >= 0) {
              setCurrentLineIndex(lineIndex);
            } else {
              // Fallback: try to find by product id or default to first
              const fallbackIndex = mappedProducts.findIndex((product) => product.id === lineId);
              setCurrentLineIndex(fallbackIndex >= 0 ? fallbackIndex : 0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order line data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOrderData();
    }
  }, [id, lineId, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Sync edited values when product changes
  useEffect(() => {
    if (orderLines[currentLineIndex]) {
      const p = orderLines[currentLineIndex];
      setEditedOrderQty(p.orderQty);
      setEditedLineNotes(p.orderLineNotes);
    }
  }, [currentLineIndex, orderLines]);

  const handleSave = async () => {
    if (!product) return;

    try {
      setIsSubmitting(true);

      const orderPayload = {
        order: {
          Id: id,
          Status__c: orderStatus
        },
        orderLines: [{
          Id: product.orderLineId,
          Order_Qty__c: editedOrderQty,
          Customer_Order_Line_Notes__c: editedLineNotes,
          Product_Name__c: product.id,
          Unit_Price__c: product.unitPrice,
          Inventory_Account__c: SF_ACCOUNT_ID
        }],
        accountId: SF_ACCOUNT_ID,
        contactId: SF_CONTACT_ID
      };

      const response = await fetch(`/api/salesforce/orders?orderId=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error("Failed to update order line");
      }

      const result = await response.json();

      // Update local state
      setOrderLines(prev => prev.map((line, idx) =>
        idx === currentLineIndex
          ? { ...line, orderQty: editedOrderQty, orderLineNotes: editedLineNotes, subtotal: editedOrderQty * line.unitPrice }
          : line
      ));

      setIsEditing(false);
      success("Order line updated successfully");
    } catch (err) {
      console.error("Error updating order line:", err);
      toastError("Failed to update order line");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current product from order lines
  const product = orderLines[currentLineIndex];
  const totalLines = orderLines.length;
  const lineNumber = currentLineIndex + 1;

  // Navigation helpers - use actual orderLineId for navigation
  const hasPrevLine = currentLineIndex > 0;
  const hasNextLine = currentLineIndex < totalLines - 1;
  const prevLineId = hasPrevLine ? orderLines[currentLineIndex - 1]?.orderLineId : "";
  const nextLineId = hasNextLine ? orderLines[currentLineIndex + 1]?.orderLineId : "";

  // Mock multiple images for carousel (product images not available from API)
  const productImages = [
    { id: 1, label: "Image 1" },
    { id: 2, label: "Image 2" },
    { id: 3, label: "Image 3" },
  ];

  // Calculate order line totals
  const displayQty = isEditing ? editedOrderQty : (product?.orderQty || 0);
  const unitPrice = product?.unitPrice || 0;
  const subtotal = displayQty * unitPrice;
  const shippingCharges = subtotal > 0 ? 15.0 : 0;
  const taxRate = product?.isTaxable === "Yes" ? 0.15 : 0;
  const taxes = subtotal * taxRate;
  const grandTotal = subtotal + shippingCharges + taxes;


  // Loading state
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64 min-w-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 truncate" title="Loading order line details...">Loading order line details...</p>
          </div>
        </div>
      </>
    );
  }

  // No data state
  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 min-w-0">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4 truncate" title="Order line not found">Order line not found</p>
          <Link
            href={`/orders/${id}`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors truncate"
          >
            Back to Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <LineHeader
        id={id}
        lineId={lineId}
        orderName={orderName}
        productSku={product.sku}
        lineNumber={lineNumber}
        totalLines={totalLines}
        orderStatus={orderStatus}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onEditToggle={() => {
          if (isEditing) {
            setEditedOrderQty(product.orderQty);
            setEditedLineNotes(product.orderLineNotes);
          }
          setIsEditing(!isEditing);
        }}
        onSave={handleSave}
      />

      {/* Row 1: Main Image + Order Notes + Product Information */}
      <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4 mb-4 items-stretch">
        <ProductCarousel images={productImages} />

        <OrderLineNotes
          isEditing={isEditing}
          notes={editedLineNotes}
          onNotesChange={setEditedLineNotes}
          originalNotes={product.orderLineNotes}
        />

        <ProductInfo product={product} />
      </div>

      {/* Row 2: Order Details */}
      <div className="grid grid-cols-1 w1025:grid-cols-12 gap-4">
        <OrderDetailsTable
          isEditing={isEditing}
          product={product}
          editedQty={editedOrderQty}
          onQtyChange={setEditedOrderQty}
          unitPrice={unitPrice}
          subtotal={subtotal}
          taxes={taxes}
          shippingCharges={shippingCharges}
          grandTotal={grandTotal}
          displayQty={displayQty}
        />

        <div className="w1025:col-span-12">
          <LineTaxesTab product={product} />
        </div>
      </div>

      <LineNavigation
        id={id}
        hasPrevLine={hasPrevLine}
        hasNextLine={hasNextLine}
        prevLineId={prevLineId}
        nextLineId={nextLineId}
        lineNumber={lineNumber}
        totalLines={totalLines}
      />
    </>
  );
}
