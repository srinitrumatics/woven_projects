"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LineFulfillmentsTab from "./components/LineFulfillmentsTab";
import LinePurchasesTab from "./components/LinePurchasesTab";
import LineReturnsTab from "./components/LineReturnsTab";
import { FulfillmentTabType, FulfillmentData, ReturnsData, SalesOrder, CustomerQuote, Purchase, SupplierBill, PurchasesData } from "../../types";

// Interface for proposal product item from Salesforce (matching what we saw in proposal list logic)
interface ProposalProductItem {
    Id: string;
    Product_Name: string;
    Name?: string; // Sku
    Product_Description__c?: string;
    Manufacturer_Name__c?: string;
    Product_Family__c?: string;
    Total_Order_Qty__c: number;
    Unit_Price__c: number;
    Line_Grand_Total__c: number;
    MOQ__c?: number;
    Product_Grouping__c?: string;
    Grouping__c?: string;
    Site__c?: string;
    Inventory_Account__c?: string;
    Is_Taxable__c?: boolean;
    Available_To_Sell__c?: number;
    Qty_Shipped__c?: number;
    Unit_Cost__c?: number;
    Total_Cost__c?: number;
    Manufacturer_DBA__c?: string;
}

// Interface for mapped product data
interface ProductData {
    id: string;
    orderLineId: string; // Salesforce line ID for navigation
    name: string;
    sku: string;
    description: string;
    productFamily: string;
    manufacturer: string;
    quantity: number;
    unitPrice: number;
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
    moq: number;
}

