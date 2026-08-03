import React from 'react';
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ComplianceCertsTabProps {
  certifications: any[];
  isLoading: boolean;
}

export const ComplianceCertsTab: React.FC<ComplianceCertsTabProps> = ({ certifications, isLoading }) => {
  return (
    <div className="space-y-8">
      <h3 className="text-xs font-bold text-gray-400 mb-8  px-2">Certifications & Standards</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading certifications...</p>
          </div>
        ) : certifications.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No certifications found for this product.</div>
        ) : (
          certifications.map((cert: any, idx: number) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group cursor-default"
            >
              {/* Centered Icon Circle */}
              <div className="w-14 h-14 bg-[#F2FAF9] dark:bg-teal-900/10 rounded-full flex items-center justify-center mb-5">
                <span className="text-xl text-[#111827]">
                  {cert.Name.toUpperCase().includes("UL") ? "●" :
                    cert.Name.toUpperCase().includes("ENERGY") ? "★" :
                      cert.Name.toUpperCase().includes("CE") ? "⊥" :
                        cert.Name.toUpperCase().includes("ROHS") ? "◆" :
                          cert.Name.toUpperCase().includes("NSF") ? "◁" :
                            cert.Name.toUpperCase().includes("ISO") ? "✒" :
                              cert.Name.toUpperCase().includes("REACH") ? "♡" :
                                cert.Name.toUpperCase().includes("FCC") ? "■" : ""}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-black text-[#111827] dark:text-white mb-1  tracking-tight leading-tight">
                {cert.Name}
              </h4>

              {/* Organizer/Issuer */}
              <p className="text-xs font-bold text-[#6B7280] dark:text-gray-400 mb-1 leading-tight">
                {cert.Issuer_Name}
              </p>

              {/* Dates */}
              <div className="mb-6">
                <p className="text-xs font-bold text-[#9CA3AF] dark:text-gray-500">
                  {cert.Expiry_Date__c ? `Expires: ${new Date(cert.Expiry_Date__c).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` :
                    `Issued: ${new Date(cert.Issue_Date__c).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                </p>
              </div>

              {/* Status Badge at bottom */}
              <div className="mt-auto">
                <StatusBadge status={cert.Certification_Status__c} variant="compact" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
