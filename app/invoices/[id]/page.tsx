"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import { InvoiceStatus, PaymentStatus } from "../types";
import { mockPayments } from "../mockData";

interface InvoiceLine {
  id: string;
  productName: string;
  productSku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId: string;
  notes?: string;
  processedBy?: string;
}

// Mock invoice line items
const mockInvoiceLines: InvoiceLine[] = [
  {
    id: "1",
    productName: "Reflect Plus Cloud monitoring",
    productSku: "Reflect-Plus",
    description: "Reflect Plus Cloud monitoring and management, up to 5 systems (monthly price)",
    quantity: 12,
    unitPrice: 125.00,
    discount: 0,
    subtotal: 1500.00
  },
  {
    id: "2",
    productName: "Apple iPad mini 8.3 inch",
    productSku: "MN6B1LL/A",
    description: "Apple 8.3'' iPad mini (7th Gen, 128GB, Wi-Fi Only, Starlight)",
    quantity: 20,
    unitPrice: 449.00,
    discount: 5,
    subtotal: 8531.00
  },
  {
    id: "3",
    productName: "2TX 4K NDI PTZ Camera",
    productSku: "PTB221NV2",
    description: "2TX 4K NDI PTZ live streaming camera",
    quantity: 6,
    unitPrice: 1250.00,
    discount: 0,
    subtotal: 7500.00
  }
];

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Mock invoice data
  const invoice = {
    invoiceNumber: "INV-2024-1001",
    accountName: "Blum Oakland",
    contactName: "Sarah Johnson",
    status: "Paid" as InvoiceStatus,
    invoiceDate: "2024-10-15",
    dueDate: "2024-11-14",
    description: "Q4 2024 Product Order - Premium Selection",
    relatedOrderNumber: "ORD-2024-0845",
    salesOrderNumber: "SO-2024-0412",
    billingAddress: "578 West Grand Ave, Oakland, CA 94612",
    shippingAddress: "578 West Grand Ave, Oakland, CA 94612",
    paymentTerms: "NET 30",
    notes: "Customer requested expedited delivery. Premium products only."
  };

  // Get payments for this invoice
  const payments: Payment[] = mockPayments[id] || [];

  // Calculate totals
  const productsSubtotal = mockInvoiceLines.reduce((sum, line) => sum + line.subtotal, 0);
  const discountTotal = mockInvoiceLines.reduce((sum, line) => sum + ((line.unitPrice * line.quantity * line.discount) / 100), 0);
  const taxRate = 0.15;
  const taxTotal = (productsSubtotal - discountTotal) * taxRate;
  const shippingCost = 65.00;
  const grandTotal = productsSubtotal - discountTotal + taxTotal + shippingCost;
  const amountPaid = payments.reduce((sum, payment) => payment.status === "Completed" ? sum + payment.amount : sum, 0);
  const amountDue = grandTotal - amountPaid;

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Partial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Sent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Viewed":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Cancelled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Sidebar>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <button onClick={() => router.push("/invoices")} className="hover:text-gray-700 dark:hover:text-gray-300">Invoices</button>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{invoice.description}</p>
          </div>
          <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Invoice Information (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Account & Invoice Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer and order details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                <p className="text-gray-900 dark:text-white font-semibold">{invoice.accountName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                <p className="text-gray-900 dark:text-white font-semibold">{invoice.contactName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Related Order</label>
                <p className="text-primary hover:text-primary-dark cursor-pointer">{invoice.relatedOrderNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sales Order</label>
                <p className="text-primary hover:text-primary-dark cursor-pointer">{invoice.salesOrderNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                <p className="text-gray-900 dark:text-white">{invoice.paymentTerms}</p>
              </div>
            </div>
          </div>

          {/* Dates & Addresses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dates & Addresses</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timeline and location information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
                <p className="text-gray-900 dark:text-white">{invoice.invoiceDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <p className="text-gray-900 dark:text-white font-semibold">{invoice.dueDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billing Address</label>
                <p className="text-gray-900 dark:text-white">{invoice.billingAddress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                <p className="text-gray-900 dark:text-white">{invoice.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Received payments and transactions</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No payments received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{payment.paymentNumber}</span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transaction: {payment.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.paymentDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Method:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{payment.paymentMethod}</span>
                      </div>
                      {payment.processedBy && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Processed by:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{payment.processedBy}</span>
                        </div>
                      )}
                    </div>

                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Notes:</span> {payment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Additional information</p>
              </div>
            </div>
            <p className="text-gray-900 dark:text-white">{invoice.notes}</p>
          </div>
        </div>

        {/* Right Column - Invoice Summary (30%) */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{mockInvoiceLines.length} Product{mockInvoiceLines.length !== 1 ? 's' : ''} - Subtotal</span>
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
                <div className="flex justify-between text-xl font-bold mb-2">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-700 dark:text-gray-300">Amount Paid</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">-${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="text-gray-900 dark:text-white">Amount Due</span>
                      <span className={amountDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                        ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 border-t border-gray-300 dark:border-gray-600 pt-4">
              {amountDue > 0 && (
                <button className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
                  Make Payment (${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </button>
              )}
              <button className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium">
                Download PDF
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                Send to Customer
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Line Items Table */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products included in this invoice</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-light dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Quantity</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Discount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockInvoiceLines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{line.productName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{line.productSku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                      <div className="line-clamp-2">{line.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">{line.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      ${line.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {line.discount > 0 ? `${line.discount}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                      ${line.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          onClick={() => router.push("/invoices")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Invoices
        </button>
        <div className="flex gap-3">
          {amountDue > 0 && (
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Make Payment
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