export default function ProposalProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; lineid: string }>;
}) {
    const { id, lineid } = use(params);
    const router = useRouter();

    // State for proposal data
    const [loading, setLoading] = useState(true);
    const [proposalProducts, setProposalProducts] = useState<ProductData[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    // Salesforce credentials
    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "001QL00001Kbvt3YAB";
    // Note: Using the same contact ID env var as existing pages, fixing the variable name copy-paste error from order page if present
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "003QL00001EzLjZYAV";

    // Fetch proposal data from Salesforce
    useEffect(() => {
        async function fetchProposalData() {
            try {
                setLoading(true);
                // Using the existing API endpoint logic for products
                const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(id)}&action=products`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch proposal products: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                console.log("Fetched proposal products for details:", data);

                if (data && data.length > 0) {
                    const products = data;

                    // Map Proposal Products
                    const mappedProducts: ProductData[] = products.map((item: ProposalProductItem) => ({
                        id: item.Id,
                        orderLineId: item.Id,
                        name: item.Product_Name || "Unknown Product",
                        sku: item.Name || "", // Assuming Name is SKU based on list page logic
                        description: item.Product_Description__c || "",
                        productFamily: item.Product_Family__c || "General",
                        manufacturer: item.Manufacturer_Name__c || "Unknown",
                        quantity: item.Total_Order_Qty__c || 0,
                        unitPrice: item.Unit_Price__c || 0,
                        subtotal: item.Line_Grand_Total__c || 0,
                        productGrouping: item.Product_Grouping__c || "-",
                        grouping: item.Grouping__c || "-",
                        site: item.Site__c || "-",
                        inventoryAccount: item.Inventory_Account__c || "-",
                        isTaxable: item.Is_Taxable__c === true ? "Yes" : "No",
                        availableToSell: item.Available_To_Sell__c || 0,
                        qtyShipped: item.Qty_Shipped__c || 0,
                        unitCost: item.Unit_Cost__c != null ? `$${item.Unit_Cost__c.toFixed(2)}` : "Hide",
                        totalCost: item.Total_Cost__c != null ? `$${item.Total_Cost__c.toFixed(2)}` : "Hide",
                        moq: item.MOQ__c || 1,
                    }));

                    setProposalProducts(mappedProducts);

                    // Find the index of the current line by matching lineid
                    const lineIndex = mappedProducts.findIndex((product) => {
                        return product.id === lineid;
                    });

                    // If found, set the current index; otherwise default to first line
                    if (lineIndex >= 0) {
                        setCurrentLineIndex(lineIndex);
                    } else {
                        setCurrentLineIndex(0);
                    }
                }
            } catch (error) {
                console.error("Error fetching proposal product data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProposalData();
        }
    }, [id, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Get current product
    const product = proposalProducts[currentLineIndex];
    const totalLines = proposalProducts.length;
    const lineNumber = currentLineIndex + 1;

    // Navigation helpers
    const hasPrevLine = currentLineIndex > 0;
    const hasNextLine = currentLineIndex < totalLines - 1;
    const prevLineId = hasPrevLine ? proposalProducts[currentLineIndex - 1]?.id : "";
    const nextLineId = hasNextLine ? proposalProducts[currentLineIndex + 1]?.id : "";

    // Mock multiple images for carousel
    const productImages = [
        { id: 1, label: "Image 1" },
        { id: 2, label: "Image 2" },
        { id: 3, label: "Image 3" },
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Totals & Mock Fields
    const quantity = product?.quantity || 0;
    const unitPrice = product?.unitPrice || 0;
    const subtotal = product?.subtotal || (quantity * unitPrice);
    const shippingCharges = 0;
    const taxes = 0;
    const grandTotal = subtotal + shippingCharges + taxes;

    // Tabs State
    const [activeTab, setActiveTab] = useState<"fulfillments" | "purchases" | "returns">("fulfillments");
    const [fulfillmentActiveTab, setFulfillmentActiveTab] = useState<FulfillmentTabType>("invoices");
    const [fulfillmentData, setFulfillmentData] = useState<FulfillmentData>({
        invoices: [],
        shippingManifests: [],
        salesOrders: [],
        customerQuotes: []
    });
    const [fulfillmentLoading, setFulfillmentLoading] = useState(false);

    const [purchasesData, setPurchasesData] = useState<PurchasesData>({
        purchaseOrders: [],
        supplierBills: []
    });
    const [purchasesLoading, setPurchasesLoading] = useState(false);

    const [returnsData, setReturnsData] = useState<ReturnsData>({
        rma: [],
        rtv: [],
        creditMemos: [],
        debitMemos: []
    });
    const [returnsLoading, setReturnsLoading] = useState(false);

    // Fetch Fulfillment Data
    useEffect(() => {
        async function fetchFulfillmentData() {
            if (activeTab === "fulfillments" && lineid) {
                try {
                    setFulfillmentLoading(true);
                    // Use the generic tab API via our proxy
                    // key params: proposalId -> objectId (lineid), action -> fulfillments, objectName -> Proposed_Product__c
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=fulfillments&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch fulfillments: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line fulfillments:", data);

                    if (data) {
                        // Map the API response to our FulfillmentData structure
                        // The API returns distinct arrays for each type, map them accordingly.
                        // Based on potential API structure (deduced from previous patterns):
                        // data.Invoice_Line__c -> invoices
                        // data.Shipping_Manifest_Line__c -> shippingManifests
                        // data.Sales_Order_Line__c -> salesOrders
                        // data.Customer_Quote_Line__c -> customerQuotes

                        // NOTE: The user provided example output shows:
                        // { "data": [ { "Invoice_Line__c": [...], ... } ] }
                        // But our route proxy returns `getGenericTabDataFromSalesforce`, which returns `result.data[0]` for 'Fulfillments'.
                        // So `data` here should be that inner object { Invoice_Line__c: [], ... }

                        const mappedData: FulfillmentData = {
                            invoices: (data.Invoice_Line__c || []).map((inv: any) => ({
                                id: inv.Id,
                                name: inv.Name, // or inv.Invoice_Name
                                status: inv.Status__c || "Draft",
                                customerPO: "N/A", // Not in example payload
                                billToAccountName: "N/A",
                                billToLocationName: "N/A",
                                billToContactName: "N/A",
                                totalLines: 0,
                                totalPrice: inv.Total_Price__c || 0,
                                totalShippingCharges: inv.Shipping_Charges__c || 0,
                                totalTaxesAmount: inv.Total_Taxes_Amount__c || 0,
                                grandTotal: inv.Line_Grand_Total__c || 0,
                                issuedDate: "",
                                dueDate: "",
                                paymentTerms: "",
                                collectionStatus: "",
                                openBalance: 0,
                                daysOutstanding: 0,
                                settledDate: ""
                            })),
                            shippingManifests: (data.Shipping_Manifest_Line__c || []).map((sm: any) => ({
                                id: sm.Id,
                                name: sm.Name, // or sm.Shipping_Manifest_Name
                                status: sm.Status__c,
                                customerQuoteName: sm.Customer_Quote_Line_Name,
                                salesOrderName: sm.Sales_Order_Line_Name,
                                customerOrderName: "",
                                customerPO: "",
                                shipToAccountName: "N/A",
                                shipToLocationName: "",
                                shipToContactName: "",
                                dropShip: false,
                                totalLines: sm.Total_Order_Qty__c || 0,
                                totalPrice: sm.Total_Price__c || 0,
                                shippingMethod: "",
                                shipDate: "",
                                deliveredDate: "",
                                estimatedDeliveryDate: sm.Estimated_Delivery_Date__c,
                                actualDeliveryDate: "",
                                trackingNumber: sm.Tracking_Number__c || "",
                                trackingStatus: sm.Tracking_Status__c || "",
                                logisticsPartnerName: "",
                                logisticsContactName: ""
                            })),
                            salesOrders: (data.Sales_Order_Line__c || []).map((so: any) => ({
                                id: so.Id,
                                name: so.Name, // or so.Sales_Order_Name
                                status: so.Status__c,
                                customerQuoteName: so.Customer_Quote_Line_Name,
                                customerOrderName: "",
                                customerPO: "",
                                billToAccountName: "N/A",
                                billToLocationName: "",
                                billToContactName: "",
                                shipToAccountName: "N/A",
                                shipToLocationName: "",
                                shipToContactName: "",
                                dropShip: false,
                                totalLines: so.Total_Order_Qty__c || 0,
                                totalPrice: so.Total_Price__c || 0,
                                totalShippingCharges: so.Shipping_Charges__c || 0,
                                totalTaxesAmount: so.Total_Taxes_Amount__c || 0,
                                grandTotal: so.Line_Grand_Total__c || 0,
                                requestDate: "", // Not in example payload
                                pickDate: "",
                                pickCompleteDate: "",
                                shipDate: "",
                                deliveredDate: ""
                            })),
                            customerQuotes: (data.Customer_Quote_Line__c || []).map((cq: any) => ({
                                id: cq.Id,
                                name: cq.Name, // or cq.Customer_Quote_Name
                                status: cq.Status__c || "Draft",
                                customerOrderName: "",
                                customerPO: "",
                                billToAccountName: "N/A",
                                billToLocationName: "",
                                billToContactName: "",
                                shipToAccountName: "N/A",
                                shipToLocationName: "",
                                shipToContactName: "",
                                dropShip: false,
                                totalLines: cq.Total_Order_Qty__c || 0,
                                totalPrice: cq.Total_Price__c || 0,
                                totalShippingCharges: cq.Shipping_Charges__c || 0,
                                totalTaxesAmount: cq.Total_Taxes_Amount__c || 0,
                                grandTotal: cq.Line_Grand_Total__c || 0,
                                issuedDate: "",
                                expirationDate: "",
                                requestDate: "",
                                shipDate: "",
                                deliveredDate: ""
                            }))
                        };
                        setFulfillmentData(mappedData);
                    }
                } catch (err) {
                    console.error("Error fetching line fulfillments:", err);
                } finally {
                    setFulfillmentLoading(false);
                }
            }
        }

        fetchFulfillmentData();
        fetchFulfillmentData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch Purchases Data
    useEffect(() => {
        async function fetchPurchasesData() {
            if (activeTab === "purchases" && lineid) {
                try {
                    setPurchasesLoading(true);
                    // Use the generic tab API via our proxy
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=purchases&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch purchases: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line purchases:", data);

                    if (data) {
                        const mappedPurchases: Purchase[] = (data.Purchase_Order_Line__c || []).map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c || "Draft",
                            vendorName: item.Manufacturer_DBA__c || "Unknown",
                            vendorPO: item.Purchase_Order_Name || "",
                            orderDate: "", // Not available in response
                            expectedDate: item.Estimated_Delivery_Date__c || "",
                            totalAmount: item.Total_Cost__c || 0
                        }));

                        const mappedSupplierBills: SupplierBill[] = (data.Supplier_Bill_Line__c || []).map((item: any) => ({
                            id: item.Id,
                            name: item.Name,
                            status: item.Status__c || "Draft",
                            supplierBillName: item.Supplier_Bill_Name || "",
                            billAmount: item.BillAmount__c || 0,
                            totalBillAmount: item.Total_Bill_Amount__c || 0,
                            billedQty: item.Billed_Qty__c || 0,
                            unitCost: item.Unit_Cost__c || 0,
                            manufacturerDBA: item.Manufacturer_DBA__c || "Unknown",
                            productName: item.Product_Name || "",
                            purchaseOrderLineName: item.Purchase_Order_Line_Name || ""
                        }));

                        setPurchasesData({
                            purchaseOrders: mappedPurchases,
                            supplierBills: mappedSupplierBills
                        });
                    }
                } catch (err) {
                    console.error("Error fetching line purchases:", err);
                } finally {
                    setPurchasesLoading(false);
                }
            }
        }

        fetchPurchasesData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // Fetch Returns Data
    useEffect(() => {
        async function fetchReturnsData() {
            if (activeTab === "returns" && lineid) {
                try {
                    setReturnsLoading(true);
                    // Use the generic tab API via our proxy
                    const res = await fetch(`/api/salesforce/proposals?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&proposalId=${encodeURIComponent(lineid)}&action=returns&objectName=Proposed_Product__c`);

                    if (!res.ok) {
                        throw new Error(`Failed to fetch returns: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log("Fetched line returns:", data);

                    if (data) {
                        // Map the API response to ReturnsData structure
                        const mappedData: ReturnsData = {
                            rma: (data.RMA_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // or item.RMA_Name
                                status: item.Status__c || "Draft",
                                description: item.Reason_Code__c || "", // Mapping Reason Code to Description if Description not defined
                                requestDate: "", // Not in response
                                type: "RMA",
                                reason: item.Reason_Code__c || "",
                                totalAmount: item.Total_Price__c || 0,
                                shipFromAccountName: "N/A" // Not in response explicitly
                            })),
                            rtv: (data.RTV_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // or item.RTV_Name
                                status: item.Status__c || "Draft",
                                description: item.Product_Description__c || "",
                                requestDate: "",
                                type: "RTV",
                                reason: item.Reason_Code__c || "",
                                totalAmount: item.Total_Cost__c || 0,
                                supplierName: item.Manufacturer_DBA__c || "Unknown",
                                rtvType: "Return" // Defaulting since not in line item
                            })),
                            creditMemos: (data.Credit_Memo_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // or item.Credit_Memo_Name
                                status: item.Status__c || "Draft",
                                description: item.Product_Description__c || "",
                                requestDate: "",
                                type: "Credit Memo",
                                reason: "",
                                totalAmount: item.Line_Grand_Total__c || 0,
                                creditToAccountName: "N/A",
                                invoiceName: item.Invoice_Line_Name || ""
                            })),
                            debitMemos: (data.Debit_Memo_Line__c || []).map((item: any) => ({
                                id: item.Id,
                                name: item.Name, // or item.Debit_Memo_Name
                                status: item.Status__c || "Draft",
                                description: item.Product_Description__c || "",
                                requestDate: "",
                                type: "Debit Memo",
                                reason: "",
                                totalAmount: item.Line_Grand_Total__c || 0,
                                debitToAccountName: "N/A"
                            }))
                        };
                        setReturnsData(mappedData);
                    }
                } catch (err) {
                    console.error("Error fetching line returns:", err);
                } finally {
                    setReturnsLoading(false);
                }
            }
        }

        fetchReturnsData();
    }, [activeTab, lineid, SF_ACCOUNT_ID, SF_CONTACT_ID]);

    // New Fields from Screenshot (Mocked)


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
            <Sidebar>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading product details...</p>
                    </div>
                </div>
            </Sidebar>
        );
    }

    // No data state
    if (!product) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Product not found</p>
                        <Link
                            href={`/proposals/${id}`}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Back to Proposal
                        </Link>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            {/* Breadcrumb - Compact */}
            <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <button
                        onClick={() => router.push("/proposals")}
                        className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Proposals
                    </button>
                    <span>&gt;</span>
                    <button
                        onClick={() => router.push(`/proposals/${id}`)}
                        className="hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Proposal Details
                    </button>
                    <span>&gt;</span>
                    <span className="text-gray-900 dark:text-white">Product Details</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h1>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Line {lineNumber} of {totalLines}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Back to Proposal Button */}
                        <Link
                            href={`/proposals/${id}`}
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
                            Back to Proposal
                        </Link>
                    </div>
                </div>
            </div>

            {/* Row 1: Main Image + Proposal Note + Product Information */}
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

                {/* Proposal Note - 25% width (3 of 12 cols) */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Proposal Note
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
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
                            {/* Manufacturer DBA */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Manufacturer DBA
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {product.manufacturer}
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
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3">
                            {/* Product Grouping */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Product Grouping
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {product.productGrouping}
                                </p>
                            </div>
                            {/* Grouping */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Grouping
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {product.grouping}
                                </p>
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
                            {/* Available to Sell */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Available to Sell
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white  font-mono">
                                    {product.availableToSell?.toLocaleString()}
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
                            {/* Unit Cost */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Unit Cost
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {product.unitCost}
                                </p>
                            </div>
                            {/* Total Cost */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                    Total Cost
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {product.totalCost}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Thumbnail Images + Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">


                {/* Details Card - Full width */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white">Unit Price</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Order Qty</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">MOQ</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Total Qty</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Total Price</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Shipping</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Taxes</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Grand Total</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">Shipped</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-2 py-3 text-sm text-gray-900 dark:text-white">
                                        ${unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">{quantity}</td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">{product.moq}</td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">{product.quantity}</td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">
                                        ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">
                                        ${shippingCharges.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">
                                        ${taxes.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right font-bold text-primary">
                                        ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-right text-gray-900 dark:text-white">{product.qtyShipped}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Row 3: Related Items Tabs (Fulfillments, Purchases, Returns) */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                {/* Tabs Header */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab("fulfillments")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "fulfillments"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Fulfillments
                    </button>
                    <button
                        onClick={() => setActiveTab("purchases")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "purchases"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Purchases
                    </button>
                    <button
                        onClick={() => setActiveTab("returns")}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "returns"
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                    >
                        Returns
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "fulfillments" && (
                        <LineFulfillmentsTab
                            fulfillmentData={fulfillmentData}
                            loading={fulfillmentLoading}
                            activeTab={fulfillmentActiveTab}
                            onTabChange={setFulfillmentActiveTab}
                        />
                    )}
                    {activeTab === "purchases" && (
                        <LinePurchasesTab
                            purchasesData={purchasesData}
                            loading={purchasesLoading}
                        />
                    )}
                    {activeTab === "returns" && (
                        <LineReturnsTab
                            returnsData={returnsData}
                            loading={returnsLoading}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Below Order Details, Right aligned */}
            <div className="flex items-center justify-end gap-2 mt-4">
                {/* Previous Line Button */}
                {hasPrevLine ? (
                    <Link
                        href={`/proposals/${id}/lines/${prevLineId}`}
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
                        href={`/proposals/${id}/lines/${nextLineId}`}
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
        </Sidebar>
    );
}
