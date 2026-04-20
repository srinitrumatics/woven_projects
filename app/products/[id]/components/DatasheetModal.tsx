"use client";

import { useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";

interface DatasheetModalProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
  datasheetToEdit?: any;
}

export default function DatasheetModal({ productId, onClose, onSuccess, datasheetToEdit }: DatasheetModalProps) {
  const { user, selectedAccount } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    MPN__c: datasheetToEdit?.MPN__c || "",
    Version__c: datasheetToEdit?.Version__c || "",
    LTB_Date__c: datasheetToEdit?.LTB_Date__c ? new Date(datasheetToEdit.LTB_Date__c).toISOString().split('T')[0] : "",
    EOL_Date__c: datasheetToEdit?.EOL_Date__c ? new Date(datasheetToEdit.EOL_Date__c).toISOString().split('T')[0] : "",
    isOBS__c: datasheetToEdit?.isOBS__c || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.MPN__c) {
      alert("MPN is required");
      return;
    }
    try {
      setIsSubmitting(true);
      const accountId = selectedAccount?.Id || selectedAccount?.id;
      const contactId = user?.Id || user?.contact?.Id;

      const payload = {
        accountId,
        contactId,
        productId,
        tabName: "datasheets",
        datasheets: [
          {
            ...(datasheetToEdit?.Id ? { Id: datasheetToEdit.Id } : {}),
            MPN__c: formData.MPN__c,
            Version__c: formData.Version__c,
            LTB_Date__c: formData.LTB_Date__c || null,
            EOL_Date__c: formData.EOL_Date__c || null,
            isOBS__c: formData.isOBS__c,
          }
        ]
      };

      const response = await fetch("/api/salesforce/product-details", {
        method: datasheetToEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success || result?.message === "Product Datasheets are created successfully") {
        onSuccess();
      } else {
        throw new Error(result.message || "Failed to save datasheet");
      }
    } catch (err: any) {
      console.error("Error saving datasheet:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {datasheetToEdit ? "Edit Datasheet" : "Add New Datasheet"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">MPN <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="MPN__c"
              value={formData.MPN__c}
              onChange={handleChange}
              placeholder="e.g. Test MPN"
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Version</label>
            <input
              type="text"
              name="Version__c"
              value={formData.Version__c}
              onChange={handleChange}
              placeholder="e.g. Test Version"
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">LTB Date</label>
              <input
                type="date"
                name="LTB_Date__c"
                value={formData.LTB_Date__c}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">EOL Date</label>
              <input
                type="date"
                name="EOL_Date__c"
                value={formData.EOL_Date__c}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 w-full">
            <input
              type="checkbox"
              id="isOBS__c"
              name="isOBS__c"
              checked={formData.isOBS__c}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isOBS__c" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Is Obsolete (OBS)
            </label>
          </div>
        </div>

        <div className="px-6 py-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2">
            {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
            {isSubmitting ? "Saving..." : "Save Datasheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
