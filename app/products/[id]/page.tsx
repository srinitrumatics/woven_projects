"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import ProductGallery from "./components/ProductGallery";
import ProductInfoCard from "./components/ProductInfoCard";
import ProductTabs from "./components/ProductTabs";
import { useUserSession } from "@/components/UserSessionContext";
import { getCategoryFromAccountType } from "@/lib/permissions";
import { ProductOverviewTab } from "./components/ProductOverviewTab";
import { SpecificationsTab } from "./components/SpecificationsTab";
import { DatasheetsTab } from "./components/DatasheetsTab";
import { AuthorizedSuppliersTab } from "./components/AuthorizedSuppliersTab";
import { ComplianceCertsTab } from "./components/ComplianceCertsTab";
import { getProductDetails, mapSalesforceProductToLocal, Product } from "@/lib/products-service";
import EditProductTabs from "./components/EditProductTabs";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, selectedAccount } = useUserSession();
  const [activeTab, setActiveTab] = useState("Overview");
  const [product, setProduct] = useState<Product | null>(null);
  const [rawProduct, setRawProduct] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [datasheets, setDatasheets] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [datasheetsLoading, setDatasheetsLoading] = useState(false);
  const [certificationsLoading, setCertificationsLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
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

          setProduct(mappedProduct);
          setRawProduct(sfProduct);
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

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (activeTab !== "Authorized Suppliers" || !id || !selectedAccount || !user || suppliers.length > 0) return;

      try {
        setSuppliersLoading(true);
        const accountId = selectedAccount.Id || selectedAccount.id;
        const contactId = user.Id || user.contact?.Id;

        const result = await getProductDetails(accountId, contactId, id, "suppliers");
        if (result.success && result.data && result.data.length > 0) {
          const sfSuppliers = result.data[0].Authorized_Suppliers__c || [];
          setSuppliers(sfSuppliers);
        }
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        setSuppliersLoading(false);
      }
    };

    fetchSuppliers();
  }, [activeTab, id, selectedAccount, user, suppliers.length]);



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
      <div className=" mx-auto p-2 md:p-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span className="hover:text-primary cursor-pointer">Home</span>
          <span>&gt;</span>
          <span className="hover:text-primary cursor-pointer"><button onClick={() => window.history.back()} className="hover:text-gray-700 dark:hover:text-gray-300 truncate">Products</button></span>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
          {(() => {
            const accountCategory = getCategoryFromAccountType(selectedAccount?.Account_Record_Type__c);
            const isCustomer = accountCategory === 'Customer';
            const isManufacturerOrHybrid = accountCategory === 'Partner' || accountCategory === 'Hybrid';
            const status = (product.status || '').trim();

            // Rule 1: If product is in 'Available' status, NO users can edit it
            if (status.toLowerCase() === 'available') return null;

            // Rule 2: Customer or NSO accounts cannot edit products
            if (isCustomer) return null;

            // Rule 3: Manufacturer or Hybrid users can ONLY edit if the status is 'Draft'
            if (isManufacturerOrHybrid && status.toLowerCase() == 'draft') return null;

            return (
              <button
                onClick={() => setEditModalOpen(!editModalOpen)}
                className={`ml-auto text-sm px-4 py-2 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 ${editModalOpen ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-primary hover:bg-primary-dark text-white'}`}
              >
                {editModalOpen ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Product
                  </>
                )}
              </button>
            );
          })()}
        </nav>

        {editModalOpen ? (
          <div className="mb-12">
            <EditProductTabs
              onClose={() => {
                setEditModalOpen(false);
                setTimeout(() => window.location.reload(), 5000);
              }}
              productToEdit={rawProduct}
            />
          </div>
        ) : (
          <>
            {/* Top Section: Gallery and Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Gallery - Left Side */}
              <div className="lg:col-span-7 flex flex-col xl:flex-row gap-4">
                <ProductGallery images={product.images} />
              </div>

              {/* Info Card - Right Side */}
              <div className="lg:col-span-5">
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
                {activeTab === "Authorized Suppliers" && <AuthorizedSuppliersTab suppliers={suppliers} isLoading={suppliersLoading} />}
                {activeTab === "Compliance & Certs" && <ComplianceCertsTab certifications={certifications} isLoading={certificationsLoading} />}
              </div>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
}

