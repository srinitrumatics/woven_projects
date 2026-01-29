"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import LineTaxesTab from "../../components/LineTaxesTab";

// Interface for order line item from Salesforce
interface OrderLineItem {
  Id: string;
  Name: string;
  Product_Name_Name?: string;
  Product_Name__c?: string;
  Product_Description__c?: string;
  Unit_Price__c: number;
  Order_Qty__c: number;
  Total_Price__c: number;
  MOQ__c?: number;
  Manufacturer_Name__c?: string;
  ProductFamily?: string;
  Product_Grouping__c?: string;
  Grouping__c?: string;
  Site__c?: string;
  Inventory_Account__c?: string;
  Is_Taxable__c?: boolean;
  Product_Name_Available_To_Sell?: number;
  Qty_Shipped__c?: number;
  Unit_Cost__c?: number;
  Total_Cost__c?: number;
  Manufacturer_DBA__c?: string;
  Site_Name?: string;
  Inventory_Account_Name?: string;

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
  qtyShipped: number;
  unitCost: string;
  totalCost: string;

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

  // State for order data
  const [loading, setLoading] = useState(true);
  const [orderLines, setOrderLines] = useState<ProductData[]>([]);
  const [orderName, setOrderName] = useState<string>("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Salesforce credentials
  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? ""; // override with real value
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "" //TODO: Get this from session / auth context


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

        console.log("Fetched order data:", orderData);
        console.log("Fetched order lines data:", linesData);

        if (orderData && orderData.length > 0) {
          setOrderName(orderData[0].Name || orderData[0].OrderNumber || id);
        }

        if (linesData && linesData.length > 0) {
          const orderlines = linesData;

          // Map Order Lines to products
          if (orderlines && orderlines.length > 0) {
            const mappedProducts: ProductData[] = orderlines.map((item: OrderLineItem) => ({
              id: item.Product_Name__c || item.Id,
              orderLineId: item.Id, // Store the actual order line ID
              name: item.Product_Name_Name || "Unknown Product",
              sku: item.Name || "",
              description: item.Product_Description__c || "",
              productFamily: item.ProductFamily || "General",
              brand: item.Manufacturer_DBA__c || item.Manufacturer_Name__c || "Unknown",
              manufacturer: item.Manufacturer_Name__c || "Unknown",
              moq: item.MOQ__c || 1,
              unitPrice: item.Unit_Price__c || 0,
              orderQty: item.Order_Qty__c || 0,
              subtotal: item.Total_Price__c || 0,
              productGrouping: item.Product_Grouping__c || "-",
              grouping: item.Grouping__c || "-",
              site: item.Site_Name || item.Site__c || "-",
              inventoryAccount: item.Inventory_Account_Name || item.Inventory_Account__c || "-",
              isTaxable: item.Is_Taxable__c === true ? "Yes" : "No",
              availableToSell: item.Product_Name_Available_To_Sell || 0,
              qtyShipped: item.Qty_Shipped__c || 0,
              unitCost: item.Unit_Cost__c != null ? `$${item.Unit_Cost__c.toFixed(2)}` : "Hide",
              totalCost: item.Total_Cost__c != null ? `$${item.Total_Cost__c.toFixed(2)}` : "Hide",

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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate order line totals
  const orderQty = product?.orderQty || 0;
  const unitPrice = product?.unitPrice || 0;
  const subtotal = product?.subtotal || (orderQty * unitPrice);
  const shippingCharges = subtotal > 0 ? 15.0 : 0;
  const taxRate = 0.15;
  const taxes = subtotal * taxRate;
  const grandTotal = subtotal + shippingCharges + taxes;



  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading order line details...</p>
          </div>
        </div>
      </>
    );
  }

  // No data state
  if (!product) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Order line not found</p>
            <Link
              href={`/orders/${id}`}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Order
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb - Compact */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <button
            onClick={() => router.push("/orders")}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Orders
          </button>
          <span>&gt;</span>
          <button
            onClick={() => router.push(`/orders/${id}`)}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            {orderName || `Order #${id}`}
          </button>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white">{product?.sku || `Line #${lineId}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product?.sku || `Order Line #${lineId}`}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Line {lineNumber} of {totalLines}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Back to Order Button */}
            <Link
              href={`/orders/${id}`}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Order
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Main Image + Order Notes + Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch">
        {/* Main Image with Carousel - 25% width (3 of 12 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
          <div className="relative flex-1 flex flex-col">
            {/* Main Image Display - Reduced height */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-1 min-h-[200px]">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  {productImages[currentImageIndex].label}
                </span>
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Order Notes - 25% width (3 of 12 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Order Notes
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Notes
            </label>
            <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-sm text-gray-900 dark:text-white min-h-[200px]">
              <p className="text-gray-400 italic">No notes added.</p>
            </div>
          </div>
        </div>

        {/* Product Information Card - 50% width (6 of 12 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Product Information
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            {/* Column 1 */}
            <div className="space-y-3">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Product Name
                </label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </p>
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Description
                </label>
                <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                  {product.description || "No description available"}
                </p>
              </div>
              {/* Manufacturer Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Manufacturer Name
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.manufacturer}
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              {/* Manufacturer DBA */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Manufacturer DBA
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.brand}
                </p>
              </div>
              {/* Product Family */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Product Family
                </label>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {product.productFamily}
                </span>
              </div>
              {/* IsTaxable */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  IsTaxable
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.isTaxable}
                </p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              {/* Site */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Site
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.site}
                </p>
              </div>
              {/* Inventory Account */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Inventory Account
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {product.inventoryAccount}
                </p>
              </div>
              {/* Available to Sell */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Available to Sell
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {product.availableToSell?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Thumbnail Images + Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">


        {/* Order Details Card - Full width */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Order Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Order Qty</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">MOQ</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Total Qty</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Total Price</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Shipping</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Taxes</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Grand Total</th>
                  <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">Qty Shipped</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 dark:text-white">
                    ${unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 dark:text-white">{orderQty}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 dark:text-white">{product.moq}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 dark:text-white">{product.orderQty}</td>
                  <td className="px-2 py-3 text-xs text-center text-gray-900 dark:text-white">
                    ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-3 text-xs text-center text-gray-900 dark:text-white">
                    ${shippingCharges.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-3 text-xs text-center text-gray-900 dark:text-white">
                    ${taxes.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                  </td>
                  <td className="px-2 py-3 text-sm text-center font-bold text-primary">
                    ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 dark:text-white">{product.qtyShipped}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Taxes Card - Separate Card */}
        <div className="lg:col-span-5">
          <LineTaxesTab product={product} />
        </div>
      </div>

      {/* Navigation Buttons - Below Order Details, Right aligned */}
      <div className="flex items-center justify-end gap-2 mt-4">
        {/* Previous Line Button */}
        {hasPrevLine ? (
          <Link
            href={`/orders/${id}/lines/${prevLineId}`}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </span>
        )}

        {/* Line indicator */}
        <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
          {lineNumber}/{totalLines}
        </span>

        {/* Next Line Button */}
        {hasNextLine ? (
          <Link
            href={`/orders/${id}/lines/${nextLineId}`}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-lg inline-flex items-center gap-1 cursor-not-allowed">
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
      </div>
    </>
  );
}
