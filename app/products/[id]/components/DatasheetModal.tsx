"use client";

import { useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";

interface DatasheetModalProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
  datasheetToEdit?: any;
}

export default function DatasheetModal({ isOpen, productId, onClose, onSuccess, datasheetToEdit }: DatasheetModalProps) {
  const { user, selectedAccount } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: toastError, warning } = useToast();

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
      warning("MPN is required");
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
      toastError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={datasheetToEdit ? "Edit Datasheet" : "Add New Datasheet"}
      size="sm"
      footer={
        <>
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2">
            {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
            {isSubmitting ? "Saving..." : "Save Datasheet"}
          </button>
        </>
      }
    >
        <div className="space-y-4">
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
    </Modal>
  );
}
