import React from 'react';
import { formatCurrency } from "@/lib/utils/formatting";

interface AuthorizedSuppliersTabProps {
  suppliers: any[];
  isLoading?: boolean;
}

export const AuthorizedSuppliersTab: React.FC<AuthorizedSuppliersTabProps> = ({ suppliers, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 ">Approved Supplier Network</h3>

      </div>

      {/* Important Note Alert */}


      <div className="overflow-x-auto">
        {!suppliers || suppliers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No authorized suppliers found for this product.</div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-[10px] font-bold text-gray-400 ">
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Supplier</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Default</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Onboarded</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
              {suppliers.map((sup: any, idx: number) => (
                <tr key={sup.Id || idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">{sup.Supplier_Name || sup.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{sup.Supplier_DBA__c}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${sup.Relationship_Status__c === 'Strategic' ? 'bg-green-50 text-green-600' :
                      sup.Relationship_Status__c === 'Key' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                      {sup.Relationship_Status__c}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                    {sup.Default_Supplier__c ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yes
                      </span>
                    ) : 'No'}
                  </td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.Onboarded_Date__c}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300 font-mono text-[10px]">{sup.Name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
