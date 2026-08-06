"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ProposalStatus, Proposal } from "../types";
import {
  ProposalElement,
  ProposalFile,
  ProposedProduct,
  Project,
  Order,
  FulfillmentData,
  ProposalTabType,
  FulfillmentTabType,
  SortDirection,
  Invoice,
  ShippingManifest,
  SalesOrder,
  CustomerQuote,
  PurchaseOrder,
  Return,
  ReturnsData,
  SupplierBill,
  TaxDetail
} from "./types";
import { formatAddress } from "./utils";
import { formatDate, decodeHtmlEntities } from "@/lib/utils/formatting";
import jsPDF from "jspdf";

// Component Imports
import ProposalHeader from "./components/ProposalHeader";
import ProposalDetails from "./components/ProposalDetails";
import ProposalTabs from "./components/ProposalTabs";
import ProductsTab from "./components/ProductsTab";
import ElementsTab from "./components/ElementsTab";
import FilesTab from "./components/FilesTab";
import SignaturesTab from "./components/SignaturesTab";
import ProjectsTab from "./components/ProjectsTab";
import OrdersTab from "./components/OrdersTab";
import FulfillmentsTab from "./components/FulfillmentsTab";
import PurchasesTab from "./components/PurchasesTab";
import ReturnsTab from "./components/ReturnsTab";
import TaxesTab from "./components/TaxesTab";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error, warning } = useToast();

  // State
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposedProducts, setProposedProducts] = useState<ProposedProduct[]>([]);
  const [proposalElements, setProposalElements] = useState<ProposalElement[]>([]);
  const [proposalFiles, setProposalFiles] = useState<ProposalFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);
  const [returnsData, setReturnsData] = useState<ReturnsData>({
    rma: [],
    rtv: [],
    creditMemos: [],
    debitMemos: []
  });
  const [fulfillmentData, setFulfillmentData] = useState<FulfillmentData>({
    invoices: [],
    shippingManifests: [],
    salesOrders: [],
    customerQuotes: []
  });
  const [taxesData, setTaxesData] = useState<TaxDetail[]>([]);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFulfillmentTab, setActiveFulfillmentTab] = useState<FulfillmentTabType>("quotes");

  // Tab and sorting state
  const [activeTab, setActiveTab] = useState<ProposalTabType>("products");

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || user?.accountId || "";
  const SF_CONTACT_ID = user?.Id || "";
  const accountType = selectedAccount?.Account_Record_Type__c || selectedAccount?.Type;
  const isRestricted = accountType === 'Customer' || accountType === 'NSO';

  // Resizable Columns hooks
  const { widths: productWidths, handleResize: handleProductResize } = useResizableColumns({
    Name: 200,
    status: 120,
    productName: 200,
    description: 200,
    brandName: 170,
    grouping: 150,
    unitPrice: 130,
    quantity: 150,
    subtotal: 130,
    shipping: 130,
    taxes: 120,
    grandTotal: 160,
    qtyShipped: 130,
    actions: 80
  });

  const { widths: elementWidths, handleResize: handleElementResize } = useResizableColumns({
    wbs: 100,
    proposalElement: 300,
    description: 500
  });

  const { widths: projectWidths, handleResize: handleProjectResize } = useResizableColumns({
    projectNumber: 150,
    status: 120,
    name: 250,
    customerAccountName: 200,
    customerContactName: 200,
    billingType: 150,
    projectManagerName: 200,
    estimatedBudget: 200,
    totalMilestones: 170,
    totalTasks: 120,
    percentCompleted: 140,
    estimatedStartDate: 190,
    estimatedEndDate: 180
  });

  const { widths: orderWidths, handleResize: handleOrderResize } = useResizableColumns({
    name: 180,
    status: 150,
    customerPO: 180,
    customerPODate: 190,
    billToAccountName: 180,
    billToLocationName: 180,
    billToContactName: 180,
    shipToAccountName: 180,
    shipToLocationName: 180,
    shipToContactName: 180,
    proposalRequested: 160,
    transferOrder: 160,
    dropShip: 180,
    totalLines: 180,
    totalPrice: 160,
    totalShippingCharges: 180,
    totalTaxesAmount: 180,
    grandTotal: 150,
    requestDate: 150,
    shipDate: 200,
    deliveredDate: 200
  });

  const { widths: purchaseWidths, handleResize: handlePurchaseResize } = useResizableColumns({
    name: 180,
    status: 120,
    customerQuoteName: 180,
    customerOrderName: 180,
    salesOrderName: 180,
    shipmentName: 180,
    customerPO: 150,
    supplierName: 180,
    supplierDBA: 180,
    supplierContact: 180,
    shipToAccountName: 180,
    shipToLocationName: 180,
    shipToContactName: 180,
    dropShip: 100,
    totalLines: 100,
    productCost: 120,
    shippingCost: 120,
    totalCost: 120,
    issuedDate: 150,
    acknowledgedDate: 150,
    requestDate: 150,
    promiseDate: 150,
    shippingMethod: 150,
    logisticsPartner: 180,
    logisticsContact: 180,
    trackingNumber: 180,
    estimatedDeliveryDate: 150,
    trackingStatus: 150,
    actualDeliveryDate: 150,
    goodsReceiptsDate: 150
  });

  const { widths: billWidths, handleResize: handleBillResize } = useResizableColumns({
    name: 180,
    status: 120,
    purchaseOrderName: 180,
    customerQuoteName: 180,
    customerOrderName: 180,
    salesOrderName: 180,
    shipmentName: 180,
    supplierName: 180,
    supplierDBA: 180,
    supplierContact: 180,
    totalLines: 100,
    totalProductAmount: 120,
    totalShippingCharges: 120,
    totalAmount: 120,
    billedDate: 150,
    paymentTerms: 150,
    dueDate: 150,
    remittanceStatus: 120,
    openBalance: 120,
    daysOutstanding: 120,
    settledDate: 150
  });

  const [fulfillmentWidths, setFulfillmentWidths] = useState({
    invoices: {
      name: 180, status: 180, salesOrderName: 200, purchaseOrderName: 180, customerQuoteName: 200,
      proposalId: 180, proposalName: 180, customerOrderName: 200, customerPO: 150,
      billToAccountName: 180, billToLocationName: 180, billToContactName: 180, totalLines: 160,
      totalPrice: 160, totalShippingCharges: 120, totalTaxesAmount: 120, grandTotal: 150,
      issuedDate: 160, paymentTerms: 150, dueDate: 150, collectionStatus: 180, openBalance: 180,
      settledDate: 180
    },
    shipping: {
      name: 180, status: 180, salesOrderName: 180, customerQuoteName: 180,
      proposalId: 180, proposalName: 180, customerOrderName: 180,
      customerPO: 150, shipToAccountName: 180, shipToLocationName: 180, shipToContactName: 180,
      dropShip: 160, totalLines: 160, totalPrice: 120,
      boxCount: 160, boxLength: 130, boxWidth: 120, boxHeight: 120, boxNetWeight: 160, boxGrossWeight: 160,
      logisticsPartnerName: 180, shipDate: 190, deliveredDate: 190, trackingNumber: 180,
      trackingStatus: 150, estimatedDeliveryDate: 200, actualDeliveryDate: 190
    },
    sales: {
      name: 180, status: 180, customerQuoteName: 180, proposalId: 180, proposalName: 180,
      customerOrderName: 180, customerPO: 150,
      billToAccountName: 180, billToLocationName: 180, billToContactName: 180, shipToAccountName: 180,
      shipToLocationName: 180, shipToContactName: 180, dropShip: 160, totalLines: 160, totalPrice: 120,
      totalShippingCharges: 120, totalTaxesAmount: 120, grandTotal: 150, requestDate: 190,
      shipDate: 180, deliveredDate: 180
    },
    quotes: {
      name: 180, status: 180, proposalId: 180, proposalName: 180, customerOrderName: 180,
      customerPO: 150, billToAccountName: 180,
      billToLocationName: 180, billToContactName: 180, shipToAccountName: 180, shipToLocationName: 180,
      shipToContactName: 180, dropShip: 150, totalLines: 150, totalPrice: 120, totalShippingCharges: 120,
      totalTaxesAmount: 120, grandTotal: 150, issuedDate: 150, expirationDate: 180, requestDate: 150,
      shipDate: 180, deliveredDate: 180
    }
  });

  const handleFulfillmentResize = (tab: string, field: string, width: number) => {
    setFulfillmentWidths(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [field]: Math.max(50, width)
      }
    }));
  };

  const [returnsWidths, setReturnsWidths] = useState({
    rma: {
      name: 180, status: 120, rmaType: 150, salesOrderName: 180, customerQuoteName: 180,
      proposalId: 180, proposalName: 180, customerOrderName: 180, customerPO: 150,
      shipFromAccountName: 180, shipFromContactName: 180, returnToAccountName: 180,
      returnToContactName: 180, dropShip: 100, totalLines: 100, totalPrice: 120, issuedDate: 150,
      returnByDate: 150, shippingMethod: 150, logisticsPartner: 180, logisticsContact: 180,
      trackingNumber: 180, trackingStatus: 190, estimatedDeliveryDate: 190, actualDeliveryDate: 190,
      goodsReceiptDate: 190, supplierBillName: 180, shipmentName: 180
    },
    rtv: {
      purchaseOrderName: 180, customerQuoteName: 180, customerOrderName: 180, rtvType: 150,
      rmaNumber: 150, shipFromAccountName: 180, shipFromContactName: 180, supplierName: 180,
      supplierContact: 180, totalLines: 100, totalCost: 120, issuedDate: 150, approvalDate: 150,
      returnByDate: 150, name: 180, status: 120, salesOrderName: 180, supplierBillName: 180, shipmentName: 180
    },
    credit: {
      name: 180, status: 120, invoiceName: 180, salesOrderName: 180, customerQuoteName: 180,
      proposalId: 180, proposalName: 180, customerOrderName: 180,
      totalLines: 100, totalPrice: 120, totalShippingCharges: 120,
      totalTaxesAmount: 120, totalCreditAmount: 150, issuedDate: 150, expirationDate: 150,
      availableCreditBalance: 190, settledDate: 190,
      purchaseOrderName: 180, supplierBillName: 180, shipmentName: 180
    },
    debit: {
      supplierBillName: 180, purchaseOrderName: 180, customerOrderName: 180, supplierCreditMemoName: 180,
      debitToAccountName: 180, debitToContactName: 180, totalLines: 180, totalCost: 160,
      totalShippingCharges: 180, totalDebitAmount: 180, issuedDate: 150, approvalDate: 190,
      availableDebitBalance: 190, settledDate: 150, name: 180, status: 150,
      customerQuoteName: 180, salesOrderName: 180, shipmentName: 180
    }
  });

  const handleReturnsResize = (tab: string, field: string, width: number) => {
    setReturnsWidths(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [field]: Math.max(50, width)
      }
    }));
  };

  const { widths: taxWidths, handleResize: handleTaxResize } = useResizableColumns({
    salesTaxRate: 150, salesTaxAmount: 150, useTaxRate: 150, useTaxAmount: 150,
    localTaxRate: 150, localTaxAmount: 150, exciseTaxRate: 150, exciseTaxAmount: 150,
    grossReceiptsTaxRate: 150, grossReceiptsTaxAmount: 150, gstRate: 150, gstAmount: 150,
    vatRate: 150, vatAmount: 150
  });

  // Fetch Proposal
  useEffect(() => {
    async function fetchProposal() {
      try {
        const res = await fetch(`/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${id}&action=view`);
        if (!res.ok) throw new Error('Failed to fetch proposal');
        const data = await res.json();

        let item: any = null;
        if (Array.isArray(data) && data.length > 0) {
          item = data[0];
        } else if (data && data.Proposal__c && Array.isArray(data.Proposal__c) && data.Proposal__c.length > 0) {
          item = data.Proposal__c[0];
        } else if (data && data.Id) {
          item = data;
        }

        if (item) {
          const mappedProposal: Proposal = {
            id: item.Id,
            proposalNumber: item.Proposal_Number__c || item.Name || 'N/A',
            proposalName: item.Name || item.Proposal_Name__c || 'N/A',
            accountName: item.Inventory_Account_Name || 'Unknown Account',
            contactName: item.Client_Signed_By__c || 'Unknown Contact',
            status: (item.Status__c as ProposalStatus) || 'Draft',
            totalAmount: item.Total_Price__c || 0,
            totalShippingCharges: item.Total_Shipping_Charges__c || 0,
            totalTaxesAmount: item.Total_Taxes_Amount__c || item.Total_Taxes__c || 0,
            proposalDate: formatDate(item.Issued_Date__c || item.CreatedDate, 'numeric-dash'),
            expirationDate: formatDate(item.Expiration_Date__c, 'numeric-dash'),
            description: item.Name || '',
            productCount: item.Total_Lines__c || 0,
            billTo: item.Authorized_Bill_To_Location_Name || 'N/A',
            shipTo: item.Authorized_Ship_To_Location_Name || 'N/A',
            opportunityName: '',
            companySignedDate: formatDate(item.Company_Signed_Date__c, 'numeric-dash'),
            submittedBy: item.Company_Signed_By__c || '',
            accountId: item.Inventory_Account__c || item.AccountId || '',
            contactId: item.Client_Signed_By__c || item.ContactId || '',
            orderId: item.Customer_Order__c || item.Id || '',
            site: item.Site_Name || '',
            billToAccount: item.Authorized_Bill_To_Account_Name || item.Bill_To_Account_Name || item.Inventory_Account_Name || '',
            shipToAccount: item.Authorized_Ship_To_Account_Name || item.Ship_To_Account_Name || item.Inventory_Account_Name || '',
            accountExecutive: item.Owner_Name || item.Owner?.Name || item.Company_Signed_By_Name || 'N/A'
          };

          const detailedProposal = {
            ...mappedProposal,
            accountExecutive: item.Owner_Name || item.Owner?.Name || item.Company_Signed_By_Name || 'N/A',
            issuedDate: formatDate(item.Issued_Date__c, 'numeric-dash'),
            orderNumber: item.Customer_Order_Name || '',
            billingAddress: formatAddress(item.Authorized_Bill_To_Location_Address),
            paymentTerms: item.Payment_Terms__c || '',
            customerPO: item.Customer_PO__c || '',
            shippingAddress: formatAddress(item.Authorized_Ship_To_Location_Address),
            requestedDeliveryDate: formatDate(item.Request_Date__c, 'numeric-dash'),
            dropShip: item.Drop_Ship__c || false,
            site: item.Site_Name || '',
            specialTerms: decodeHtmlEntities(item.Scope__c?.replace(/<[^>]*>?/gm, '') || ''),
            internalNotes: '',
            clientSignedBy: item.Company_Signed_By_Name,
            clientSignedTitle: item.Client_Signed_Title__c,
            clientSignedDate: formatDate(item.Client_Signed_Date__c, 'numeric-dash'),
            companySignedBy: item.Company_Signed_By_Name,
            companySignedTitle: item.Company_Signed_Title__c,
            proposalType: item.Proposal_Type__c || '',
            priceBook: item.Price_Book_Name || item.Pricebook2Id || '',
            Proposal_Notes: item.Proposal_Notes__c || item.Proposal_Notes || '',
            Project_Workspace__c: item.Project_Workspace__c || ''
          };

          setProposal(detailedProposal as any);

          if (item.Proposal_Elements__r && item.Proposal_Elements__r.records) {
            const elements = item.Proposal_Elements__r.records.map((el: any) => ({
              id: el.Id,
              wbs: el.WBS__c || '',
              proposalElement: el.Name || '',
              description: decodeHtmlEntities(el.Description__c || '')
            }));
            setProposalElements(elements);
          }
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id && SF_ACCOUNT_ID && SF_CONTACT_ID) {
      fetchProposal();
    }
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Fetch data function
  const fetchTabData = useCallback(async (tab: string, isBackground: boolean = false) => {
    if (!proposal?.id) return;

    if (!isBackground) setTabLoading(true);
    try {
      let url = `/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${proposal.id}`;

      switch (tab) {
        case 'elements':
          url += '&action=elements';
          break;
        case 'products':
          url += '&action=products';
          break;
        case 'files':
          url += '&action=files';
          break;
        case 'projects':
          url += '&action=projects';
          break;
        case 'orders':
          url += '&action=orders';
          break;
        case 'fulfillment':
          url += '&action=fulfillment';
          break;
        case 'purchases':
          url += '&action=purchases';
          break;
        case 'returns':
          url += '&action=returns';
          break;
        case 'taxes':
          url += '&action=taxes';
          break;
        default:
          if (!isBackground) setTabLoading(false);
          return;
      }

      // console.log(`Fetching ${tab} from:`, url);
      const res = await fetch(url);
      const json = await res.json();

      switch (tab) {
        case 'elements':
          if (json.length > 0) {
            setProposalElements(json.map((el: any) => ({
              id: el.Id,
              wbs: el.WBS__c || '',
              proposalElement: el.Name || '',
              description: decodeHtmlEntities(el.Description__c || ''),
              proposalId: el.Proposal__c
            })));
          }
          break;
        case 'products':
          if (json.length > 0) {
            setProposedProducts(json.map((item: any) => ({
              id: item.Id,
              Name: item.Name || 'N/A',
              productName: item.Product_Name || 'Unknown Product',
              productId: item.Product_Name__c || "-",
              productSku: item.Name || 'N/A',
              description: item.Product_Description__c || '',
              manufacturer: item.Manufacturer_Name__c || '',
              manufacturerDBA: item.Manufacturer_DBA__c || item.Manufacturer_Name__c || '',
              productFamily: item.Product_Family__c || 'General',
              grouping: item.Groupings__c || '',
              status: item.Status__c || '',
              brandName: item.Brand_Name__c || '',
              qtyShipped: item.Qty_Shipped__c || 0,
              category: item.Category__c || item.Product_Family__c || 'General',
              quantity: item.Total_Order_Qty__c || 0,
              unitPrice: item.Unit_Price__c || 0,
              margin: item.Margin__c || 0,
              subtotal: item.Total_Price__c || 0,
              shipping: item.Shipping_Charges__c || 0,
              taxes: item.Total_Taxes_Amount__c || item.Tax_Amount__c || 0,
              grandTotal: item.Line_Grand_Total__c || 0,
              product_record_type: item.Product_Record_Type__c || item.product_record_type || item.RecordType?.Name || ''
            })));
          }
          break;
        case 'files':
          if (Array.isArray(json)) {
            setProposalFiles(json.map((f: any) => ({
              id: f.Id,
              contentDocumentId: f.ContentDocumentId,
              fileName: f.Title,
              fileType: f.FileExtension,
              fileSize: f.FileSize ? f.FileSize : '0 MB', // Approximate formatting
              sizeInBytes: f.FileSize || 0,
              uploadedBy: f.CreatedBy,
              uploadedDate: formatDate(f.CreatedDate, 'numeric-dash'),
              category: 'General',
              downloadUrl: f.DownloadUrl
            })));
          }
          break;
        case 'projects':
          if (Array.isArray(json) && json.length > 0) {
            setProjects(json.map((proj: any) => ({
              id: proj.Id,
              name: proj.Name || '',
              projectNumber: proj.Project_Number__c || '',
              status: proj.Status__c || '',
              customerAccountName: proj.Customer_Account_Name || '',
              customerContactName: proj.Customer_Contact_Name || '',
              billingType: proj.Billing_Type__c || '',
              projectManagerName: proj.Project_Manager_Name || '',
              estimatedBudget: proj.Estimated_Budget__c || 0,
              totalMilestones: proj.Total_Milestones__c || 0,
              totalTasks: proj.Total_Tasks__c || 0,
              percentCompleted: proj.Percent_Completed__c,
              estimatedStartDate: formatDate(proj.Estimated_Start_Date__c, 'numeric-dash'),
              estimatedEndDate: formatDate(proj.Estimated_End_Date__c, 'numeric-dash')
            })));
          } else {
            setProjects([]);
          }
          break;
        case 'orders':
          if (Array.isArray(json) && json.length > 0) {
            setOrders(json.map((order: any) => ({
              id: order.Id,
              name: order.Name || '',
              status: order.Status__c || '',
              customerPO: order.Customer_PO__c || '',
              purchaseOrderId: order.Purchase_Order__c || '',
              customerPODate: formatDate(order.Customer_PO_Date__c, 'numeric-dash'),
              billToAccountName: order.Bill_to_Account_Name || '',
              billToLocationName: order.Authorized_Bill_To_Location_Name || '',
              billToContactName: order.Bill_to_Contact_Name || '',
              shipToAccountName: order.Ship_to_Account_Name || '',
              shipToLocationName: order.Authorized_Ship_To_Location_Name || '',
              shipToContactName: order.Ship_to_Contact_Name || '',
              dropShip: order.Drop_Ship__c || false,
              totalLines: order.Total_Lines__c || 0,
              totalPrice: order.Total_Price__c || 0,
              totalShippingCharges: order.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: order.Total_Taxes_Amount__c || 0,
              grandTotal: order.Grand_Total__c || 0,
              requestDate: formatDate(order.Request_Date__c, 'numeric-dash'),
              shipDate: formatDate(order.Ship_Date__c, 'numeric-dash'),
              deliveredDate: formatDate(order.Delivered_Date__c, 'numeric-dash'),
              proposalRequested: order.Proposal_Requested__c || false,
              transferOrder: order.Transfer_Order__c || false
            })));
          } else {
            setOrders([]);
          }
          break;
        case 'purchases':
          const purchaseOrders = (json.Purchase_Order__c || []);
          if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
            setPurchases(purchaseOrders.map((p: any) => ({
              id: p.Id,
              name: p.Name || '',
              status: p.Status__c || '',
              customerQuoteName: p.Customer_Quote_Name || '',
              customerOrderName: p.Customer_Order_Name || '',
              salesOrderName: p.Sales_Order_Name || p.Sales_Order__r?.Name || '',
              shipmentName: p.Shipment_Name || p.Shipment__r?.Name || '',
              customerPO: p.Customer_PO__c || '',
              supplierName: p.Supplier_Name || p.Supplier__r?.Name || p.Supplier_Name__c || '',
              supplierDBA: p.Supplier_DBA__c || '',
              supplierContact: p.Supplier_Contact_Name || p.Supplier_Contact__c || '',
              shipToAccountName: p.Ship_to_Account_Name || '',
              shipToLocationName: p.Authorized_Ship_To_Location_Name || '',
              shipToContactName: p.Ship_to_Contact_Name || '',
              dropShip: p.Drop_Ship__c || false,
              totalLines: p.Total_Lines__c || 0,
              productCost: p.Total_Product_Cost__c || 0,
              shippingCost: p.Total_Shipping_Charges__c || 0,
              totalCost: p.Total_Cost__c || 0,
              issuedDate: formatDate(p.Issued_Date__c, 'numeric-dash'),
              acknowledgedDate: formatDate(p.Acknowledged_Date__c, 'numeric-dash'),
              requestDate: formatDate(p.Request_Date__c, 'numeric-dash'),
              promiseDate: formatDate(p.Promise_Date__c, 'numeric-dash'),
              shippingMethod: p.Shipping_Method__c || '',
              logisticsPartner: p.Logistics_Partner_Name || '',
              logisticsContact: p.Logistics_Contact_Name || '',
              trackingNumber: p.Tracking_Number__c || '',
              estimatedDeliveryDate: formatDate(p.Estimated_Delivery_Date__c, 'numeric-dash'),
              trackingStatus: p.Tracking_Status__c || '',
              actualDeliveryDate: formatDate(p.Actual_Delivery_Date__c, 'numeric-dash'),
              goodsReceiptsDate: formatDate(p.Goods_Receipt_Date__c, 'numeric-dash'),
              customerQuoteId: p.Customer_Quote__c || '',
              customerOrderId: p.Customer_Order_Name__c || p.Customer_Order__c || '',
              purchaseOrderId: p.Purchase_Order__c || '',
              salesOrderId: p.Sales_Order__c || '',
              shipmentId: p.Shipment__c || ''
            })));
          } else {
            setPurchases([]);
          }

          const sBills = (json.Supplier_Bill__c || []);
          if (Array.isArray(sBills) && sBills.length > 0) {
            setSupplierBills(sBills.map((sb: any) => ({
              id: sb.Id,
              name: sb.Name || '',
              status: sb.Status__c || '',
              purchaseOrderName: sb.Purchase_Order_Name || '',
              customerQuoteName: sb.Customer_Quote_Name || '',
              customerOrderName: sb.Customer_Order_Name || '',
              salesOrderName: sb.Sales_Order_Name || '',
              shipmentName: sb.Shipment_Name || '',
              supplierName: sb.Supplier_Name || '',
              supplierDBA: sb.Supplier_DBA__c || '',
              supplierContact: sb.Supplier_Contact_Name || '',
              totalLines: sb.Total_Lines__c || 0,
              totalProductAmount: sb.Total_Product_Amount__c || 0,
              totalShippingCharges: sb.Total_Shipping_Charges__c || 0,
              totalAmount: sb.Total_Amount__c || 0,
              billedDate: formatDate(sb.Billed_Date__c, 'numeric-dash'),
              paymentTerms: sb.Payment_Terms__c || '',
              dueDate: formatDate(sb.Due_Date__c, 'numeric-dash'),
              remittanceStatus: sb.Remittance_Status__c || '',
              openBalance: sb.Open_Balance__c || 0,
              daysOutstanding: sb.Days_Outstanding__c || 0,
              settledDate: formatDate(sb.Settled_Date__c, 'numeric-dash'),
              purchaseOrderId: sb.Purchase_Order__c || '',
              customerQuoteId: sb.Customer_Quote__c || '',
              customerOrderId: sb.Customer_Order__c || '',
              salesOrderId: sb.Sales_Order__c || '',
              shipmentId: sb.Shipment__c || ''
            })));
          } else {
            setSupplierBills([]);
          }
          break;
        case 'returns':
          setReturnsData({
            rma: (json.RMA__c || []).map((r: any) => ({
              id: r.Id,
              name: r.Name || '',
              status: r.Status__c || '',
              salesOrderName: r.Sales_Order_Name || r.gtherp__Sales_Order__c || '',
              customerQuoteName: r.Customer_Quote_Name || '',
              customerOrderName: r.Customer_Order_Name || '',
              rmaType: r.RMA_Type__c || '',
              shipFromAccountName: r.Ship_from_Account_Name || '',
              shipFromContactName: r.Ship_from_Contact_Name || '',
              returnToAccountName: r.Return_to_Account_Name || '',
              returnToContactName: r.Return_to_Contact_Name || '',
              dropShip: r.Drop_Ship__c || false,
              totalLines: r.Total_Lines__c || 0,
              totalPrice: r.Total_Price__c || 0,
              issuedDate: formatDate(r.Issued_Date__c, 'numeric-dash'),
              returnByDate: formatDate(r.Return_by_Date__c, 'numeric-dash'),
              shippingMethod: r.Shipping_Method__c || '',
              logisticsPartner: r.Logistics_Partner_Name || '',
              logisticsContact: r.Logistics_Contact_Name || '',
              trackingNumber: r.Tracking_Number__c || '',
              estimatedDeliveryDate: formatDate(r.Estimated_Delivery_Date__c, 'numeric-dash'),
              trackingStatus: r.Tracking_Status__c || '',
              actualDeliveryDate: formatDate(r.Actual_Delivery_Date__c, 'numeric-dash'),
              goodsReceiptDate: formatDate(r.Goods_Receipt_Date__c, 'numeric-dash'),
              customerPO: r.Customer_PO__c || '',
              supplierBillName: r.Supplier_Bill_Name || r.gtherp__Supplier_Bill__r?.Name || '',
              shipmentName: r.Shipment_Name || r.Shipment__r?.Name || '',
              // Existing fields for compatibility if needed (Base Return interface requirements)
              description: r.Name || '',
              requestDate: formatDate(r.Goods_Receipt_Date__c, 'numeric-dash'),
              type: 'RMA',
              reason: r.RMA_Type__c || '',
              totalAmount: r.Total_Price__c || 0,
              customerQuoteId: r.Customer_Quote__c || '',
              customerOrderId: r.Customer_Order__c || '',
              salesOrderId: r.Sales_Order__c || '',
              proposalId: r.Proposal__c || '',
              proposalName: r.Proposal_Name || r.Proposal__r?.Name || '',
              proposalNumber: r.Proposal_Number__c || r.Proposal_Name || r.Proposal__r?.Name || ''
            })),
            rtv: (json.RTV__c || []).map((r: any) => ({
              id: r.Id,
              name: r.Name || '',
              status: r.Status__c || '',
              purchaseOrderName: r.Purchase_Order_Name || '',
              customerQuoteName: r.Customer_Quote_Name || '',
              customerOrderName: r.Customer_Order_Name || '',
              rtvType: r.RTV_Type__c || '',
              rmaNumber: r.Supplier_RMA_Number__c || '',
              shipFromAccountName: r.Ship_from_Account_Name || '',
              shipFromContactName: r.Ship_from_Contact_Name || '',
              supplierName: r.Supplier_Name || '',
              supplierContact: r.Supplier_Contact_Name || '',
              totalLines: r.Total_Lines__c || 0,
              totalCost: r.Total_Cost__c || 0,
              issuedDate: formatDate(r.Issued_Date__c, 'numeric-dash'),
              approvalDate: formatDate(r.Approval_Date__c, 'numeric-dash'),
              returnByDate: formatDate(r.Return_by_Date__c, 'numeric-dash'),
              // Existing fields for compatibility if needed (Base Return interface)
              description: r.Name || '',
              requestDate: formatDate(r.Issued_Date__c, 'numeric-dash'),
              type: r.RTV_Type__c || 'RTV',
              reason: '',
              totalAmount: r.Total_Cost__c || 0,
              purchaseOrderId: r.Purchase_Order__c || '',
              customerQuoteId: r.Customer_Quote__c || '',
              customerOrderId: r.Customer_Order__c || '',
            })),
            creditMemos: (json.Credit_Memo__c || []).map((c: any) => ({
              id: c.Id,
              name: c.Name || '',
              status: c.Status__c || '',
              invoiceName: c.Invoice_Name || '',
              customerQuoteName: c.Customer_Quote_Name || '',
              customerOrderName: c.Customer_Order_Name || '',
              creditToAccountName: c.Credit_to_Account_Name || '',
              creditToContactName: c.Credit_to_Contact_Name || '',
              totalLines: c.Total_Lines__c || 0,
              totalPrice: c.Total_Price__c || 0,
              totalShippingCharges: c.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: c.Total_Taxes_Amount__c || 0,
              totalCreditAmount: c.Total_Credit_Amount__c || 0,
              issuedDate: formatDate(c.Issued_Date__c, 'numeric-dash'),
              expirationDate: formatDate(c.Expiration_Date__c, 'numeric-dash'),
              availableCreditBalance: c.Available_Credit_Balance__c || 0,
              settledDate: formatDate(c.Settled_Date__c, 'numeric-dash'),
              // Existing fields for compatibility
              description: c.Name || '',
              requestDate: formatDate(c.Issued_Date__c, 'numeric-dash'),
              type: 'Credit Memo',
              reason: '',
              totalAmount: c.Total_Credit_Amount__c || 0,
              invoiceId: c.Invoice__c || '',
              customerQuoteId: c.Customer_Quote__c || '',
              customerOrderId: c.Customer_Order__c || '',
              salesOrderId: c.Sales_Order__c || '',
              shipmentId: c.Shipment__c || '',
              salesOrderName: c.Sales_Order_Name || '',
              proposalId: c.Proposal__c || '',
              proposalName: c.Proposal_Name || c.Proposal__r?.Name || '',
              proposalNumber: c.Proposal_Number__c || c.Proposal_Name || c.Proposal__r?.Name || ''
            })),
            debitMemos: (json.Debit_Memo__c || []).map((d: any) => ({
              id: d.Id,
              name: d.Name || '',
              status: d.Status__c || '',
              supplierBillName: d.Supplier_Bill_Name || d.gtherp__Supplier_Bill__c || '',
              purchaseOrderName: d.Purchase_Order_Name || d.gtherp__Purchase_Order__c || '',
              customerOrderName: d.Customer_Order_Name || d.gtherp__Customer_Order__c || '',
              supplierCreditMemoName: d.Supplier_Credit_Memo__c || d.gtherp__Supplier_Credit_Memo__c || '',
              debitToAccountName: d.Debit_to_Account_Name || d.gtherp__Debit_to_Account__c || '',
              debitToContactName: d.Debit_to_Contact_Name || d.gtherp__Debit_to_Contact__c || '',
              customerQuoteName: d.Customer_Quote_Name || d.gtherp__Customer_Quote__r?.Name || '',
              salesOrderName: d.Sales_Order_Name || d.gtherp__Sales_Order__r?.Name || '',
              shipmentName: d.Shipment_Name || d.Shipment__r?.Name || '',
              totalLines: d.Total_Lines__c || 0,
              totalCost: d.Total_Cost__c || 0,
              totalShippingCharges: d.Total_Shipping_Charges__c || 0,
              totalDebitAmount: d.Total_Debit_Amount__c || 0,
              issuedDate: formatDate(d.Issued_Date__c, 'numeric-dash'),
              approvalDate: formatDate(d.Approval_Date__c, 'numeric-dash'),
              availableDebitBalance: d.Available_Debit_Balance__c || 0,
              settledDate: formatDate(d.Settled_Date__c, 'numeric-dash'),
              // Existing fields for compatibility
              description: d.Name || '',
              requestDate: formatDate(d.Issued_Date__c, 'numeric-dash'),
              type: 'Debit Memo',
              reason: '',
              totalAmount: d.Total_Debit_Amount__c || 0,
              supplierBillId: d.Supplier_Bill__c || '',
              purchaseOrderId: d.Purchase_Order__c || '',
              customerOrderId: d.Customer_Order__c || '',
              salesOrderId: d.Sales_Order__c || '',
              customerQuoteId: d.Customer_Quote__c || '',
              shipmentId: d.Shipment__c || ''
            })),
          });
          break;
        case 'taxes':
          let taxDataArray: any[] = [];

          if (Array.isArray(json)) {
            taxDataArray = json;
          } else if (Array.isArray(json?.data) && json.data.length > 0 && json.data[0].Proposal__c) {
            taxDataArray = json.data[0].Proposal__c;
          } else if (Array.isArray(json?.Proposal__c)) {
            taxDataArray = json.Proposal__c;
          } else if (json?.data && Array.isArray(json.data)) {
            // Fallback: try to find any array in the data
            const potentialData = json.data[0];
            if (potentialData) {
              const key = Object.keys(potentialData).find(k => Array.isArray(potentialData[k]));
              if (key) taxDataArray = potentialData[key];
            }
          }

          if (taxDataArray.length > 0) {
            setTaxesData(taxDataArray.map((t: any) => ({
              id: t.Id,
              salesTaxRate: t.Sales_Tax_Rate__c || 0,
              salesTaxAmount: t.Total_Sales_Tax_Amount__c || 0,
              useTaxRate: t.Use_Tax_Rate__c || 0,
              useTaxAmount: t.Total_Use_Tax_Amount__c || 0,
              localTaxRate: t.Local_Tax_Rate__c || 0,
              localTaxAmount: t.Total_Local_Tax_Amount__c || 0,
              exciseTaxRate: t.Excise_Tax_Rate__c || 0,
              exciseTaxAmount: t.Total_Excise_Tax_Amount__c || 0,
              grossReceiptsTaxRate: t.Gross_Receipts_Tax_Rate__c || 0,
              grossReceiptsTaxAmount: t.Total_Gross_Receipts_Tax_Amount__c || 0,
              gstRate: t.GST_Rate__c || 0,
              gstAmount: t.Total_GST_Amount__c || 0,
              vatRate: t.VAT_Rate__c || 0,
              vatAmount: t.Total_VAT_Amount__c || 0
            })));
          } else {
            setTaxesData([]);
          }
          break;
        case 'fulfillment':
          setFulfillmentData({
            invoices: (json.Invoice__c || []).map((inv: any) => ({
              id: inv.Id,
              name: inv.Name || '',
              status: inv.Status__c || '',
              customerQuoteName: inv.Customer_Quote_Name || '',
              salesOrderName: inv.Sales_Order_Name || '',
              customerOrderName: inv.Customer_Order_Name || '',
              customerPO: inv.Customer_PO__c || '',
              salesOrderId: inv.Sales_Order__c || '',
              customerQuoteId: inv.Customer_Quote__c || '',
              customerOrderId: inv.Customer_Order__c || '',
              purchaseOrderId: inv.Purchase_Order__c || '',
              billToAccountName: inv.Bill_to_Account_Name || '',
              billToLocationName: inv.Authorized_Bill_To_Location_Name || '',
              billToContactName: inv.Bill_to_Contact_Name || '',
              totalLines: inv.Total_Lines__c || 0,
              totalPrice: inv.Total_Price__c || 0,
              totalShippingCharges: inv.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: inv.Total_Taxes_Amount__c || 0,
              grandTotal: inv.Grand_Total__c || 0,
              issuedDate: formatDate(inv.Issued_Date__c, 'numeric-dash'),
              dueDate: formatDate(inv.Due_Date__c, 'numeric-dash'),
              paymentTerms: inv.Payment_Terms__c || '',
              collectionStatus: inv.Collection_Status__c || '',
              openBalance: inv.Open_Balance__c || 0,
              daysOutstanding: inv.Days_Outstanding__c || 0,
              settledDate: formatDate(inv.Settled_Date__c, 'numeric-dash'),
              purchaseOrderName: inv.Purchase_Order_Name || inv.Purchase_Order__r?.Name || '',
              proposalId: inv.Proposal__c || '',
              proposalName: inv.Proposal_Name || inv.Proposal__r?.Name || '',
              proposalNumber: inv.Proposal_Number__c || inv.Proposal_Name || inv.Proposal__r?.Name || ''
            })),
            shippingManifests: (json.Shipping_Manifest__c || []).map((sm: any) => ({
              id: sm.Id,
              name: sm.Name || '',
              status: sm.Status__c || '',
              customerQuoteName: sm.Customer_Quote_Name || '',
              salesOrderName: sm.Sales_Order_Name || '',
              customerOrderName: sm.Customer_Order_Name || '',
              customerPO: sm.Customer_PO__c || '',
              salesOrderId: sm.Sales_Order__c || '',
              customerQuoteId: sm.Customer_Quote__c || '',
              customerOrderId: sm.Customer_Order__c || '',
              purchaseOrderId: sm.Purchase_Order__c || '',
              shipToAccountName: sm.Ship_to_Account_Name || '',
              shipToLocationName: sm.Authorized_Ship_To_Location_Name || '',
              shipToContactName: sm.Ship_to_Contact_Name || '',
              dropShip: sm.Drop_Ship__c || false,
              totalLines: sm.Total_Lines__c || 0,
              totalPrice: sm.Total_Price__c || 0,
              shippingMethod: sm.Shipping_Method__c || '',
              shipDate: formatDate(sm.Ship_Date__c, 'numeric-dash'),
              deliveredDate: formatDate(sm.Delivered_Date__c, 'numeric-dash'),
              estimatedDeliveryDate: formatDate(sm.Estimated_Delivery_Date__c, 'numeric-dash'),
              actualDeliveryDate: formatDate(sm.Actual_Delivery_Date__c, 'numeric-dash'),
              trackingNumber: sm.Tracking_Number__c || '',
              trackingStatus: sm.Tracking_Status__c || '',
              logisticsPartnerName: sm.Logistics_Partner_Name || '',
              logisticsContactName: sm.Logistics_Contact_Name || '',
              boxCount: sm.Box__c || 0,
              boxNetWeight: sm.Case_Net_Weight__c || 0,
              boxGrossWeight: sm.Case_Gross_Weight__c || 0,
              boxLength: sm.Case_Length__c || 0,
              boxWidth: sm.Case_Width__c || 0,
              boxHeight: sm.Case_Height__c || 0,
              requestDate: formatDate(sm.Request_Date__c, 'numeric-dash'),
              proposalId: sm.Proposal__c || '',
              proposalName: sm.Proposal_Name || sm.Proposal__r?.Name || '',
              proposalNumber: sm.Proposal_Number__c || sm.Proposal_Name || sm.Proposal__r?.Name || ''
            })),
            salesOrders: (json.Sales_Order__c || []).map((so: any) => ({
              id: so.Id,
              name: so.Name || '',
              status: so.Status__c || '',
              customerQuoteName: so.Customer_Quote_Name || '',
              customerOrderName: so.Customer_Order_Name || '',
              customerPO: so.Customer_PO__c || '',
              customerQuoteId: so.Customer_Quote__c || '',
              customerOrderId: so.Customer_Order__c || '',
              purchaseOrderId: so.Purchase_Order__c || '',
              billToAccountName: so.Bill_to_Account_Name || '',
              billToLocationName: so.Authorized_Bill_To_Location_Name || '',
              billToContactName: so.Bill_to_Contact_Name || '',
              shipToAccountName: so.Ship_to_Account_Name || '',
              shipToLocationName: so.Authorized_Ship_To_Location_Name || '',
              shipToContactName: so.Ship_to_Contact_Name || '',
              dropShip: so.Drop_Ship__c || false,
              totalLines: so.Total_Lines__c || 0,
              totalPrice: so.Total_Price__c || 0,
              totalShippingCharges: so.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: so.Total_Taxes_Amount__c || 0,
              grandTotal: so.Grand_Total__c || 0,
              requestDate: formatDate(so.Request_Date__c, 'numeric-dash'),
              pickDate: formatDate(so.Pick_Date__c, 'numeric-dash'),
              pickCompleteDate: formatDate(so.Pick_Complete_Date__c, 'numeric-dash'),
              shipDate: formatDate(so.Ship_Date__c, 'numeric-dash'),
              deliveredDate: formatDate(so.Delivered_Date__c, 'numeric-dash'),
              salesOrderId: so.Id || '',
              proposalId: so.Proposal__c || '',
              proposalName: so.Proposal_Name || so.Proposal__r?.Name || '',
              proposalNumber: so.Proposal_Number__c || so.Proposal_Name || so.Proposal__r?.Name || ''
            })),
            customerQuotes: (json.Customer_Quote__c || []).map((cq: any) => ({
              id: cq.Id,
              name: cq.Name || '',
              status: cq.Status__c || '',
              customerOrderName: cq.Customer_Order_Name || '',
              customerPO: cq.Customer_PO__c || '',
              customerOrderId: cq.Customer_Order__c || '',
              purchaseOrderId: cq.Purchase_Order__c || '',
              billToAccountName: cq.Bill_to_Account_Name || '',
              billToLocationName: cq.Authorized_Bill_To_Location_Name || '',
              billToContactName: cq.Bill_to_Contact_Name || '',
              shipToAccountName: cq.Ship_to_Account_Name || '',
              shipToLocationName: cq.Authorized_Ship_To_Location_Name || '',
              shipToContactName: cq.Ship_to_Contact_Name || '',
              dropShip: cq.Drop_Ship__c || false,
              totalLines: cq.Total_Lines__c || 0,
              totalPrice: cq.Total_Price__c || 0,
              totalShippingCharges: cq.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: cq.Total_Taxes_Amount__c || 0,
              grandTotal: cq.Grand_Total__c || 0,
              issuedDate: formatDate(cq.Issued_Date__c, 'numeric-dash'),
              expirationDate: formatDate(cq.Expiration_Date__c, 'numeric-dash'),
              requestDate: formatDate(cq.Request_Date__c, 'numeric-dash'),
              shipDate: formatDate(cq.Ship_Date__c, 'numeric-dash'),
              deliveredDate: formatDate(cq.Delivered_Date__c, 'numeric-dash'),
              proposalId: cq.Proposal__c || '',
              proposalName: cq.Proposal_Name || cq.Proposal__r?.Name || '',
              proposalNumber: cq.Proposal_Number__c || cq.Proposal_Name || cq.Proposal__r?.Name || ''
            }))
          });
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      if (tab === 'fulfillment') {
        setFulfillmentData({ invoices: [], shippingManifests: [], salesOrders: [], customerQuotes: [] });
      } else if (tab === 'projects') {
        setProjects([]);
      } else if (tab === 'orders') {
        setOrders([]);
      } else if (tab === 'purchases') {
        setPurchases([]);
        setSupplierBills([]);
      } else if (tab === 'returns') {
        setReturnsData({
          rma: [],
          rtv: [],
          creditMemos: [],
          debitMemos: []
        });
      } else if (tab === 'taxes') {
        setTaxesData([]);
      }
    } finally {
      if (!isBackground) setTabLoading(false);
    }
  }, [proposal?.id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Fetch data for active tab
  useEffect(() => {
    fetchTabData(activeTab, false);
  }, [fetchTabData, activeTab]);

  // Fetch all other tabs data in background to populate counts
  useEffect(() => {
    if (!proposal?.id) return;
    const tabs = ['elements', 'products', 'files', 'projects', 'orders', 'fulfillment', 'purchases', 'returns', 'taxes'];
    // Filter out active tab to avoid double fetch (optional but cleaner)
    tabs.filter(t => t !== activeTab).forEach(tab => {
      fetchTabData(tab, true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.id, fetchTabData]); // Run once when proposal loads

  // Derived state
  const grandTotal = useMemo(() => {
    if (!proposal) return 0;
    return proposal.totalAmount + proposal.totalShippingCharges + proposal.totalTaxesAmount;
  }, [proposal]);

  // Sorting states
  const [elementSortField, setElementSortField] = useState<keyof ProposalElement>("wbs");
  const [elementSortDirection, setElementSortDirection] = useState<SortDirection>("desc");

  const [productSortField, setProductSortField] = useState<keyof ProposedProduct>("Name");
  const [productSortDirection, setProductSortDirection] = useState<SortDirection>("asc");

  const [fileSortField, setFileSortField] = useState<keyof ProposalFile>("fileName");
  const [fileSortDirection, setFileSortDirection] = useState<SortDirection>("desc");

  const [projectSortField, setProjectSortField] = useState<keyof Project>("projectNumber");
  const [projectSortDirection, setProjectSortDirection] = useState<SortDirection>("desc");

  const [orderSortField, setOrderSortField] = useState<keyof Order>("name");
  const [orderSortDirection, setOrderSortDirection] = useState<SortDirection>("asc");

  // Generic Sort Function
  const sortData = <T,>(data: T[], field: keyof T, direction: SortDirection): T[] => {
    return [...data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return direction === "asc" ? comparison : -comparison;
    });
  };

  // Sorting handlers
  const handleElementSort = (field: keyof ProposalElement) => {
    if (elementSortField === field) {
      setElementSortDirection(elementSortDirection === "asc" ? "desc" : "asc");
    } else {
      setElementSortField(field);
      setElementSortDirection("asc");
    }
  };

  const handleProductSort = (field: keyof ProposedProduct) => {
    if (productSortField === field) {
      setProductSortDirection(productSortDirection === "asc" ? "desc" : "asc");
    } else {
      setProductSortField(field);
      setProductSortDirection("asc");
    }
  };

  const handleFileSort = (field: keyof ProposalFile) => {
    if (fileSortField === field) {
      setFileSortDirection(fileSortDirection === "asc" ? "desc" : "asc");
    } else {
      setFileSortField(field);
      setFileSortDirection("asc");
    }
  };

  const handleProjectSort = (field: keyof Project) => {
    if (projectSortField === field) {
      setProjectSortDirection(projectSortDirection === "asc" ? "desc" : "asc");
    } else {
      setProjectSortField(field);
      setProjectSortDirection("asc");
    }
  };

  const handleOrderSort = (field: keyof Order) => {
    if (orderSortField === field) {
      setOrderSortDirection(orderSortDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderSortField(field);
      setOrderSortDirection("asc");
    }
  };

  // File selection handlers
  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAllFiles = () => {
    if (selectedFiles.size === proposalFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(proposalFiles.map(f => f.id)));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !proposal) return;

    const allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

    const invalidExtensionFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return !allowedExtensions.includes(ext);
    });

    const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);

    if (invalidExtensionFiles.length > 0 || oversizedFiles.length > 0) {
      let errorMessage = '';
      if (invalidExtensionFiles.length > 0) {
        errorMessage += `The following files have invalid extensions and cannot be uploaded:\n${invalidExtensionFiles.map(f => `- ${f.name}`).join('\n')}\n\nAllowed: PDF, JPEG, PNG, CSV, XLS, XLSX, DOC, TXT\n\n`;
      }
      if (oversizedFiles.length > 0) {
        errorMessage += `The following files exceed the 10MB limit:\n${oversizedFiles.map(f => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}`;
      }
      warning(errorMessage);
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const filePromises = Array.from(files).map(file => {
        return new Promise<{ fileName: string; fileType: string; base64Data: string; }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve({
              fileName: file.name,
              fileType: file.name.split('.').pop() || '',
              base64Data: base64Data
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const filesData = await Promise.all(filePromises);

      const response = await fetch('/api/salesforce/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: SF_ACCOUNT_ID,
          contactId: SF_CONTACT_ID,
          objectId: proposal.id,
          files: filesData
        }),
      });

      if (!response.ok) throw new Error('Failed to upload files');

      await response.json();

      // Refresh files by toggling tab slightly or just let useEffect re-run if we changed something triggered by it
      // Simple re-fetch approach:
      if (activeTab === 'files') {
        const url = `/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${proposal.id}&action=files`;
        const res = await fetch(url);
        const json = await res.json();
        if (Array.isArray(json)) {
          setProposalFiles(json.map((f: any) => ({
            id: f.Id,
            contentDocumentId: f.ContentDocumentId,
            fileName: f.Title,
            fileType: f.FileExtension,
            fileSize: f.ContentSize ? (f.ContentSize / 1024 / 1024).toFixed(2) + ' MB' : '0 MB',
            sizeInBytes: f.ContentSize || 0,
            uploadedBy: f.CreatedBy,
            uploadedDate: formatDate(f.CreatedDate, 'numeric-dash'),
            category: 'General',
            downloadUrl: f.DownloadUrl
          })));
        }
      }

      success('Files uploaded successfully!');
      setTimeout(() => window.location.reload(), 5000);
    } catch (err) {
      console.error('Error uploading files:', err);
      error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDownloadPDF = async () => {
    if (!proposal) return;

    let productsToPrint = proposedProducts;
    if (productsToPrint.length === 0) {
      try {
        const url = `/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${proposal.id}&action=products`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.length > 0) {
          productsToPrint = json.map((item: any) => ({
            id: item.Id,
            productName: item.Product_Name || 'Unknown Product',
            productSku: item.Name || 'N/A',
            description: item.Product_Description__c || '',
            manufacturer: item.Manufacturer_Name__c || '',
            productFamily: item.Product_Family__c || 'General',
            quantity: item.Total_Order_Qty__c || 0,
            unitPrice: item.Unit_Price__c || 0,
            subtotal: item.Line_Grand_Total__c || 0
          }));
          setProposedProducts(productsToPrint);
        }
      } catch (error) {
        console.error("Error fetching products for PDF:", error);
      }
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPos = 20;

    doc.setFontSize(20);
    doc.text(`Proposal: ${proposal.proposalNumber}`, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Status: ${proposal.status} | Issued: ${proposal.proposalDate} | Expires: ${proposal.expirationDate}`, margin, yPos);
    yPos += 10;

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Account: ${proposal.accountName}`, margin, yPos);
    yPos += 6;
    doc.text(`Contact: ${proposal.contactName}`, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const detailYStart = yPos;
    const midPage = pageWidth / 2;

    doc.text(`Payment Terms: ${proposal.paymentTerms || 'N/A'}`, margin, yPos);
    yPos += 5;
    doc.text(`Quote Type: ${proposal.proposalType || 'N/A'}`, margin, yPos);
    yPos += 5;
    doc.text(`Order Number: ${proposal.orderNumber || 'N/A'}`, margin, yPos);
    yPos += 5;
    doc.text(`Customer PO: ${proposal.customerPO || 'N/A'}`, margin, yPos);
    yPos += 5;
    doc.text(`Req. Delivery: ${proposal.requestedDeliveryDate || 'N/A'}`, margin, yPos);

    let rightY = detailYStart;
    doc.text(`Site: ${proposal.site || 'N/A'}`, midPage, rightY);
    rightY += 5;
    doc.text(`Drop Ship: ${proposal.dropShip ? 'Yes' : 'No'}`, midPage, rightY);
    rightY += 10;

    yPos = Math.max(yPos, rightY) + 5;

    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, yPos);
    doc.text("Ship To:", midPage, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    const billToLines = doc.splitTextToSize(proposal.billingAddress || 'N/A', midPage - margin - 5);
    const shipToLines = doc.splitTextToSize(proposal.shippingAddress || 'N/A', pageWidth - midPage - margin);

    doc.text(billToLines, margin, yPos);
    doc.text(shipToLines, midPage, yPos);

    yPos += Math.max(billToLines.length, shipToLines.length) * 5 + 10;

    if (proposal.description) {
      doc.setFontSize(12);
      doc.text("Scope Summary", margin, yPos);
      yPos += 6;
      doc.setFontSize(10);
      const splitDesc = doc.splitTextToSize(proposal.description, pageWidth - 2 * margin);
      doc.text(splitDesc, margin, yPos);
      yPos += splitDesc.length * 5 + 10;
    }

    doc.setFontSize(12);
    doc.text("Proposed Products", margin, yPos);
    yPos += 6;

    const cols = { name: margin, sku: 80, qty: 130, price: 150, total: 175 };
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 4, pageWidth - 2 * margin, 8, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Product", cols.name, yPos);
    doc.text("SKU", cols.sku, yPos);
    doc.text("Qty", cols.qty, yPos);
    doc.text("Price", cols.price, yPos);
    doc.text("Subtotal", cols.total, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    productsToPrint.forEach((p) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }

      const nameLines = doc.splitTextToSize(p.productName, 60);
      doc.text(nameLines, cols.name, yPos);
      doc.text(p.productSku, cols.sku, yPos);
      doc.text(p.quantity.toString(), cols.qty, yPos);
      doc.text(`$${p.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, cols.price, yPos);
      doc.text(`$${p.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, cols.total, yPos);

      yPos += Math.max(nameLines.length * 5, 8);
    });

    yPos += 5;

    const rightAlignX = pageWidth - margin;
    doc.setFont("helvetica", "bold");

    const totals = [
      { label: "Subtotal:", value: proposal.totalAmount },
      { label: "Shipping:", value: proposal.totalShippingCharges },
      { label: "Tax:", value: proposal.totalTaxesAmount },
      { label: "Grand Total:", value: proposal.totalAmount + proposal.totalShippingCharges + proposal.totalTaxesAmount }
    ];

    totals.forEach(t => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }
      const text = `${t.label} $${t.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      doc.text(text, rightAlignX, yPos, { align: 'right' });
      yPos += 6;
    });

    yPos += 15;
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Signatures", margin, yPos);
    yPos += 10;
    doc.setFontSize(10);

    // Client Signature
    doc.text("Accepted By (Client):", margin, yPos);
    yPos += 6;
    doc.text(`Name: ${proposal.clientSignedBy || ''}`, margin, yPos);
    yPos += 5;
    doc.text(`Title: ${proposal.clientSignedTitle || ''}`, margin, yPos);
    yPos += 5;
    doc.text(`Date: ${proposal.clientSignedDate || ''}`, margin, yPos);
    yPos += 10;

    // Company Signature
    doc.text("Presented By (Company):", margin, yPos);
    yPos += 6;
    doc.text(`Name: ${proposal.companySignedBy || ''}`, margin, yPos);
    yPos += 5;
    doc.text(`Title: ${proposal.companySignedTitle || ''}`, margin, yPos);
    yPos += 5;
    doc.text(`Date: ${proposal.companySignedDate || ''}`, margin, yPos);

    doc.save(`Proposal_${proposal.proposalNumber}.pdf`);
  };

  return (
    <Sidebar>
      {(loading || !proposal) ? (
        <>
          <div className="flex items-center justify-between mb-6 opacity-60 pointer-events-none min-w-0">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div className="space-y-6 opacity-60">
            <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg bg-white shadow-sm border border-gray-200 dark:border-gray-700"></div>
            <div className="flex items-center justify-center h-48 min-w-0">
              <LoadingSpinner size="md" />
            </div>
          </div>
        </>
      ) : (
        <>
          <ProposalHeader
            id={id}
            proposalNumber={proposal.proposalNumber}
            status={proposal.status}
            description={proposal.description}
          />

          <ProposalDetails
            proposal={proposal}
            proposedProducts={proposedProducts}
            grandTotal={grandTotal}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            handleDownloadPDF={handleDownloadPDF}
          />

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
              <ProposalTabs
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                }}
                counts={{
                  products: proposedProducts.length,
                  elements: proposalElements.length,
                  files: proposalFiles.length,
                  projects: projects.length,
                  orders: orders.length,
                  fulfillment: fulfillmentData.invoices.length + fulfillmentData.shippingManifests.length + fulfillmentData.salesOrders.length + fulfillmentData.customerQuotes.length,
                  purchases: purchases.length + supplierBills.length,
                  returns: isRestricted
                    ? returnsData.rma.length + returnsData.creditMemos.length
                    : returnsData.rma.length + returnsData.rtv.length + returnsData.creditMemos.length + returnsData.debitMemos.length,
                  taxes: taxesData.length
                }}
              />
            </div>

            <div className="p-2">
              {activeTab === 'products' && (
                <ProductsTab
                  products={sortData(proposedProducts, productSortField, productSortDirection)}
                  loading={tabLoading}
                  proposalId={proposal.id}
                  sortField={productSortField}
                  sortDirection={productSortDirection}
                  onSort={handleProductSort}
                  widths={productWidths}
                  onResize={handleProductResize}
                />
              )}

              {activeTab === 'taxes' && (
                <TaxesTab taxes={taxesData} loading={tabLoading} widths={taxWidths} onResize={handleTaxResize} />
              )}

              {activeTab === 'elements' && (
                <ElementsTab
                  elements={sortData(proposalElements, elementSortField, elementSortDirection)}
                  loading={tabLoading}
                  sortField={elementSortField}
                  sortDirection={elementSortDirection}
                  onSort={handleElementSort}
                  widths={elementWidths}
                  onResize={handleElementResize}
                />
              )}

              {activeTab === 'files' && (
                <FilesTab
                  files={sortData(proposalFiles, fileSortField, fileSortDirection)}
                  loading={tabLoading}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  onSelectAll={handleSelectAllFiles}
                  sortField={fileSortField}
                  sortDirection={fileSortDirection}
                  onSort={handleFileSort}
                  proposalId={proposal.id}
                  accountId={SF_ACCOUNT_ID}
                  contactId={SF_CONTACT_ID}
                />
              )}

              {activeTab === 'signatures' && (
                <SignaturesTab proposal={proposal} />
              )}

              {activeTab === 'projects' && (
                <ProjectsTab
                  projects={sortData(projects, projectSortField, projectSortDirection)}
                  loading={tabLoading}
                  sortField={projectSortField}
                  sortDirection={projectSortDirection}
                  onSort={handleProjectSort}
                  widths={projectWidths}
                  onResize={handleProjectResize}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersTab
                  orders={sortData(orders, orderSortField, orderSortDirection)}
                  loading={tabLoading}
                  sortField={orderSortField}
                  sortDirection={orderSortDirection}
                  onSort={handleOrderSort}
                  widths={orderWidths}
                  onResize={handleOrderResize}
                />
              )}

              {activeTab === 'fulfillment' && (
                <FulfillmentsTab
                  fulfillmentData={fulfillmentData}
                  loading={tabLoading}
                  activeTab={activeFulfillmentTab}
                  onTabChange={setActiveFulfillmentTab}
                  widths={fulfillmentWidths}
                  onResize={handleFulfillmentResize}
                />
              )}

              {activeTab === 'purchases' && (
                <PurchasesTab
                  purchases={purchases}
                  supplierBills={supplierBills}
                  loading={tabLoading}
                  purchaseWidths={purchaseWidths}
                  onPurchaseResize={handlePurchaseResize}
                  billWidths={billWidths}
                  onBillResize={handleBillResize}
                />
              )}

              {activeTab === 'returns' && (
                <ReturnsTab
                  returnsData={returnsData}
                  loading={tabLoading}
                  widths={returnsWidths}
                  onResize={handleReturnsResize}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] gap-4 sm:gap-0 z-40">
            <button
              onClick={() => router.push("/proposals")}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="h-20" />
        </>
      )
      }
    </Sidebar >
  );
}
