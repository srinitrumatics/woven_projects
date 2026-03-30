"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import ProductGallery from "./components/ProductGallery";
import ProductInfoCard from "./components/ProductInfoCard";
import ProductTabs from "./components/ProductTabs";
import { formatCurrency } from "@/lib/utils/formatting";

// Mock data for the product detail
const productData = {
  id: "REF-6PW5E-STD",
  name: "Refrigerators Model 6PW5E",
  category: "HOME APPLIANCES",
  sku: "REF-6PW5E-STD",
  mpn: "6PW5E-001",
  status: "In Stock",
  onHand: 247,
  warehouses: 3,
  price: 44987.00,
  originalPrice: 52000.00,
  leadTime: "14 days",
  moq: "1 unit",
  manufacturer: "ThermoCore",
  warranty: "2 years",
  description: "The Refrigerators Model 6PW5E is an industrial-grade cooling unit engineered for durability, energy efficiency, and high-capacity cold chain operations. Designed for commercial deployment across logistics hubs, food service, and regulated storage environments.",
  subDescription: "Built with a stainless-steel interior finish and dual compressor architecture, the unit maintains precise temperature bands even under variable ambient load. Remote telemetry and BACnet/IP integration ready out of the box.",
  features: [
    "Dual-zone temperature control, -4°F to 38°F independent zones",
    "BACnet/IP and Modbus RTU protocol support for BMS integration",
    "R-32 refrigerant; 40% lower GWP vs legacy systems",
    "ENERGY STAR certified; 18% below DOE 2023 baseline",
    "Stainless steel interior with antimicrobial coating",
    "Remote diagnostics via onboard RJ45 and cellular failover",
    "ADA-compliant door handle and control panel positioning"
  ],
  quickSpecs: [
    { label: "Capacity", value: "28.5 cu ft" },
    { label: "Width", value: "35.75 in" },
    { label: "Height", value: "70.00 in" },
    { label: "Depth", value: "32.50 in" },
    { label: "Net Weight", value: "387 lbs" },
    { label: "Voltage", value: "208-230V / 60Hz" },
    { label: "Amperage", value: "15A" },
    { label: "Refrigerant", value: "R-32" },
    { label: "Compressor", value: "Dual Inverter" },
    { label: "Noise Level", value: "38 dB(A)" }
  ],
  images: ["/assets/product-placeholder.png"], // Replace with actual images
  specifications: {
    Dimensions: [
      { label: "Overall Width", value: "35.75 in (908 mm)" },
      { label: "Overall Height (w/ hinge)", value: "70.00 in (1778 mm)" },
      { label: "Overall Depth (w/ door)", value: "32.50 in (826 mm)" },
      { label: "Depth (cabinet only)", value: "28.00 in (711 mm)" },
      { label: "Cutout Width", value: "36.00 in (914 mm)" },
      { label: "Cutout Height", value: "70.25 in (1784 mm)" },
      { label: "Net Weight", value: "387 lbs (175.6 kg)" },
      { label: "Shipping Weight", value: "431 lbs (195.6 kg)" },
      { label: "Shipping Dimensions (L x W x H)", value: "40 x 38 x 75 in" }
    ],
    "Electrical & Power": [
      { label: "Voltage Rating", value: "208-230V / 60Hz / 1Ph" },
      { label: "Running Amperage", value: "15A" },
      { label: "Connected Load", value: "3.2 kW" },
      { label: "Annual Energy Consumption", value: "487 kWh/yr" },
      { label: "Plug Type", value: "NEMA 6-15P" },
      { label: "Cord Length", value: "72 in" }
    ],
    "Refrigeration System": [
      { label: "Compressor Type", value: "Dual Variable-Speed Inverter" },
      { label: "Refrigerant Type", value: "R-32 (HFC)" },
      { label: "Refrigerant Charge", value: "6.2 oz" },
      { label: "Fresh Food Temp Range", value: "33°F to 45°F (0.5°C to 7°C)" },
      { label: "Freezer Temp Range", value: "-4°F to 10°F (-20°C to -12°C)" },
      { label: "Total Storage Capacity", value: "28.5 cu ft (807 L)" },
      { label: "Fresh Food Section", value: "19.3 cu ft (546 L)" },
      { label: "Freezer Section", value: "9.2 cu ft (261 L)" },
      { label: "Ambient Operating Range", value: "40°F to 110°F (4°C to 43°C)" }
    ]
  },
  datasheets: [
    { title: "6PW5E Product Data Sheet", type: "PDF", size: "2.4 MB", revision: "3.1" },
    { title: "Installation & Service Guide", type: "PDF", size: "8.7 MB", revision: "2.0" },
    { title: "CAD Drawing - Front View", type: "DWG", size: "1.1 MB", revision: "ANSI D" },
    { title: "3D Model - STEP AP214", type: "STEP", size: "14.2 MB", revision: "Full assembly" },
    { title: "BOM - Bill of Materials", type: "XLSX", size: "340 KB", revision: "Level 4" },
    { title: "ENERGY STAR Certification", type: "PDF", size: "210 KB", revision: "2024" },
    { title: "Electrical Wiring Diagram", type: "PDF", size: "1.8 MB", revision: "1.4" },
    { title: "Warranty & Service Agreement", type: "PDF", size: "420 KB", revision: "2025 edition" }
  ],
  suppliers: [
    { name: "ThermoCore Distribution LLC", code: "SUP-0012", type: "Manufacturer Direct", tier: 1, status: "Preferred", price: 41200.00, moq: 1, leadTime: "14 days", region: "North America", audit: "Jan 2025" },
    { name: "ColdChain Partners Inc.", code: "SUP-0058", type: "Authorized Distributor", tier: 1, status: "Approved", price: 42500.00, moq: 2, leadTime: "21 days", region: "North America", audit: "Mar 2025" },
    { name: "Euro Industrial Supply GmbH", code: "SUP-0112", type: "International Distributor", tier: 2, status: "Approved", price: 43100.00, moq: 5, leadTime: "28 days", region: "EMEA", audit: "Nov 2024" },
    { name: "APAC Cooling Solutions Pte.", code: "SUP-0177", type: "Regional Reseller", tier: 2, status: "Conditional", price: 44700.00, moq: 10, leadTime: "38 days", region: "APAC", audit: "Aug 2024" },
    { name: "Midwest Appliance Wholesale", code: "SUP-0233", type: "Spot Buyer", tier: 3, status: "Exception Only", price: 44987.00, moq: 25, leadTime: "45+ days", region: "North America", audit: "May 2024" }
  ],
  certifications: [
    { title: "ENERGY STAR", org: "U.S. EPA / DOE", status: "Valid", dateLabel: "Expires", date: "Dec 2026", icon: "★" },
    { title: "UL 471", org: "Underwriters Laboratories", status: "Valid", dateLabel: "Expires", date: "Jul 2027", icon: "●" },
    { title: "CE Mark", org: "EU Conformity", status: "Valid", dateLabel: "Issued", date: "Jan 2024", icon: "⊥" },
    { title: "RoHS 3", org: "EU Directive 2015/863", status: "Valid", dateLabel: "Issued", date: "Jan 2024", icon: "◆" },
    { title: "NSF/ANSI 7", org: "NSF International", status: "Valid", dateLabel: "Expires", date: "Mar 2026", icon: "▽" },
    { title: "ISO 9001:2015", org: "ThermoCore MFG", status: "Valid", dateLabel: "Expires", date: "Sep 2026", icon: "🔗" },
    { title: "REACH SVHC", org: "ECHA Compliance", status: "Valid", dateLabel: "Issued", date: "Jun 2024", icon: "♡" },
    { title: "FCC Part 15B", org: "Federal Comm. Commission", status: "Valid", dateLabel: "Issued", date: "Jan 2024", icon: "■" }
  ]
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <Sidebar>
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="hover:text-primary cursor-pointer">Home</span>
          <span>&gt;</span>
          <span className="hover:text-primary cursor-pointer">Products</span>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white font-medium">{productData.name}</span>
        </nav>

        {/* Top Section: Gallery and Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Gallery - Left Side */}
          <div className="lg:col-span-8 flex flex-col xl:flex-row gap-4">
            <ProductGallery images={productData.images} />
          </div>

          {/* Info Card - Right Side */}
          <div className="lg:col-span-4">
            <ProductInfoCard product={productData} />
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={["Overview", "Specifications & DIMs", "Datasheets", "Authorized Suppliers", "Compliance & Certs"]}
          />

          <div className="p-8">
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Description & Features */}
                <div className="lg:col-span-8">
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400  mb-4">Product Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {productData.description}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {productData.subDescription}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400  mb-4">Key Features</h3>
                    <ul className="space-y-3">
                      {productData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-snug">
                          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Quick Specifications */}
                <div className="lg:col-span-4">
                  <h3 className="text-xs font-bold text-gray-400  mb-4">Quick Specifications</h3>
                  <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {productData.quickSpecs.map((spec, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between items-center px-4 py-3 text-sm ${idx !== productData.quickSpecs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                          }`}
                      >
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{spec.label}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Specifications & DIMs" && (
              <div className="space-y-10">
                {Object.entries(productData.specifications).map(([section, specs], groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{section}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                      {specs.map((spec, idx) => (
                        <div key={idx} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{spec.label}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Datasheets" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {productData.datasheets.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs ${doc.type === 'PDF' ? 'bg-red-50 text-red-600' :
                      doc.type === 'DWG' ? 'bg-blue-50 text-blue-600' :
                        doc.type === 'STEP' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-green-50 text-green-600'
                      }`}>
                      {doc.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={doc.title}>{doc.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{doc.type} guide • {doc.size} • Rev {doc.revision}</p>
                    </div>
                    <div className="text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Authorized Suppliers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 ">Approved Supplier Network</h3>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                    + Request Supplier Approval
                  </button>
                </div>

                {/* Important Note Alert */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                    Procurement must use Tier 1 suppliers for orders above $250,000. Tier 2 requires VP approval. Tier 3 requires exception process via Supply Chain.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr className="text-[10px] font-bold text-gray-400 ">
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Supplier</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Tier</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Unit Price</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">MOQ</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Lead Time</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Region</th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Last Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                      {productData.suppliers.map((sup, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-bold text-gray-900 dark:text-white mb-0.5">{sup.name}</div>
                            <div className="text-[10px] text-gray-400 uppercase">{sup.code} • {sup.type}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">Tier {sup.tier}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`flex items-center gap-1.5 font-bold ${sup.status === 'Preferred' ? 'text-green-600' :
                              sup.status === 'Approved' ? 'text-green-600' :
                                sup.status === 'Conditional' ? 'text-orange-500' :
                                  'text-red-500'
                              }`}>
                              {sup.status === 'Preferred' && <span>✓</span>}
                              {sup.status === 'Approved' && <span>✓</span>}
                              {sup.status === 'Conditional' && <span>▲</span>}
                              {sup.status === 'Exception Only' && <span>⚠</span>}
                              {sup.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(sup.price)}</td>
                          <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.moq}</td>
                          <td className="px-4 py-4 flex items-center gap-2">
                            <div className={`w-8 h-1 rounded-full ${sup.leadTime.includes('14') ? 'bg-blue-600' :
                              sup.leadTime.includes('21') ? 'bg-blue-400' :
                                sup.leadTime.includes('28') ? 'bg-blue-300' :
                                  sup.leadTime.includes('38') ? 'bg-orange-400' :
                                    'bg-red-500'
                              }`}></div>
                            <span className="text-gray-700 dark:text-gray-300">{sup.leadTime}</span>
                          </td>
                          <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.region}</td>
                          <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.audit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Compliance & Certs" && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400  mb-6">Certifications & Standards</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {productData.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group cursor-default"
                    >
                      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6 text-xl text-gray-400 group-hover:text-blue-500 transition-colors">
                        {cert.icon}
                      </div>
                      <h4 className="text-[12px] font-extrabold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{cert.title}</h4>
                      <p className="text-[11px] font-bold text-gray-400 mb-4 whitespace-nowrap">{cert.org}</p>

                      <div className="mb-5">
                        <span className="text-[11px] text-gray-400 block mb-0.5">{cert.dateLabel}: <span className="text-gray-600 dark:text-gray-300 font-bold">{cert.date}</span></span>
                      </div>

                      <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1 bg-green-50/50 dark:bg-green-900/10 text-green-600 rounded-full text-[11px] font-bold  border border-green-100 dark:border-green-900/20">
                        <div className="w-1 h-1 rounded-full bg-green-600"></div>
                        {cert.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
