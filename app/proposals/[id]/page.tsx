"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { ProposalStatus } from "../types";

interface ProposedProduct {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  margin: number;
  subtotal: number;
  notes?: string;
}

// Mock proposed products
const mockProposedProducts: ProposedProduct[] = [
  {
    id: "1",
    productName: "Room Display License - 3 Year",
    productSku: "HUM10093",
    description: "Room Display License - 3 Year",
    category: "AV Equipment",
    quantity: 10,
    unitPrice: 245.00,
    discount: 10,
    margin: 35,
    subtotal: 2205.00,
    notes: "Annual subscription, volume discount available"
  },
  {
    id: "2",
    productName: "Apple TV 4K Wi-Fi + Ethernet",
    productSku: "MNBB1LL/A",
    description: "Apple TV 4K Wi-Fi + Ethernet",
    category: "Streaming and Recording Devices",
    quantity: 25,
    unitPrice: 159.00,
    discount: 5,
    margin: 40,
    subtotal: 3778.75
  },
  {
    id: "3",
    productName: "CAT6 24-Port Patch Panel",
    productSku: "4K-C6PPK5",
    description: "ADTPRO 4K-C6PPK5 CAT6 24-Port Patch Panel",
    category: "AV Equipment",
    quantity: 15,
    unitPrice: 175.00,
    discount: 0,
    margin: 45,
    subtotal: 2625.00,
    notes: "Professional installation recommended"
  }
];

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Mock proposal data
  const proposal = {
    proposalNumber: "PROP-2024-001",
    accountName: "Blum Oakland",
    contactName: "Sarah Johnson",
    status: "Approved" as ProposalStatus,
    proposalDate: "2024-10-20",
    expirationDate: "2024-12-20",
    description: "Q1 2025 Product Line Expansion Proposal",
    opportunityName: "Q1 2025 Growth Initiative",
    submittedBy: "Account Manager - John Doe",
    billingAddress: "578 West Grand Ave, Oakland, CA 94612",
    shippingAddress: "578 West Grand Ave, Oakland, CA 94612",
    deliveryTerms: "FOB Destination",
    paymentTerms: "NET 30",
    validityPeriod: "60 Days",
    specialTerms: "Volume discount applied for orders over 100 units. Free shipping on orders over $1000.",
    internalNotes: "Client has expressed interest in expanding edibles line. Follow up in 30 days if no response."
  };

  // Calculate totals
  const productsSubtotal = mockProposedProducts.reduce((sum, product) => sum + product.subtotal, 0);
  const discountTotal = mockProposedProducts.reduce((sum, product) => sum + ((product.unitPrice * product.quantity * product.discount) / 100), 0);
  const taxRate = 0.15;
  const taxTotal = (productsSubtotal - discountTotal) * taxRate;
  const shippingCost = 65.00;
  const grandTotal = productsSubtotal - discountTotal + taxTotal + shippingCost;

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
          {/* Account & Opportunity Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer and opportunity details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                <p className="text-gray-900 dark:text-white font-semibold">{proposal.accountName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                <p className="text-gray-900 dark:text-white font-semibold">{proposal.contactName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity</label>
                <p className="text-gray-900 dark:text-white">{proposal.opportunityName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submitted By</label>
                <p className="text-gray-900 dark:text-white">{proposal.submittedBy}</p>
              </div>
            </div>
          </div>

          {/* Dates & Terms */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dates & Terms</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timeline and business terms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proposal Date</label>
                <p className="text-gray-900 dark:text-white">{proposal.proposalDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date</label>
                <p className="text-gray-900 dark:text-white font-semibold">{proposal.expirationDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Validity Period</label>
                <p className="text-gray-900 dark:text-white">{proposal.validityPeriod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                <p className="text-gray-900 dark:text-white">{proposal.paymentTerms}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Terms</label>
                <p className="text-gray-900 dark:text-white">{proposal.deliveryTerms}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Addresses</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Billing and shipping information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
                <p className="text-gray-900 dark:text-white">{proposal.billingAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                <p className="text-gray-900 dark:text-white">{proposal.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Special Terms & Internal Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Special Terms & Notes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Additional conditions and internal notes</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Terms</label>
                <p className="text-gray-900 dark:text-white">{proposal.specialTerms}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Notes</label>
                <p className="text-gray-600 dark:text-gray-400 italic">{proposal.internalNotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Proposal Summary (30%) */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proposal Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{mockProposedProducts.length} Product{mockProposedProducts.length !== 1 ? 's' : ''} - Subtotal</span>
                <span className="text-gray-900 dark:text-white font-semibold">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Discounts</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">-${discountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="text-gray-900 dark:text-white font-semibold">${taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                <span className="text-gray-900 dark:text-white font-semibold">${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 border-t border-gray-300 dark:border-gray-600 pt-4">
              {proposal.status === "Approved" && (
                <button className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium">
                  Convert to Quote
                </button>
              )}
              {proposal.status === "Pending Review" && (
                <>
                  <button className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
                    Approve Proposal
                  </button>
                  <button className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                    Reject Proposal
                  </button>
                </>
              )}
              {proposal.status === "Draft" && (
                <button className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium">
                  Submit for Review
                </button>
              )}
              <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                Download PDF
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                Send to Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposed Products Table */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proposed Products</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products included in this proposal</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Quantity</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Discount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Margin</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockProposedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{product.productName}</div>
                      {product.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">{product.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{product.productSku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">{product.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {product.discount > 0 ? `${product.discount}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                      {product.margin}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                      ${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
