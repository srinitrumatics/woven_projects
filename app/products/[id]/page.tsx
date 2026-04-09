"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import ProductGallery from "./components/ProductGallery";
import ProductInfoCard from "./components/ProductInfoCard";
import ProductTabs from "./components/ProductTabs";
import { useUserSession } from "@/components/UserSessionContext";
import { ProductOverviewTab } from "./components/ProductOverviewTab";
import { SpecificationsTab } from "./components/SpecificationsTab";
import { DatasheetsTab } from "./components/DatasheetsTab";
import { AuthorizedSuppliersTab } from "./components/AuthorizedSuppliersTab";
import { ComplianceCertsTab } from "./components/ComplianceCertsTab";
import { getProductDetails, mapSalesforceProductToLocal, Product } from "@/lib/products-service";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, selectedAccount } = useUserSession();
  const [activeTab, setActiveTab] = useState("Overview");
  const [product, setProduct] = useState<Product | null>(null);
  const [datasheets, setDatasheets] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [datasheetsLoading, setDatasheetsLoading] = useState(false);
  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id || !selectedAccount || !user) return;

      try {
        setLoading(true);
        const accountId = selectedAccount.Id || selectedAccount.id;
        const contactId = user.Id || user.contact?.Id;

        if (!accountId || !contactId) return;

        const result = await getProductDetails(accountId, contactId, id, "product");

        if (result.success && result.data && result.data.length > 0) {
          const sfProduct = result.data[0].Product[0];
          const mappedProduct = mapSalesforceProductToLocal(sfProduct);

          // Add mock suppliers for now - we'll refactor this later
          mappedProduct.suppliers = [
            { name: "Global Thermic Systems", code: "GTS-001", type: "OEM", tier: 1, status: "Preferred", price: 12450.00, moq: "1 unit", leadTime: "14 days", region: "North America", audit: "Jan 2024" },
            { name: "Precision Heat Corp", code: "PHC-982", type: "Licensed", tier: 2, status: "Approved", price: 13100.00, moq: "5 units", leadTime: "21 days", region: "Europe", audit: "Mar 2024" },
            { name: "EcoThermal Solutions", code: "ETS-441", type: "Third Party", tier: 2, status: "Conditional", price: 11800.00, moq: "10 units", leadTime: "38 days", region: "Asia Pacific", audit: "Oct 2023" },
            { name: "Legacy Components", code: "LC-221", type: "Wholesale", tier: 3, status: "Exception Only", price: 14500.00, moq: "1 unit", leadTime: "28 days", region: "North America", audit: "Dec 2023" },
          ];

          setProduct(mappedProduct);
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, selectedAccount, user]);

  useEffect(() => {
    const fetchDatasheets = async () => {
      if (activeTab !== "Datasheets" || !id || !selectedAccount || !user || datasheets.length > 0) return;

      try {
        setDatasheetsLoading(true);
        const accountId = selectedAccount.Id || selectedAccount.id;
        const contactId = user.Id || user.contact?.Id;

        const result = await getProductDetails(accountId, contactId, id, "datasheets");
        if (result.success && result.data && result.data.length > 0) {
          const sfDatasheets = result.data[0].Product_Datasheet__c || [];
          setDatasheets(sfDatasheets);
        }
      } catch (err) {
        console.error("Error fetching datasheets:", err);
      } finally {
        setDatasheetsLoading(false);
      }
    };

    fetchDatasheets();
  }, [activeTab, id, selectedAccount, user, datasheets.length]);

  useEffect(() => {
    const fetchCertifications = async () => {
      if (activeTab !== "Compliance & Certs" || !id || !selectedAccount || !user || certifications.length > 0) return;

      try {
        setCertificationsLoading(true);
        const accountId = selectedAccount.Id || selectedAccount.id;
        const contactId = user.Id || user.contact?.Id;

        const result = await getProductDetails(accountId, contactId, id, "certifications");
        if (result.success && result.data && result.data.length > 0) {
          const sfCerts = result.data[0].Product_Certification__c || [];
          setCertifications(sfCerts);
        }
      } catch (err) {
        console.error("Error fetching certifications:", err);
      } finally {
        setCertificationsLoading(false);
      }
    };

    fetchCertifications();
  }, [activeTab, id, selectedAccount, user, certifications.length]);



  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Sidebar>
    );
  }

  if (error || !product) {
    return (
      <Sidebar>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error || "Product Not Found"}</h2>
          <button onClick={() => window.history.back()} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="hover:text-primary cursor-pointer">Home</span>
          <span>&gt;</span>
          <span className="hover:text-primary cursor-pointer">Products</span>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
        </nav>

        {/* Top Section: Gallery and Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Gallery - Left Side */}
          <div className="lg:col-span-8 flex flex-col xl:flex-row gap-4">
            <ProductGallery images={product.images} />
          </div>

          {/* Info Card - Right Side */}
          <div className="lg:col-span-4">
            <ProductInfoCard product={product} />
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ProductTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={["Overview", "Specifications & Dims", "Datasheets", "Authorized Suppliers", "Compliance & Certs"]}
          />

          <div className="p-8">
            {activeTab === "Overview" && <ProductOverviewTab product={product} />}
            {activeTab === "Specifications & Dims" && <SpecificationsTab specifications={product.specifications} />}
            {activeTab === "Datasheets" && <DatasheetsTab datasheets={datasheets} isLoading={datasheetsLoading} />}
            {activeTab === "Authorized Suppliers" && <AuthorizedSuppliersTab suppliers={product.suppliers} />}
            {activeTab === "Compliance & Certs" && <ComplianceCertsTab certifications={certifications} isLoading={certificationsLoading} />}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

