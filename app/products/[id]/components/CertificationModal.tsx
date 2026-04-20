"use client";

import { useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";

const CERTIFICATION_STATUS_OPTIONS = ["Valid", "Expired", "Pending", "Revoked"];

interface CertificationModalProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
  certificationToEdit?: any;
}

export default function CertificationModal({ productId, onClose, onSuccess, certificationToEdit }: CertificationModalProps) {
  const { user, selectedAccount } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    Name: certificationToEdit?.Name || "",
    Certification_Status__c: certificationToEdit?.Certification_Status__c || "",
    Issue_Date__c: certificationToEdit?.Issue_Date__c ? new Date(certificationToEdit.Issue_Date__c).toISOString().split('T')[0] : "",
    Expiry_Date__c: certificationToEdit?.Expiry_Date__c ? new Date(certificationToEdit.Expiry_Date__c).toISOString().split('T')[0] : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.Name) {
      alert("Certification Name is required");
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
        tabName: "certifications",
        certifications: [
          {
            ...(certificationToEdit?.Id ? { Id: certificationToEdit.Id } : {}),
            Name: formData.Name,
            Certification_Status__c: formData.Certification_Status__c,
            Issue_Date__c: formData.Issue_Date__c || null,
            Expiry_Date__c: formData.Expiry_Date__c || null,
          }
        ]
      };

      const method = certificationToEdit ? "PATCH" : "POST";

      const response = await fetch("/api/salesforce/product-details", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
      } else {
        throw new Error(result.message || "Failed to save certification");
      }
    } catch (err: any) {
      console.error("Error saving certification:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {certificationToEdit ? "Edit Certification" : "Add New Certification"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Certification Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="e.g. Certifications 01"
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Certification Status */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Certification Status</label>
            <select
              name="Certification_Status__c"
              value={formData.Certification_Status__c}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select Status --</option>
              {CERTIFICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Issue Date</label>
              <input
                type="date"
                name="Issue_Date__c"
                value={formData.Issue_Date__c}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Expiry Date</label>
              <input
                type="date"
                name="Expiry_Date__c"
                value={formData.Expiry_Date__c}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
            {isSubmitting ? "Saving..." : "Save Certification"}
          </button>
        </div>
      </div>
    </div>
  );
}
