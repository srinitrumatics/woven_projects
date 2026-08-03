"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import { getCategoryFromAccountType } from "@/lib/permissions";
import React from 'react';
import ProductTabs from './ProductTabs';
import DatasheetModal from './DatasheetModal';
import CertificationModal from './CertificationModal';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { StatusBadge } from "@/components/ui/StatusBadge";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface EditProductTabsProps {
  productToEdit?: any;
  onClose: () => void;
}

export default function EditProductTabs({ productToEdit, onClose }: EditProductTabsProps) {
  const { user, selectedAccount } = useUserSession();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picklists, setPicklists] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  // Permission Logic
  const accountCategory = getCategoryFromAccountType(selectedAccount?.Account_Record_Type__c);
  const isCustomer = accountCategory === 'Customer';
  const isManufacturerOrHybrid = accountCategory === 'Partner' || accountCategory === 'Hybrid';
  const availability = (productToEdit?.Product_Availability__c || productToEdit?.product_availability__c || '').trim();

  const canEdit = !isCustomer && availability.toLowerCase() !== 'available' && (!isManufacturerOrHybrid || availability.toLowerCase() === 'draft');

  if (!canEdit) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 text-center">
        <h3 className="text-lg font-bold mb-2">Access Denied</h3>
        <p>You do not have permission to edit this product in its current status ({availability || 'Unknown'}).</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Close</button>
      </div>
    );
  }


  const [isDatasheetModalOpen, setIsDatasheetModalOpen] = useState(false);
  const [selectedDatasheet, setSelectedDatasheet] = useState<any>(null);
  const [datasheets, setDatasheets] = useState<any[]>([]);
  const [datasheetsLoading, setDatasheetsLoading] = useState(false);

  useEffect(() => {
    const fetchDatasheets = async () => {
      if (activeTab !== "Datasheets" || !productToEdit?.Id || !selectedAccount || !user || datasheets.length > 0) return;

      try {
        setDatasheetsLoading(true);
        const accountId = selectedAccount?.Id || selectedAccount?.id;
        const contactId = user?.Id || user?.contact?.Id;

        const res = await fetch(`/api/salesforce/product-details?accountId=${accountId}&contactId=${contactId}&productId=${productToEdit.Id}&tabName=datasheets`);
        const result = await res.json();

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
  }, [activeTab, productToEdit?.Id, selectedAccount, user, datasheets.length]);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  useEffect(() => {
    const fetchCertifications = async () => {
      if (activeTab !== "Compliance & Certs" || !productToEdit?.Id || !selectedAccount || !user || certifications.length > 0) return;

      try {
        setCertsLoading(true);
        const accountId = selectedAccount?.Id || selectedAccount?.id;
        const contactId = user?.Id || user?.contact?.Id;

        const res = await fetch(`/api/salesforce/product-details?accountId=${accountId}&contactId=${contactId}&productId=${productToEdit.Id}&tabName=certifications`);
        const result = await res.json();

        if (result.success && result.data && result.data.length > 0) {
          const sfCerts = result.data[0].Product_Certification__c || [];
          setCertifications(sfCerts);
        }
      } catch (err) {
        console.error("Error fetching certifications:", err);
      } finally {
        setCertsLoading(false);
      }
    };

    fetchCertifications();
  }, [activeTab, productToEdit?.Id, selectedAccount, user, certifications.length]);

  const [formData, setFormData] = useState<any>({
    name: productToEdit?.Name || "",
    sku: productToEdit?.StockKeepingUnit || "",
    productCode: productToEdit?.ProductCode || productToEdit?.productCode || productToEdit?.productcode || productToEdit?.Product_Code__c || productToEdit?.gtherp__Product_Code__c || productToEdit?.gtherp__product_code__c || "",
    family: productToEdit?.Family || "",
    productFamilyNo: productToEdit?.Product_Family__c || "",
    availabilityStatus: productToEdit?.Availability_Status__c || "Out of Stock",
    availableToSell: productToEdit?.Available_To_Sell__c?.toString() || "0",
    unitPrice: productToEdit?.Unit_Price__c?.toString() || "",
    listPrice: productToEdit?.List_Price__c?.toString() || "",
    leadTimeWks: productToEdit?.Lead_Time_Wks__c?.toString() || "",
    moq: productToEdit?.MOQ__c?.toString() || "",
    manufacturer: productToEdit?.Manufacturer_Name || "",
    description: productToEdit?.Description || productToEdit?.description || "",
    keyFeatures: productToEdit?.Key_Features__c || "",
    cubicVolumeIn: productToEdit?.Unit_CV_Inches__c?.toString() || "",
    lengthIn: productToEdit?.Unit_Length__c?.toString() || "",
    widthIn: productToEdit?.Unit_Width__c?.toString() || "",
    heightIn: productToEdit?.Unit_Height__c?.toString() || "",
    netWeightLbs: productToEdit?.Unit_Net_Weight__c?.toString() || "",
    grossWeightLbs: productToEdit?.Unit_Gross_Weight__c?.toString() || "",
    caseCubicVolumeIn: productToEdit?.Case_CV_Inches__c?.toString() || "",
    caseLengthIn: productToEdit?.Case_Length__c?.toString() || "",
    caseWidthIn: productToEdit?.Case_Width__c?.toString() || "",
    caseHeightIn: productToEdit?.Case_Height__c?.toString() || "",
    caseNetWeightLbs: productToEdit?.Case_Net_Weight__c?.toString() || "",
    caseGrossWeightLbs: productToEdit?.Case_Gross_Weight__c?.toString() || "",
    shippingWeightDW139: productToEdit?.Case_DW_139__c?.toString() || "",
    shippingWeightDW166: productToEdit?.Case_DW_166__c?.toString() || "",
    eccn: productToEdit?.ECCN__c || "",
    htsCode: productToEdit?.HTS_Code__c || "",
    gtin: productToEdit?.GTIN__c || "",
    upc: productToEdit?.UPC__c || "",
    voltageRating: productToEdit?.Voltage_Rating__c || "",
    plugType: productToEdit?.Plug_Type__c || "",
    cordLength: productToEdit?.Cord_Length__c || "",
    productAvailabilityESG: productToEdit?.product_Availability__c || "",
    energyConsumption: productToEdit?.Energy_Consumption__c?.toString() || "",
    endOfLifeManagement: productToEdit?.End_of_Life_Management__c || "",
    manufacturingProcess: productToEdit?.Manufacturing_Process__c || "",
    packagingMaterials: productToEdit?.Packaging_Materials__c || "",
    productLongevity: productToEdit?.product_Longevity__c || "",
    productUseEmissions: productToEdit?.product_Use_Emissions__c || "",
    waterUsage: productToEdit?.Water_Usage__c || "",
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit?.Name || "",
        sku: productToEdit?.StockKeepingUnit || "",
        productCode: productToEdit?.ProductCode || productToEdit?.productCode || productToEdit?.productcode || productToEdit?.Product_Code__c || productToEdit?.gtherp__Product_Code__c || productToEdit?.gtherp__product_code__c || "",
        family: productToEdit?.Family || "",
        productFamilyNo: productToEdit?.Product_Family__c || "",
        availabilityStatus: productToEdit?.Availability_Status__c || "Out of Stock",
        availableToSell: productToEdit?.Available_To_Sell__c?.toString() || "0",
        unitPrice: productToEdit?.Unit_Price__c?.toString() || "",
        listPrice: productToEdit?.List_Price__c?.toString() || "",
        leadTimeWks: productToEdit?.Lead_Time_Wks__c?.toString() || "",
        moq: productToEdit?.MOQ__c?.toString() || "",
        manufacturer: productToEdit?.Manufacturer_Name || "",
        description: productToEdit?.Description || productToEdit?.description || "",
        keyFeatures: productToEdit?.Key_Features__c || "",
        cubicVolumeIn: productToEdit?.Unit_CV_Inches__c?.toString() || "",
        lengthIn: productToEdit?.Unit_Length__c?.toString() || "",
        widthIn: productToEdit?.Unit_Width__c?.toString() || "",
        heightIn: productToEdit?.Unit_Height__c?.toString() || "",
        netWeightLbs: productToEdit?.Unit_Net_Weight__c?.toString() || "",
        grossWeightLbs: productToEdit?.Unit_Gross_Weight__c?.toString() || "",
        caseCubicVolumeIn: productToEdit?.Case_CV_Inches__c?.toString() || "",
        caseLengthIn: productToEdit?.Case_Length__c?.toString() || "",
        caseWidthIn: productToEdit?.Case_Width__c?.toString() || "",
        caseHeightIn: productToEdit?.Case_Height__c?.toString() || "",
        caseNetWeightLbs: productToEdit?.Case_Net_Weight__c?.toString() || "",
        caseGrossWeightLbs: productToEdit?.Case_Gross_Weight__c?.toString() || "",
        shippingWeightDW139: productToEdit?.Case_DW_139__c?.toString() || "",
        shippingWeightDW166: productToEdit?.Case_DW_166__c?.toString() || "",
        eccn: productToEdit?.ECCN__c || "",
        htsCode: productToEdit?.HTS_Code__c || "",
        gtin: productToEdit?.GTIN__c || "",
        upc: productToEdit?.UPC__c || "",
        voltageRating: productToEdit?.Voltage_Rating__c || "",
        plugType: productToEdit?.Plug_Type__c || "",
        cordLength: productToEdit?.Cord_Length__c || "",
        productAvailabilityESG: productToEdit?.product_Availability__c || "",
        energyConsumption: productToEdit?.Energy_Consumption__c?.toString() || "",
        endOfLifeManagement: productToEdit?.End_of_Life_Management__c || "",
        manufacturingProcess: productToEdit?.Manufacturing_Process__c || "",
        packagingMaterials: productToEdit?.Packaging_Materials__c || "",
        productLongevity: productToEdit?.product_Longevity__c || "",
        productUseEmissions: productToEdit?.product_Use_Emissions__c || "",
        waterUsage: productToEdit?.Water_Usage__c || "",
      });
    }
  }, [productToEdit]);

  useEffect(() => {
    const fetchPicklists = async () => {
      if (selectedAccount?.Id && user?.Id) {
        try {
          const res = await fetch(`/api/salesforce/picklists?accountId=${selectedAccount.Id}&contactId=${user.Id}`);
          const data = await res.json();
          if (data.success && data.data?.[0]) {
            setPicklists(data.data[0]);
          }
        } catch (err) {
          console.error("Error fetching picklists:", err);
        }
      }
    };
    fetchPicklists();
  }, [selectedAccount, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev: any) => {
      const updatedValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      const newData = {
        ...prev,
        [name]: updatedValue,
      };

      if (name === "availableToSell") {
        const numValue = Number(updatedValue);
        if (!isNaN(numValue) && numValue > 0) {
          newData.availabilityStatus = "In Stock";
        } else {
          newData.availabilityStatus = "Out of Stock";
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (status: string = "Draft") => {
    try {
      setIsSubmitting(true);
      const accountId = selectedAccount?.Id || selectedAccount?.id;
      const contactId = user?.Id || user?.contact?.Id;

      const productData: any = {
        Id: productToEdit?.Id,
        Name: formData.name,
        StockKeepingUnit: formData.sku,
        Family: formData.family || "",
        Product_Family__c: formData.productFamilyNo || "",
        Product_Availability__c: status,
        Lead_Time_Wks__c: Number(formData.leadTimeWks) || 0,
        MOQ__c: Number(formData.moq) || 0,
        Manufacturer_Name__c: accountId,
        Description: formData.description,
        Key_Features__c: formData.keyFeatures,
        Unit_Length__c: Number(formData.lengthIn) || 0,
        Unit_Width__c: Number(formData.widthIn) || 0,
        Unit_Height__c: Number(formData.heightIn) || 0,
        Unit_Net_Weight__c: Number(formData.netWeightLbs) || 0,
        Unit_Gross_Weight__c: Number(formData.grossWeightLbs) || 0,
        Case_Length__c: Number(formData.caseLengthIn) || 0,
        Case_Width__c: Number(formData.caseWidthIn) || 0,
        Case_Height__c: Number(formData.caseHeightIn) || 0,
        Case_Net_Weight__c: Number(formData.caseNetWeightLbs) || 0,
        Case_Gross_Weight__c: Number(formData.caseGrossWeightLbs) || 0,
        ECCN__c: formData.eccn,
        HTS_Code__c: formData.htsCode,
        GTIN__c: formData.gtin,
        UPC__c: formData.upc,
        Energy_Consumption__c: Number(formData.energyConsumption) || 0,
        End_of_Life_Management__c: formData.endOfLifeManagement || "",
        Manufacturing_Process__c: formData.manufacturingProcess || "",
        Packaging_Materials__c: formData.packagingMaterials || "",
        Water_Usage__c: Number(formData.waterUsage) || 0,
        UnitPrice: Number(formData.listPrice) || 0,
      };

      // Remove empty/null/undefined fields
      Object.keys(productData).forEach(key => {
        if (productData[key] === "" || productData[key] === null || productData[key] === undefined) {
          delete productData[key];
        }
      });

      const response = await fetch("/api/salesforce/product-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: [productData],
          accountId,
          contactId,
          tabName: "product",
        }),
      });

      const result = await response.json();
      if (result.success) {
        success(`Product updated to ${status} successfully!`);
        onClose();
        setTimeout(() => window.location.reload(), 5000);
      } else {
        throw new Error(result.message || "Failed to update product");
      }
    } catch (err: any) {
      console.error("Error updating product:", err);
      error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label: string, name: string, type: string = "text", options?: string[], required: boolean = false, isReadOnly: boolean = false) => {
    if (type === "select") {
      return (
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {required && <span className="text-red-500 mr-1">*</span>}
            {label}
          </label>
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            disabled={isReadOnly}
            className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">--Select--</option>
            {options?.map((opt: any, idx: number) => {
              const label = typeof opt === 'object' ? (opt.label || opt.value) : opt;
              const value = typeof opt === 'object' ? opt.value : opt;
              return <option key={`${value}-${idx}`} value={value}>{label}</option>;
            })}
          </select>
        </div>
      );
    }
    if (type === "textarea") {
      return (
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</label>
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1 w-full relative">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          readOnly={isReadOnly}
          className={`w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''}`}
        />
      </div>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-md text-sm font-bold text-blue-700 dark:text-blue-300 my-4 first:mt-0">
      {title}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col mb-12">
      <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={["Overview", "Specifications & Dims", "Datasheets", "Authorized Suppliers", "Compliance & Certs"]} />
      <div className="p-8">
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div>
              <SectionHeader title="Product Header" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                {renderField("Product Name", "name", "text", [], true)}
                {renderField("SKU", "sku", "text", [], true, false)}
                {renderField("Product Code", "productCode", "text", [], false, true)}
                {renderField("Product Family", "family", "select", picklists?.Family || picklists?.Product_Family__c)}
                {renderField("Availability Status", "availabilityStatus", "text", [], false, true)}
                {renderField("Available to Sell", "availableToSell", "text", [], false, true)}
              </div>
            </div>
            <div>
              <SectionHeader title="Pricing & Logic" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
                {renderField("List Price", "listPrice", "text", [], false, true)}
                {renderField("Lead Time (Weeks)", "leadTimeWks")}
                {renderField("MOQ", "moq")}
              </div>
            </div>
            <div>
              <SectionHeader title="Product Overview" />
              <div className="grid grid-cols-1 gap-6 px-2">
                {renderField("Description", "description", "textarea")}
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Key Features</label>
                  <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-600">
                    <ReactQuill
                      theme="snow"
                      value={formData.keyFeatures}
                      onChange={(content) => setFormData((prev: any) => ({ ...prev, keyFeatures: content }))}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, false] }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      placeholder="Add key features here..."
                    />
                  </div>
                </div>
              </div>
              <style jsx global>{`
                    .ql-container {
                      min-height: 150px;
                      font-size: 0.9rem;
                    }
                    .ql-editor {
                       min-height: 150px;
                    }
                    .dark .ql-toolbar {
                      background-color: #1f2937;
                      border-color: #374151;
                    }
                    .dark .ql-container {
                      border-color: #374151;
                      background-color: #111827;
                    }
                    .dark .ql-editor {
                      color: #f3f4f6;
                    }
                    .dark .ql-stroke {
                      stroke: #9ca3af !important;
                    }
                    .dark .ql-fill {
                      fill: #9ca3af !important;
                    }
                    .dark .ql-picker {
                      color: #9ca3af !important;
                    }
                    .dark .ql-picker-options {
                      background-color: #1f2937 !important;
                      color: #f3f4f6 !important;
                    }
                  `}</style>
            </div>
          </div>
        )}
        {activeTab === "Specifications & Dims" && (
          <div className="space-y-6">
            <div>
              <SectionHeader title="Physical Dimensions (Unit)" />
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2">
                {renderField("Length (in)", "lengthIn")}
                {renderField("Width (in)", "widthIn")}
                {renderField("Height (in)", "heightIn")}
                {renderField("Cubic Volume (in)", "cubicVolumeIn")}
                {renderField("Net Weight (lbs)", "netWeightLbs")}
                {renderField("Gross Weight (lbs)", "grossWeightLbs")}
              </div>
            </div>
            <div>
              <SectionHeader title="Physical Dimensions (Case)" />
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2">
                {renderField("Case Length (in)", "caseLengthIn")}
                {renderField("Case Width (in)", "caseWidthIn")}
                {renderField("Case Height (in)", "caseHeightIn")}
                {renderField("Case Net Weight (lbs)", "caseNetWeightLbs")}
                {renderField("Case Gross Weight (lbs)", "caseGrossWeightLbs")}
              </div>
            </div>
            <div>
              <SectionHeader title="Compliance & Trade" />
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2">
                {renderField("ECCN", "eccn")}
                {renderField("HTS Code", "htsCode")}
                {renderField("GTIN", "gtin")}
                {renderField("UPC", "upc")}
              </div>
            </div>
            <div>
              <SectionHeader title="ESG & Sustainability" />
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-2">
                {renderField("Energy Consumption", "energyConsumption")}
                {renderField("End of Life Management", "endOfLifeManagement", "select", picklists?.End_of_Life_Management__c)}
                {renderField("Manufacturing Process", "manufacturingProcess", "select", picklists?.Manufacturing_Process__c)}
                {renderField("Packaging Materials", "packagingMaterials", "select", picklists?.Packaging_Materials__c)}
                {renderField("Water Usage", "waterUsage")}
              </div>
            </div>
          </div>
        )}
        {activeTab === "Datasheets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-md">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300">Datasheets</h3>
              <button
                onClick={() => { setSelectedDatasheet(null); setIsDatasheetModalOpen(true); }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-2"
              >
                + Add Datasheet
              </button>
            </div>
            {datasheetsLoading ? (
              <div className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : datasheets.length === 0 ? (
              <div className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500 mb-4">No datasheets have been added to this product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {datasheets.map((ds: any) => (
                  <div key={ds.Id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm relative">
                    <button
                      onClick={() => { setSelectedDatasheet(ds); setIsDatasheetModalOpen(true); }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"
                      title="Edit Datasheet"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{ds.MPN__c || 'N/A'}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                      <p><span className="font-semibold">Version:</span> {ds.Version__c || 'N/A'}</p>
                      <p><span className="font-semibold">LTB Date:</span> {ds.LTB_Date__c ? new Date(ds.LTB_Date__c).toISOString().split('T')[0] : 'N/A'}</p>
                      <p><span className="font-semibold">EOL Date:</span> {ds.EOL_Date__c ? new Date(ds.EOL_Date__c).toISOString().split('T')[0] : 'N/A'}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {ds.isOBS__c && <span className="px-2 py-0.5 text-xs font-bold tracking-wide uppercase bg-red-100 text-red-700 rounded-full">Obsolete</span>}
                      {ds.isEOL__c && <span className="px-2 py-0.5 text-xs font-bold tracking-wide uppercase bg-orange-100 text-orange-700 rounded-full">EOL</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "Authorized Suppliers" && (
          <div className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">No Authorized Suppliers have been added to this product</p>
          </div>
        )}
        {activeTab === "Compliance & Certs" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-md">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300">Compliance & Certifications</h3>
              <button
                onClick={() => { setSelectedCert(null); setIsCertModalOpen(true); }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-2"
              >
                + Add Certification
              </button>
            </div>
            {certsLoading ? (
              <div className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : certifications.length === 0 ? (
              <div className="py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500 mb-4">No certifications have been added to this product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert: any) => (
                  <div key={cert.Id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm relative">
                    <button
                      onClick={() => { setSelectedCert(cert); setIsCertModalOpen(true); }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"
                      title="Edit Certification"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm pr-6">{cert.Name || 'N/A'}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                      <p><span className="font-semibold">Status:</span> {cert.Certification_Status__c || 'N/A'}</p>
                      <p><span className="font-semibold">Issue Date:</span> {cert.Issue_Date__c ? new Date(cert.Issue_Date__c).toISOString().split('T')[0] : 'N/A'}</p>
                      <p><span className="font-semibold">Expiry Date:</span> {cert.Expiry_Date__c ? new Date(cert.Expiry_Date__c).toISOString().split('T')[0] : 'N/A'}</p>
                    </div>
                    {cert.Certification_Status__c && (
                      <div className="mt-3">
                        <StatusBadge status={cert.Certification_Status__c} variant="compact" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-6 rounded-b-xl border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center gap-3">
        <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50">Cancel</button>
        <button
          onClick={() => handleSubmit("Draft")}
          disabled={isSubmitting}
          className="px-8 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Update Details"}
        </button>
        <button
          onClick={() => handleSubmit("Submitted")}
          disabled={isSubmitting}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
          {isSubmitting ? "Submitting..." : "Submitted"}
        </button>
      </div>

      {isDatasheetModalOpen && (
        <DatasheetModal
          productId={productToEdit?.Id}
          datasheetToEdit={selectedDatasheet}
          onClose={() => { setIsDatasheetModalOpen(false); setSelectedDatasheet(null); }}
          onSuccess={() => {
            setIsDatasheetModalOpen(false);
            setSelectedDatasheet(null);
            success("Datasheet saved successfully!");
            setTimeout(() => window.location.reload(), 5000);
          }}
        />
      )}
      {isCertModalOpen && (
        <CertificationModal
          productId={productToEdit?.Id}
          certificationToEdit={selectedCert}
          picklists={picklists}
          onClose={() => { setIsCertModalOpen(false); setSelectedCert(null); }}
          onSuccess={() => {
            setIsCertModalOpen(false);
            setSelectedCert(null);
            success("Certification saved successfully!");
            setTimeout(() => window.location.reload(), 5000);
          }}
        />
      )}
    </div>
  );
}