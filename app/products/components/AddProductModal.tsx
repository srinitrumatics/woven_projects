"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: any;
  inlineMode?: boolean;
}

export default function AddProductModal({ isOpen, onClose, productToEdit, inlineMode }: AddProductModalProps) {
  const { user, selectedAccount } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picklists, setPicklists] = useState<any>(null);
  const isEditingMode = !!productToEdit;

  const [formData, setFormData] = useState<any>({
    // Product Header
    name: productToEdit?.Name || "",
    sku: productToEdit?.StockKeepingUnit || "",
    productCode: productToEdit?.ProductCode || "",
    family: productToEdit?.Family || "",
    availabilityStatus: productToEdit?.Availability_Status__c || "Out of Stock",
    availableToSell: productToEdit?.Available_To_Sell__c?.toString() || "0",

    // Pricing
    unitPrice: productToEdit?.Unit_Price__c?.toString() || "",
    listPrice: productToEdit?.List_Price__c?.toString() || "",

    // Metadata
    leadTimeWks: productToEdit?.Lead_Time_Wks__c?.toString() || "",
    moq: productToEdit?.MOQ__c?.toString() || "",
    manufacturer: productToEdit?.Manufacturer_Name || "",
    uom: productToEdit?.UOM__c || "",

    // Overview
    description: productToEdit?.Description || "",

    // Quick Specifications (Unit)
    cubicVolumeIn: productToEdit?.Unit_CV_Inches__c?.toString() || "",
    lengthIn: productToEdit?.Unit_Length__c?.toString() || "",
    widthIn: productToEdit?.Unit_Width__c?.toString() || "",
    heightIn: productToEdit?.Unit_Height__c?.toString() || "",
    netWeightLbs: productToEdit?.Unit_Net_Weight__c?.toString() || "",
    grossWeightLbs: productToEdit?.Unit_Gross_Weight__c?.toString() || "",

    // Quick Specifications (Case & Compliance)
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

    // Electrical
    voltageRating: productToEdit?.Voltage_Rating__c || "",
    plugType: productToEdit?.Plug_Type__c || "",
    cordLength: productToEdit?.Cord_Length__c || "",

    // ESG
    productAvailabilityESG: productToEdit?.product_Availability__c || "",
    energyConsumption: productToEdit?.Energy_Consumption__c?.toString() || "",
    endOfLifeManagement: productToEdit?.End_of_Life_Management__c || "",
    manufacturingProcess: productToEdit?.Manufacturing_Process__c || "",
    packagingMaterials: productToEdit?.Packaging_Materials__c || "",
    productLongevity: productToEdit?.product_Longevity__c?.toString() || "",
    productUseEmissions: productToEdit?.product_Use_Emissions__c?.toString() || "",
    waterUsage: productToEdit?.Water_Usage__c?.toString() || "",
  });
    // Product Header


    // Metadata


  useEffect(() => {
    const fetchPicklists = async () => {
      if (isOpen && selectedAccount?.Id && user?.Id) {
        try {
          const res = await fetch(`/api/salesforce/picklists?accountId=${selectedAccount.Id}&contactId=${user.Id}`);
          const data = await res.json();
          if (data.success && data.data?.[0]) {
            setPicklists(data.data[0]);
          }
        } catch (error) {
          console.error("Failed to load picklists:", error);
        }
      }
    };
    fetchPicklists();
  }, [isOpen, selectedAccount?.Id, user?.Id]);

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

  const handleSubmit = async () => {
    if (!selectedAccount || !user) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      setIsSubmitting(true);
      const accountId = selectedAccount.Id || selectedAccount.id;
      const contactId = user.Id || user.contact?.Id;

      const productData: any = {
        ...(productToEdit?.Id ? { Id: productToEdit.Id } : {}),
        Name: formData.name,
        StockKeepingUnit: formData.sku,
        ProductCode: formData.productCode,
        Family: formData.family || "",
        Product_Availability__c: "Draft", // Always Draft as per requirements
        Availability_Status__c: formData.availabilityStatus,
        Available_To_Sell__c: Number(formData.availableToSell) || 0,
        Lead_Time_Wks__c: Number(formData.leadTimeWks) || 0,
        MOQ__c: Number(formData.moq) || 0,
        Manufacturer_Name__c: accountId, // Required to be Logged-In Account Id
        Description: formData.description,
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
        Voltage_Rating__c: formData.voltageRating,
        Plug_Type__c: formData.plugType,
        Cord_Length__c: formData.cordLength,
        Energy_Consumption__c: Number(formData.energyConsumption) || 0,
        End_of_Life_Management__c: formData.endOfLifeManagement || "",
        Manufacturing_Process__c: formData.manufacturingProcess || "",
        Packaging_Materials__c: formData.packagingMaterials || "",
        Product_Longevity__c: Number(formData.productLongevity) || 0,
        Product_Use_Emissions__c: Number(formData.productUseEmissions) || 0,
        Water_Usage__c: Number(formData.waterUsage) || 0,
        UOM__c: !formData.uom ? "" : formData.uom,
        UnitPrice: Number(formData.listPrice) || 0 // Maps to List Price in Salesforce
      };

      // Clean up empty fields to prevent Salesforce validation errors on picklists
      Object.keys(productData).forEach(key => {
        if (productData[key] === "" || productData[key] === null || productData[key] === undefined) {
          delete productData[key];
        }
      });
      console.log('payload for product:', productData);
      const response = await fetch("/api/salesforce/product-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          contactId,
          productData
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(isEditingMode ? "Product updated successfully!" : "Product created successfully!");
        onClose();
        // Refresh product list if needed
        window.location.reload();
      } else {
        throw new Error(result.message || "Failed to create product");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            className={`w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'opacity-70 bg-gray-50 dark:bg-gray-800' : ''}`}
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
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {required && <span className="text-red-500 mr-1">*</span>}
            {label}
          </label>
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            readOnly={isReadOnly}
            rows={3}
            className={`w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
          {(name.toLowerCase().includes('height') || name.toLowerCase().includes('width') || name.toLowerCase().includes('length') || name.toLowerCase().includes('moq') || name.toLowerCase().includes('dw')) && (
            <span className="ml-1 text-blue-500 text-[10px] bg-blue-100 dark:bg-blue-900/30 w-3.5 h-3.5 inline-flex items-center justify-center rounded-full cursor-help">i</span>
          )}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            readOnly={isReadOnly}
            className={`w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''}`}
          />
        </div>
        {isReadOnly && (
          <div className="text-[10px] italic text-gray-400 capitalize">Read only field</div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-md text-sm font-bold text-blue-700 dark:text-blue-300 my-4 first:mt-0">
      {title}
    </div>
  );

  const formContent = (
    <div className={`bg-white dark:bg-gray-800 flex flex-col ${inlineMode ? 'w-full h-full rounded-xl shadow-sm border border-gray-200 dark:border-gray-700' : 'rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700'}`}>

        {/* Header - Hidden in inline mode since page already has header */}
        {!inlineMode && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-700 dark:text-white">{isEditingMode ? "Edit Product" : "Create Product"}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className={`p-6 ${inlineMode ? '' : 'overflow-y-auto scrollbar-thin'}`}>

          <SectionHeader title="Product Header" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Product Name", "name", "text", [], true)}
            {renderField("SKU", "sku", "text", [], true, isEditingMode)}
            {renderField("Product Code", "productCode", "text", [], false, isEditingMode)}
            {renderField("Product Family", "family", "select", picklists?.Family || picklists?.Product_Family__c)}
            {renderField("Availability Status", "availabilityStatus", "text", [], false, true)}
            {renderField("Available to Sell", "availableToSell", "text", [], false, false)}
          </div>

          <SectionHeader title="Pricing" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("List Price", "listPrice")}
          </div>

          <SectionHeader title="Metadata" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Lead Time (Wks)", "leadTimeWks")}
            {renderField("MOQ", "moq")}
            {renderField("UOM", "uom", "select", picklists?.UOM__c || ["Each", "Case", "Pallet"])}
            {renderField("Manufacturer", "manufacturer", "select", ["Happy Tech", "Global Solutions", "AMD", "Intel"], false, true)}
          </div>

          <SectionHeader title="Overview" />
          <div className="grid grid-cols-1 gap-y-4 px-2">
            {renderField("Product Description", "description", "textarea")}
          </div>

          <SectionHeader title="Quick Specifications (Unit)" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Cubic Volume (in)", "cubicVolumeIn")}
            {renderField("Length (in)", "lengthIn")}
            {renderField("Width (in)", "widthIn")}
            {renderField("Height (in)", "heightIn")}
            {renderField("Net Weight (lbs)", "netWeightLbs")}
            {renderField("Gross Weight (lbs)", "grossWeightLbs")}
          </div>

          <SectionHeader title="Quick Specifications (Case & Compliance)" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Case Cubic Volume (in)", "caseCubicVolumeIn", "text", [], false, true)}
            {renderField("Case Length (in)", "caseLengthIn")}
            {renderField("Case Width (in)", "caseWidthIn")}
            {renderField("Case Height (in)", "caseHeightIn")}
            {renderField("Case Net Weight (lbs)", "caseNetWeightLbs")}
            {renderField("Case Gross Weight (lbs)", "caseGrossWeightLbs")}
            {renderField("Shipping Weight DW 139 (lbs)", "shippingWeightDW139", "text", [], false, true)}
            {renderField("Shipping Weight DW 166 (lbs)", "shippingWeightDW166", "text", [], false, true)}
            {renderField("ECCN", "eccn")}
            {renderField("HTS Code", "htsCode")}
            {renderField("GTIN", "gtin")}
            {renderField("UPC", "upc")}
          </div>

          <SectionHeader title="Electrical" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Voltage Rating", "voltageRating")}
            {renderField("Plug Type", "plugType")}
            {renderField("Cord Length", "cordLength")}
          </div>

          <SectionHeader title="ESG" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
            {renderField("Product Availability", "productAvailabilityESG", "text", [], false, true)}
            {renderField("Energy Consumption", "energyConsumption")}
            {renderField("End-of-Life Management", "endOfLifeManagement", "select", picklists?.End_of_Life_Management__c || ["Biodegradable", "Recyclable", "Landfill"])}
            {renderField("Manufacturing Process", "manufacturingProcess", "select", picklists?.Manufacturing_Process__c || ["Additive manufacturing", "Traditional"])}
            {renderField("Packaging Materials", "packagingMaterials", "select", picklists?.Packaging_Materials__c || ["Biodegradable", "Plastic", "Paper"])}
            {renderField("Product Longevity", "productLongevity")}
            {renderField("Product Use Emissions", "productUseEmissions")}
            {renderField("Water Usage", "waterUsage")}
          </div>

        </div>

        {/* Footer */}
        <div className={`${inlineMode ? 'p-6 rounded-b-xl' : 'p-4'} border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center gap-3`}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAccount || !user}
            className="px-10 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Saving..." : (isEditingMode ? "Update" : "Save")}
          </button>
        </div>
    </div>
  );

  return inlineMode ? formContent : (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {formContent}
    </div>
  );
}
