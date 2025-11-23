"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { mockProducts } from "../../products/mockData";
import { Product } from "../types";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State management for product tables
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"myOrder" | "catalog">("myOrder"); // Default to My Order table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [orderProducts, setOrderProducts] = useState<Product[]>([
    { ...mockProducts[0], orderQty: 25, subtotal: 212.50 },
    { ...mockProducts[1], orderQty: 50, subtotal: 220.00 }
  ]);

  const [formData, setFormData] = useState({
    // Primary Details
    shipTo: "Blum - Oakland",
    shippingAddress: "C10-0000775-LIC | 578 West Grand Ave, Oakland, CA 94612",
    purchaseOrder: "",
    requestedDeliveryDate: "",

    // Contact Information
    locationContact: "",
    contactPhone: "",
    contactEmail: "",

    // Delivery Preferences
    paymentTerms: "NET 30",
    dropShip: false,
    liftGateRequired: false,
    insideDelivery: false,

    // Order Notes
    orderNotes: ""
  });

  // Calculate dynamic order totals based on actual products in the order
  const productsSubtotal = orderProducts.reduce((sum, product) => sum + product.subtotal, 0);
  const totalExciseTax = productsSubtotal * 0.15; // 15% excise tax
  const orderProcessing = productsSubtotal * 0.07; // 7% processing fee
  const shipping = 65.00; // Fixed shipping cost
  const grandTotal = productsSubtotal + totalExciseTax + orderProcessing + shipping;

  const handleAddProduct = (product: Product) => {
    // Check if product already exists in order
    const existingProduct = orderProducts.find(p => p.id === product.id);
    if (!existingProduct) {
      setOrderProducts([...orderProducts, { ...product, orderQty: 1, subtotal: product.unitPrice }]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setOrderProducts(orderProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setOrderProducts(orderProducts.map(p =>
      p.id === productId ? { ...p, orderQty: newQuantity, subtotal: newQuantity * p.unitPrice } : p
    ));
  };

  const filteredCatalogProducts = mockProducts.filter(product =>
    !orderProducts.find(op => op.id === product.id) && (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredOrderProducts = orderProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for catalog
  const totalPages = Math.ceil(filteredCatalogProducts.length / itemsPerPage);
  const paginatedCatalogProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCatalogProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCatalogProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes or view mode changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, viewMode]);

  return (
    <Sidebar>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <button onClick={() => router.push("/orders")} className="hover:text-gray-700 dark:hover:text-gray-300">Orders</button>
          <span>&gt;</span>
          <span className="hover:text-gray-700 dark:hover:text-gray-300">Create Order</span>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white">Order #{id}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order #{id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Client Information (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Shipping Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Where should we deliver your order?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ship To Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.shipTo}
                  onChange={(e) => setFormData({...formData, shipTo: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option>Blum - Oakland</option>
                  <option>Blum - San Francisco</option>
                  <option>Blum - San Jose</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requested Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.requestedDeliveryDate}
                  onChange={(e) => setFormData({...formData, requestedDeliveryDate: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Order # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter PO number"
                  value={formData.purchaseOrder}
                  onChange={(e) => setFormData({...formData, purchaseOrder: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option>NET 10</option>
                  <option>NET 30</option>
                  <option>NET 60</option>
                  <option>Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ship to Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ship to Contact</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Who should we contact about this delivery?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.locationContact}
                  onChange={(e) => setFormData({...formData, locationContact: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Delivery Options Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Options</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select any special delivery requirements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 content-start">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all h-fit">
                <input
                  type="checkbox"
                  checked={formData.dropShip}
                  onChange={(e) => setFormData({...formData, dropShip: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">Drop-Ship</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Direct to customer</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all h-fit">
                <input
                  type="checkbox"
                  checked={formData.liftGateRequired}
                  onChange={(e) => setFormData({...formData, liftGateRequired: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">Lift Gate</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Equipment needed</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all h-fit">
                <input
                  type="checkbox"
                  checked={formData.insideDelivery}
                  onChange={(e) => setFormData({...formData, insideDelivery: e.target.checked})}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white block">Inside Delivery</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Bring inside facility</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Total (30%) */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Order Total Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 sticky top-6 w-full flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Total</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Review your order summary</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{orderProducts.length} Product{orderProducts.length !== 1 ? 's' : ''} - Subtotal</span>
                <span className="text-gray-900 dark:text-white font-semibold">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Total Taxes</span>
                <span className="text-gray-900 dark:text-white font-semibold">${totalExciseTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 dark:text-gray-300">Order Processing</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white">${orderProcessing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                  <span className="text-gray-900 dark:text-white">${shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4 flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Notes</label>
              <textarea
                placeholder="Add special instructions or notes for this order..."
                value={formData.orderNotes}
                onChange={(e) => setFormData({...formData, orderNotes: e.target.value})}
                className="w-full flex-1 px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 resize-none min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Search - Full Width */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, sku or price"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setViewMode("catalog")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "catalog"
                      ? "bg-primary text-white"
                      : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Add Products
                </button>
                <button
                  onClick={() => setViewMode("myOrder")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "myOrder"
                      ? "bg-primary text-white"
                      : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  My Order ({orderProducts.length})
                </button>
              </div>
            </div>

            {/* Products Catalog Table */}
            {viewMode === "catalog" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Available Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">List Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCatalogProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery ? "No products found matching your search." : "All products have been added to your order."}
                        </td>
                      </tr>
                    ) : (
                      paginatedCatalogProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-mono text-gray-900 dark:text-white">{product.sku}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" style={{ maxWidth: '250px' }}>
                            <div className="line-clamp-2">{product.description}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                              {product.productFamily}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            <div>{formatNumber(product.availableQty)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">(MOQ {formatNumber(product.moq)})</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400 line-through">
                            {formatCurrency(product.listPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(product.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleAddProduct(product)}
                              className="px-4 py-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              Add to Order
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination for Catalog */}
            {viewMode === "catalog" && filteredCatalogProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCatalogProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemName="products"
              />
            )}

            {/* My Order Table */}
            {viewMode === "myOrder" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Order Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrderProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery ? "No products found matching your search." : "Your order is empty. Click 'Add Products' to start adding items."}
                        </td>
                      </tr>
                    ) : (
                      filteredOrderProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" style={{ maxWidth: '250px' }}>
                            <div className="line-clamp-2">{product.description}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                              {product.productFamily}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(product.id, product.orderQty - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={product.orderQty}
                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                min="0"
                              />
                              <button
                                onClick={() => handleQuantityChange(product.id, product.orderQty + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg" style={{ zIndex: 40 }}>
        <button
          onClick={() => router.push("/orders")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Save Draft
          </button>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Submit Order
          </button>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind fixed footer */}
      <div className="h-20"></div>
    </Sidebar>
  );
}
