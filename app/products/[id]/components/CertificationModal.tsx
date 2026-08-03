"use client";

import { useState } from "react";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";

const CERTIFICATION_STATUS_OPTIONS = ["Valid", "Expired", "Pending", "Revoked"];

interface CertificationModalProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
  certificationToEdit?: any;
  picklists?: any;
}

export default function CertificationModal({ isOpen, productId, onClose, onSuccess, certificationToEdit, picklists }: CertificationModalProps) {
  const { user, selectedAccount } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: toastError, warning } = useToast();

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
      warning("Certification Name is required");
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
      toastError(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={certificationToEdit ? "Edit Certification" : "Add New Certification"}
      size="sm"
      footer={
        <>
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
        </>
      }
    >
      <div className="space-y-4">
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
              {(picklists?.Certification_Status__c || CERTIFICATION_STATUS_OPTIONS).map((opt: any, idx: number) => {
                const label = typeof opt === 'object' ? (opt.label || opt.value) : opt;
                const value = typeof opt === 'object' ? opt.value : opt;
                return <option key={`${value}-${idx}`} value={value}>{label}</option>;
              })}
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
    </Modal>
  );
}
