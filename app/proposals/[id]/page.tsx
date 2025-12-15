"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { ProposalStatus, Proposal } from "../types";

interface ProposalElement {
  id: string;
  wbs: string;
  proposalElement: string;
  description: string;
  proposalId?: string;
}

interface ProposalFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  category: string;
}

interface ProposedProduct {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  manufacturer: string;
  productFamily: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}




type ProposalTabType = "products" | "elements" | "files" | "signatures";
type SortDirection = "asc" | "desc";

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Tab and sorting state
  // State
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposedProducts, setProposedProducts] = useState<ProposedProduct[]>([]);
  const [proposalElements, setProposalElements] = useState<ProposalElement[]>([]);
  const [proposalFiles, setProposalFiles] = useState<ProposalFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab and sorting state
  const [activeTab, setActiveTab] = useState<ProposalTabType>("products");
  const [elementSortField, setElementSortField] = useState<keyof ProposalElement>("wbs");
  const [elementSortDirection, setElementSortDirection] = useState<SortDirection>("asc");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchProposal() {
      try {
        const res = await fetch(`/api/salesforce/proposals?proposalId=${id}`);
        if (!res.ok) throw new Error('Failed to fetch proposal');
        const data = await res.json();

        if (data && data.length > 0) {
          const item = data[0]; // API returns an array
          const mappedProposal: Proposal = {
            id: item.Id,
            proposalNumber: item.Proposal_Number__c || 'N/A',
            proposalName: item.Name || 'Untitled Proposal',
            accountName: item.Inventory_Account_Name || 'Unknown Account',
            contactName: item.Client_Signed_By__c || 'Unknown Contact', // Using Client Signer as contact placeholder if contact not explicit
            status: (item.Status__c as ProposalStatus) || 'Draft',
            totalAmount: item.Total_Price__c || 0,
            proposalDate: item.Issued_Date__c || item.CreatedDate?.split('T')[0] || '',
            expirationDate: item.Expiration_Date__c || '',
            description: item.Scope__c?.replace(/<[^>]*>?/gm, '') || item.Name || '',
            productCount: item.Total_Lines__c || 0,
            billTo: item.Authorized_Bill_To_Location__c || 'N/A', // JSON has ID, using as placeholder
            shipTo: item.Authorized_Ship_To_Location__c || 'N/A', // JSON has ID, using as placeholder
            opportunityName: '',
            submittedBy: item.Company_Signed_By__c || ''
          };

          const detailedProposal = {
            ...mappedProposal,
            accountExecutive: item.Company_Signed_By__c || '',
            issuedDate: item.Issued_Date__c || '',
            orderNumber: item.Customer_Order__c || '',
            billingAddress: item.Authorized_Bill_To_Location__c || '', // Placeholder until address fields available
            paymentTerms: item.Inventory_Account_Payment_Terms || '',
            customerPO: item.Customer_PO__c || '',
            shippingAddress: item.Authorized_Ship_To_Location__c || '', // Placeholder until address fields available
            requestedDeliveryDate: item.Request_Date__c || '',
            dropShip: item.Drop_Ship__c || false,
            specialTerms: item.Scope__c?.replace(/<[^>]*>?/gm, '') || '',
            internalNotes: '',
            clientSignedBy: item.Client_Signed_By__c,
            clientSignedTitle: item.Client_Signed_Title__c,
            clientSignedDate: item.Client_Signed_Date__c,
            companySignedBy: item.Company_Signed_By__c,
            companySignedTitle: item.Company_Signed_Title__c,
            companySignedDate: item.Company_Signed_Date__c
          };

          setProposal(detailedProposal as any); // Casting to any to match existing usage in component or we need to update Proposal interface

          // Map Lines to ProposedProducts
          if (item.Proposal_Lines__r && item.Proposal_Lines__r.records) {
            const lines = item.Proposal_Lines__r.records.map((line: any) => ({
              id: line.Id,
              productName: line.Product_Name__c || 'Unknown Product',
              productSku: line.Product_SKU__c || 'N/A',
              description: line.Description__c || '',
              manufacturer: line.Manufacturer__c || '',
              productFamily: line.Product_Family__c || 'General',
              quantity: line.Quantity__c || 0,
              unitPrice: line.Sales_Price__c || 0,
              subtotal: line.Total_Price__c || 0
            }));
            setProposedProducts(lines);
          }

          // Map Elements if available (assuming relationship name Proposal_Elements__r for now, or empty)
          if (item.Proposal_Elements__r && item.Proposal_Elements__r.records) {
            const elements = item.Proposal_Elements__r.records.map((el: any) => ({
              id: el.Id,
              wbs: el.WBS__c || '',
              proposalElement: el.Name || '',
              description: el.Description__c || ''
            }));
            setProposalElements(elements);
          }

          // Map Files (assuming ContentDocumentLinks or similar, leaving empty if not complex query needed)
          // For now, initializing empty to replace mock data
          setProposalFiles([]);
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [id]);

  // Sorted elements
  const sortedElements = useMemo(() => {
    return [...proposalElements].sort((a, b) => { // Use state instead of mock
      const aVal = a[elementSortField];
      const bVal = b[elementSortField];
      // Safety check for undefined values if any
      if (aVal === undefined || bVal === undefined) return 0;

      if (aVal < bVal) return elementSortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return elementSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [proposalElements, elementSortField, elementSortDirection]);

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

  const handleDownloadSelected = () => {
    const filesToDownload = proposalFiles.filter(f => selectedFiles.has(f.id));
    // In a real app, this would trigger actual file downloads
    console.log("Downloading files:", filesToDownload.map(f => f.fileName));
    alert(`Downloading ${filesToDownload.length} file(s):\n${filesToDownload.map(f => f.fileName).join('\n')}`);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case "PDF":
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          </svg>
        );
      case "XLSX":
      case "XLS":
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" />
          </svg>
        );
      case "ZIP":
        return (
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 6h2v2h-2v2h2v2h-2v2h2v2h-2v-2H8v-2h2v-2H8v-2h2v-2H8v-2h2z" />
          </svg>
        );
      case "DWG":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 14l3 3-3 3m4-3h5" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
          </svg>
        );
    }
  };

  const SortIcon = ({ field }: { field: keyof ProposalElement }) => (
    <span className="ml-1 inline-flex flex-col">
      <svg className={`w-3 h-3 ${elementSortField === field && elementSortDirection === "asc" ? "text-primary" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5H7z" />
      </svg>
      <svg className={`w-3 h-3 -mt-1 ${elementSortField === field && elementSortDirection === "desc" ? "text-primary" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5H7z" />
      </svg>
    </span>
  );

  // Calculate totals
  const productsSubtotal = proposedProducts.reduce((sum, product) => sum + product.subtotal, 0);
  const taxRate = 0.15;
  const taxTotal = productsSubtotal * taxRate;
  const shippingCost = 65.00;
  const grandTotal = productsSubtotal + taxTotal + shippingCost;

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Accepted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Under Review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Expired":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
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
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <button onClick={() => router.push("/proposals")} className="hover:text-gray-700 dark:hover:text-gray-300">Proposals</button>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white">{proposal.proposalNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{proposal.proposalNumber}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{proposal.description}</p>
          </div>
          <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(proposal.status)}`}>
            {proposal.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Proposal Information (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Key Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Dates</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Important timeline information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Executive</label>
                <p className="text-gray-900 dark:text-white font-medium">{proposal.accountExecutive}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issued Date</label>
                <p className="text-gray-900 dark:text-white">{proposal.issuedDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date</label>
                <p className="text-gray-900 dark:text-white font-semibold">{proposal.expirationDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order #</label>
                <p className="text-gray-900 dark:text-white font-mono">{proposal.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Billing and Shipping Information Cards - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Billing Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Invoice destination</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill To Location</label>
                  <p className="text-gray-900 dark:text-white font-medium">{proposal.billTo}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
                  <p className="text-gray-900 dark:text-white">{proposal.billingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                    <p className="text-gray-900 dark:text-white">{proposal.paymentTerms}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer PO</label>
                    <p className="text-gray-900 dark:text-white font-mono">{proposal.customerPO}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivery destination</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ship To Location</label>
                  <p className="text-gray-900 dark:text-white font-medium">{proposal.shipTo}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                  <p className="text-gray-900 dark:text-white">{proposal.shippingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested Date</label>
                    <p className="text-gray-900 dark:text-white">{proposal.requestedDeliveryDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drop-Ship</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${proposal.dropShip ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {proposal.dropShip ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scope Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project scope and deliverables overview</p>
              </div>
            </div>

            <div className="w-full min-h-[120px] px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white leading-relaxed">
              {proposal.description || "No scope summary provided for this proposal."}
            </div>
          </div>
        </div>

        {/* Right Column - Proposal Summary (30%) */}
        <div className="lg:col-span-3 flex">
          {/* Proposal Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-700 w-full flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Proposal Summary</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Review your proposal summary</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{proposedProducts.length} Product{proposedProducts.length !== 1 ? 's' : ''} - Subtotal</span>
                <span className="text-gray-900 dark:text-white font-semibold">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Total Taxes</span>
                <span className="text-gray-900 dark:text-white font-semibold">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 dark:text-gray-300">Order Processing</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white">$0.00</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                  <span className="text-gray-900 dark:text-white">${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Proposal Notes - read-only display */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proposal Notes</label>
              <div className="w-full flex-1 min-h-[60px] px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
                {proposal.specialTerms || "No special notes for this proposal."}
              </div>
            </div>

            {/* Download PDF Button */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>

            {/* Upload Attachments */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">PDF, JPEG, or PNG</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Proposed Products / Elements Section */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeTab === "products" ? "Proposed Products" : activeTab === "elements" ? "Proposal Elements" : activeTab === "files" ? "Proposal Files" : "Acceptance & Signatures"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activeTab === "products" ? "Products included in this proposal" : activeTab === "elements" ? "Work breakdown structure and deliverables" : activeTab === "files" ? "Documents and files attached to this proposal" : "Client and company signature tracking"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "products"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab("elements")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "elements"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  Elements
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "files"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  Files
                </button>
                <button
                  onClick={() => setActiveTab("signatures")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "signatures"
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  Signatures
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          {activeTab === "products" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Order Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {proposedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.productName}</div>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">{product.productSku}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                          {product.productFamily}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                        ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                        ${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="px-4 py-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Elements Table */}
          {activeTab === "elements" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleElementSort("wbs")}
                    >
                      <div className="flex items-center">
                        WBS
                        <SortIcon field="wbs" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleElementSort("proposalElement")}
                    >
                      <div className="flex items-center">
                        Proposal Element
                        <SortIcon field="proposalElement" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleElementSort("description")}
                    >
                      <div className="flex items-center">
                        Description
                        <SortIcon field="description" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedElements.map((element) => (
                    <tr key={element.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4">
                        <span className="inline-block px-3 py-1 text-sm font-mono font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          {element.wbs}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{element.proposalElement}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{element.description}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Files Table */}
          {activeTab === "files" && (
            <div>
              {/* Download Selected Button */}
              {selectedFiles.size > 0 && (
                <div className="px-6 py-3 bg-primary/5 dark:bg-primary/10 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={handleDownloadSelected}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Selected
                    </button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-12">
                        <input
                          type="checkbox"
                          checked={selectedFiles.size === proposalFiles.length && proposalFiles.length > 0}
                          onChange={handleSelectAllFiles}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">File Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Uploaded By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {proposalFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${selectedFiles.has(file.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => handleFileSelect(file.id)}
                            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.fileType)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{file.fileName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {file.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{file.fileType}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{file.fileSize}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{file.uploadedBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.uploadedDate}</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button className="px-4 py-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signatures Table */}
          {activeTab === "signatures" && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-1/3">Field</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-1/3">Client</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-1/3">Company</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Signed By</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.clientSignedBy || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.companySignedBy || "-"}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Signed Title</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{proposal.clientSignedTitle || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{proposal.companySignedTitle || "-"}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Signed Date</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{proposal.clientSignedDate || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{proposal.companySignedDate || "-"}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg" style={{ zIndex: 40 }}>
        <button
          onClick={() => router.push("/proposals")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Proposals
        </button>
        <div className="flex gap-3">
          {proposal.status === "Draft" && (
            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Edit Proposal
            </button>
          )}
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Download PDF
          </button>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind fixed footer */}
      <div className="h-20"></div>
    </Sidebar>
  );
}
