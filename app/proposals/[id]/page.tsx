"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
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
  Purchase,
  Return,
  ReturnsData
} from "./types";
import { formatDate, formatAddress } from "./utils";
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

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposedProducts, setProposedProducts] = useState<ProposedProduct[]>([]);
  const [proposalElements, setProposalElements] = useState<ProposalElement[]>([]);
  const [proposalFiles, setProposalFiles] = useState<ProposalFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFulfillmentTab, setActiveFulfillmentTab] = useState<FulfillmentTabType>("invoices");

  // Tab and sorting state
  const [activeTab, setActiveTab] = useState<ProposalTabType>("products");
  const [elementSortField, setElementSortField] = useState<keyof ProposalElement>("wbs");
  const [elementSortDirection, setElementSortDirection] = useState<SortDirection>("asc");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "001QL00001Kbvt3YAB";
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "003QL00001EzLjZYAV";

  // Fetch Proposal
  useEffect(() => {
    async function fetchProposal() {
      try {
        const res = await fetch(`/api/salesforce/proposals?accountId=${SF_ACCOUNT_ID}&contactId=${SF_CONTACT_ID}&proposalId=${id}&action=view`);
        if (!res.ok) throw new Error('Failed to fetch proposal');
        const data = await res.json();

        if (data && data.length > 0) {
          const item = data[0];
          const mappedProposal: Proposal = {
            id: item.Id,
            proposalNumber: item.Proposal_Number__c || 'N/A',
            proposalName: item.Name || 'Untitled Proposal',
            accountName: item.Inventory_Account_Name || 'Unknown Account',
            contactName: item.Client_Signed_By__c || 'Unknown Contact',
            status: (item.Status__c as ProposalStatus) || 'Draft',
            totalAmount: item.Total_Price__c || 0,
            totalShippingCharges: item.Total_Shipping_Charges__c || 0,
            totalTaxesAmount: item.Total_Taxes__c || 0,
            proposalDate: formatDate(item.Issued_Date__c || item.CreatedDate),
            expirationDate: formatDate(item.Expiration_Date__c),
            description: item.Scope__c?.replace(/<[^>]*>?/gm, '') || item.Name || '',
            productCount: item.Total_Lines__c || 0,
            billTo: item.Authorized_Bill_To_Location_Name || 'N/A',
            shipTo: item.Authorized_Ship_To_Location_Name || 'N/A',
            opportunityName: '',
            companySignedDate: formatDate(item.Company_Signed_Date__c),
            submittedBy: item.Company_Signed_By__c || '',
            accountId: item.Inventory_Account__c || item.AccountId || '',
            contactId: item.Client_Signed_By__c || item.ContactId || '',
            orderId: item.Customer_Order__c || item.Id || '',
            site: item.Site_Name || '',
            billToAccount: item.Authorized_Bill_To_Account_Name || item.Bill_To_Account_Name || item.Inventory_Account_Name || '',
            shipToAccount: item.Authorized_Ship_To_Account_Name || item.Ship_To_Account_Name || item.Inventory_Account_Name || ''
          };

          const detailedProposal = {
            ...mappedProposal,
            accountExecutive: item.Company_Signed_By_Name || '',
            issuedDate: formatDate(item.Issued_Date__c),
            orderNumber: item.Customer_Order_Name || '',
            billingAddress: formatAddress(item.Authorized_Bill_To_Location_Address),
            paymentTerms: item.Payment_Terms__c || '',
            customerPO: item.Customer_PO__c || '',
            shippingAddress: formatAddress(item.Authorized_Ship_To_Location_Address),
            requestedDeliveryDate: formatDate(item.Request_Date__c),
            dropShip: item.Drop_Ship__c || false,
            site: item.Site_Name || '',
            specialTerms: item.Scope__c?.replace(/<[^>]*>?/gm, '') || '',
            internalNotes: '',
            clientSignedBy: item.Company_Signed_By_Name,
            clientSignedTitle: item.Client_Signed_Title__c,
            clientSignedDate: formatDate(item.Client_Signed_Date__c),
            companySignedBy: item.Company_Signed_By_Name,
            companySignedTitle: item.Company_Signed_Title__c,
            proposalType: item.Proposal_Type__c || '',
            priceBook: item.Price_Book_Name || item.Pricebook2Id || ''
          };

          setProposal(detailedProposal as any);

          if (item.Proposal_Elements__r && item.Proposal_Elements__r.records) {
            const elements = item.Proposal_Elements__r.records.map((el: any) => ({
              id: el.Id,
              wbs: el.WBS__c || '',
              proposalElement: el.Name || '',
              description: el.Description__c || ''
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

    fetchProposal();
  }, [id]);

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
        case 'fulfillments':
          url += '&action=fulfillments';
          break;
        case 'purchases':
          url += '&action=purchases';
          break;
        case 'returns':
          url += '&action=returns';
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
              description: el.Description__c || '',
              proposalId: el.Proposal__c
            })));
          }
          break;
        case 'products':
          if (json.length > 0) {
            setProposedProducts(json.map((item: any) => ({
              id: item.Id,
              productName: item.Product_Name || 'Unknown Product',
              productSku: item.Name || 'N/A',
              description: item.Product_Description__c || '',
              manufacturer: item.Manufacturer_Name__c || '',
              productFamily: item.Product_Family__c || 'General',
              quantity: item.Total_Order_Qty__c || 0,
              unitPrice: item.Unit_Price__c || 0,
              subtotal: item.Line_Grand_Total__c || 0
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
              fileSize: `${f.ContentSize} MB`,
              uploadedBy: f.CreatedBy,
              uploadedDate: formatDate(f.CreatedDate),
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
              estimatedStartDate: formatDate(proj.Estimated_Start_Date__c),
              estimatedEndDate: formatDate(proj.Estimated_End_Date__c)
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
              customerPODate: formatDate(order.Customer_PO_Date__c),
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
              requestDate: formatDate(order.Request_Date__c),
              shipDate: formatDate(order.Ship_Date__c),
              deliveredDate: formatDate(order.Delivered_Date__c)
            })));
          } else {
            setOrders([]);
          }
          break;
        case 'purchases':
          // JSON returns object with Purchase_Order__c and Supplier_Bill__c arrays
          const purchaseOrders = (json.Purchase_Order__c || []);
          if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
            setPurchases(purchaseOrders.map((p: any) => ({
              id: p.Id,
              name: p.Name || '',
              status: p.Status__c || '',
              vendorName: p.Supplier_Name || p.Supplier_Bill__c?.[0]?.Supplier_Name || '',
              vendorPO: p.Customer_PO__c || '', // Using Customer_PO__c as fallback/proxy
              orderDate: formatDate(p.Request_Date__c),
              expectedDate: formatDate(p.Estimated_Delivery_Date__c),
              totalAmount: p.Total_Cost__c || 0
            })));
          } else {
            setPurchases([]);
          }
          break;
        case 'returns':
          setReturnsData({
            rma: (json.RMA__c || []).map((r: any) => ({
              id: r.Id,
              name: r.Name || '',
              status: r.Status__c || '',
              description: r.Name || '', // Using Name as description placeholder
              requestDate: formatDate(r.Goods_Receipt_Date__c), // Or other relevant date
              type: 'RMA',
              reason: r.RMA_Type__c || '',
              totalAmount: r.Total_Price__c || 0,
              shipFromAccountName: r.Ship_From_Account_Name || ''
            })),
            rtv: (json.RTV__c || []).map((r: any) => ({
              id: r.Id,
              name: r.Name || '',
              status: r.Status__c || '',
              description: r.Name || '',
              requestDate: formatDate(r.Issued_Date__c),
              type: r.RTV_Type__c || 'RTV',
              reason: '',
              totalAmount: r.Total_Cost__c || 0,
              supplierName: r.Supplier_Name || '',
              rtvType: r.RTV_Type__c || ''
            })),
            creditMemos: (json.Credit_Memo__c || []).map((c: any) => ({
              id: c.Id,
              name: c.Name || '',
              status: c.Status__c || '',
              description: c.Name || '',
              requestDate: formatDate(c.Issued_Date__c),
              type: 'Credit Memo',
              reason: '',
              totalAmount: c.Total_Credit_Amount__c || 0,
              creditToAccountName: c.Credit_to_Account_Name || '',
              invoiceName: c.Invoice_Name || ''
            })),
            debitMemos: (json.Debit_Memo__c || []).map((d: any) => ({
              id: d.Id,
              name: d.Name || '',
              status: d.Status__c || '',
              description: d.Name || '',
              requestDate: formatDate(d.Issued_Date__c), // Or Settled_Date__c
              type: 'Debit Memo',
              reason: '',
              totalAmount: d.Total_Debit_Amount__c || 0,
              debitToAccountName: d.Debit_to_Account_Name || ''
            }))
          });
          break;
        case 'fulfillments':
          setFulfillmentData({
            invoices: (json.Invoice__c || []).map((inv: any) => ({
              id: inv.Id,
              name: inv.Name || '',
              status: inv.Status__c || '',
              customerQuoteName: inv.Customer_Quote_Name || '',
              salesOrderName: inv.Sales_Order_Name || '',
              customerOrderName: inv.Customer_Order_Name || '',
              customerPO: inv.Customer_PO__c || '',
              billToAccountName: inv.Bill_to_Account_Name || '',
              billToLocationName: inv.Authorized_Bill_To_Location_Name || '',
              billToContactName: inv.Bill_to_Contact_Name || '',
              totalLines: inv.Total_Lines__c || 0,
              totalPrice: inv.Total_Price__c || 0,
              totalShippingCharges: inv.Total_Shipping_Charges__c || 0,
              totalTaxesAmount: inv.Total_Taxes_Amount__c || 0,
              grandTotal: inv.Grand_Total__c || 0,
              issuedDate: formatDate(inv.Issued_Date__c),
              dueDate: formatDate(inv.gtherp__Due_Date__c),
              paymentTerms: inv.Payment_Terms__c || '',
              collectionStatus: inv.Collection_Status__c || '',
              openBalance: inv.Open_Balance__c || 0,
              daysOutstanding: inv.Days_Outstanding__c || 0,
              settledDate: formatDate(inv.Settled_Date__c)
            })),
            shippingManifests: (json.Shipping_Manifest__c || []).map((sm: any) => ({
              id: sm.Id,
              name: sm.Name || '',
              status: sm.Status__c || '',
              customerQuoteName: sm.Customer_Quote_Name || '',
              salesOrderName: sm.Sales_Order_Name || '',
              customerOrderName: sm.Customer_Order_Name || '',
              customerPO: sm.Customer_PO__c || '',
              shipToAccountName: sm.Ship_to_Account_Name || '',
              shipToLocationName: sm.Authorized_Ship_To_Location_Name || '',
              shipToContactName: sm.Ship_to_Contact_Name || '',
              dropShip: sm.Drop_Ship__c || false,
              totalLines: sm.Total_Lines__c || 0,
              totalPrice: sm.Total_Price__c || 0,
              shippingMethod: sm.Shipping_Method__c || '',
              shipDate: formatDate(sm.Ship_Date__c),
              deliveredDate: formatDate(sm.Delivered_Date__c),
              estimatedDeliveryDate: formatDate(sm.Estimated_Delivery_Date__c),
              actualDeliveryDate: formatDate(sm.Actual_Delivery_Date__c),
              trackingNumber: sm.Tracking_Number__c || '',
              trackingStatus: sm.Tracking_Status__c || '',
              logisticsPartnerName: sm.Logistics_Partner_Name || '',
              logisticsContactName: sm.Logistics_Contact_Name || ''
            })),
            salesOrders: (json.Sales_Order__c || []).map((so: any) => ({
              id: so.Id,
              name: so.Name || '',
              status: so.Status__c || '',
              customerQuoteName: so.Customer_Quote_Name || '',
              customerOrderName: so.Customer_Order_Name || '',
              customerPO: so.Customer_PO__c || '',
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
              requestDate: formatDate(so.Request_Date__c),
              pickDate: formatDate(so.Pick_Date__c),
              pickCompleteDate: formatDate(so.Pick_Complete_Date__c),
              shipDate: formatDate(so.Ship_Date__c),
              deliveredDate: formatDate(so.Delivered_Date__c)
            })),
            customerQuotes: (json.Customer_Quote__c || []).map((cq: any) => ({
              id: cq.Id,
              name: cq.Name || '',
              status: cq.Status__c || '',
              customerOrderName: cq.Customer_Order_Name || '',
              customerPO: cq.Customer_PO__c || '',
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
              issuedDate: formatDate(cq.Issued_Date__c),
              expirationDate: formatDate(cq.Expiration_Date__c),
              requestDate: formatDate(cq.Request_Date__c),
              shipDate: formatDate(cq.Ship_Date__c),
              deliveredDate: formatDate(cq.Delivered_Date__c)
            }))
          });
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      if (tab === 'fulfillments') {
        setFulfillmentData({ invoices: [], shippingManifests: [], salesOrders: [], customerQuotes: [] });
      } else if (tab === 'projects') {
        setProjects([]);
      } else if (tab === 'orders') {
        setOrders([]);
      } else if (tab === 'purchases') {
        setPurchases([]);
      } else if (tab === 'returns') {
        setReturnsData({
          rma: [],
          rtv: [],
          creditMemos: [],
          debitMemos: []
        });
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
    const tabs = ['elements', 'products', 'files', 'projects', 'orders', 'fulfillments', 'purchases', 'returns'];
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

  // Sorting handlers
  const handleElementSort = (field: keyof ProposalElement) => {
    if (elementSortField === field) {
      setElementSortDirection(elementSortDirection === "asc" ? "desc" : "asc");
    } else {
      setElementSortField(field);
      setElementSortDirection("asc");
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
            fileSize: `${f.ContentSize} MB`,
            uploadedBy: f.CreatedBy,
            uploadedDate: formatDate(f.CreatedDate),
            category: 'General',
            downloadUrl: f.DownloadUrl
          })));
        }
      }

      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
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

  if (loading || !proposal) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <ProposalHeader
        proposalNumber={proposal.proposalNumber}
        status={proposal.status}
        onDownloadPDF={handleDownloadPDF}
        onBack={() => router.push("/proposals")}
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'products' ? 'Proposed Products' :
                activeTab === 'elements' ? 'Proposal Elements' :
                  activeTab === 'files' ? 'Attachments' :
                    activeTab === 'signatures' ? 'Signatures' :
                      activeTab === 'projects' ? 'Active Projects' :
                        activeTab === 'orders' ? 'Customer Orders' :
                          activeTab === 'fulfillments' ? 'Fulfillment' :
                            activeTab === 'purchases' ? 'Purchase Orders' :
                              activeTab === 'returns' ? 'Returns' : 'Details'}
            </h2>

            <p className="text-sm text-gray-500">
              {activeTab === "products" ? "Products included in this proposal"
                : activeTab === "elements" ? "Work breakdown structure and deliverables"
                  : activeTab === "files" ? "Documents and files attached to this proposal"
                    : activeTab === "signatures" ? "Client and company signature tracking"
                      : activeTab === "projects" ? "Active projects"
                        : activeTab === "orders" ? "Customer orders"
                          : activeTab === "fulfillments" ? "Fulfillment"
                            : activeTab === "purchases" ? "Purchase orders"
                              : activeTab === "returns" ? "Returns"
                                : "Details"
              }
            </p>

          </div>

          <div className="ml-auto">
            <ProposalTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                products: proposedProducts.length,
                elements: proposalElements.length,
                files: proposalFiles.length,
                projects: projects.length,
                orders: orders.length,
                fulfillments: fulfillmentData.invoices.length + fulfillmentData.shippingManifests.length + fulfillmentData.salesOrders.length + fulfillmentData.customerQuotes.length,
                purchases: purchases.length,
                returns: returnsData.rma.length + returnsData.rtv.length + returnsData.creditMemos.length + returnsData.debitMemos.length
              }}
            />
          </div>
        </div>
        {activeTab === 'products' && (
          <ProductsTab
            products={proposedProducts}
            loading={tabLoading}
            proposalId={proposal.id}
          />
        )}

        {activeTab === 'elements' && (
          <ElementsTab
            elements={proposalElements}
            loading={tabLoading}
            sortField={elementSortField}
            sortDirection={elementSortDirection}
            onSort={handleElementSort}
          />
        )}

        {activeTab === 'files' && (
          <FilesTab
            files={proposalFiles}
            loading={tabLoading}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onSelectAll={handleSelectAllFiles}
          />
        )}

        {activeTab === 'signatures' && (
          <SignaturesTab proposal={proposal} />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            loading={tabLoading}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            loading={tabLoading}
          />
        )}

        {activeTab === 'fulfillments' && (
          <FulfillmentsTab
            fulfillmentData={fulfillmentData}
            loading={tabLoading}
            activeTab={activeFulfillmentTab}
            onTabChange={setActiveFulfillmentTab}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesTab
            purchases={purchases}
            loading={tabLoading}
          />
        )}

        {activeTab === 'returns' && (
          <ReturnsTab
            returnsData={returnsData}
            loading={tabLoading}
          />
        )}
      </div>


      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg" style={{ zIndex: 40 }}>
        <button
          onClick={() => router.push("/proposals")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Proposals
        </button>
      </div>

      <div className="h-20"></div>
    </Sidebar >
  );
}
