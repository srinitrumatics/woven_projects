import React from 'react';
import { formatCurrency } from "@/lib/utils/formatting";

interface AuthorizedSuppliersTabProps {
  suppliers: any[];
}

export const AuthorizedSuppliersTab: React.FC<AuthorizedSuppliersTabProps> = ({ suppliers }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 ">Approved Supplier Network</h3>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
          + Request Supplier Approval
        </button>
      </div>

      {/* Important Note Alert */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-3">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-yellow-800 font-medium leading-relaxed">
          Procurement must use Tier 1 suppliers for orders above $250,000. Tier 2 requires VP approval. Tier 3 requires exception process via Supply Chain.
        </p>
      </div>

      <div className="overflow-x-auto">
        {suppliers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No authorized suppliers found for this product.</div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-[10px] font-bold text-gray-400 ">
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Supplier</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Tier</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Unit Price</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">MOQ</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Lead Time</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Region</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">Last Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
              {suppliers.map((sup: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">{sup.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{sup.code} • {sup.type}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">Tier {sup.tier}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`flex items-center gap-1.5 font-bold ${sup.status === 'Preferred' ? 'text-green-600' :
                      sup.status === 'Approved' ? 'text-green-600' :
                        sup.status === 'Conditional' ? 'text-orange-500' :
                          'text-red-500'
                      }`}>
                      {sup.status === 'Preferred' && <span>✓</span>}
                      {sup.status === 'Approved' && <span>✓</span>}
                      {sup.status === 'Conditional' && <span>▲</span>}
                      {sup.status === 'Exception Only' && <span>⚠</span>}
                      {sup.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(sup.price)}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.moq}</td>
                  <td className="px-4 py-4 flex items-center gap-2">
                    <div className={`w-8 h-1 rounded-full ${sup.leadTime.includes('14') ? 'bg-blue-600' :
                      sup.leadTime.includes('21') ? 'bg-blue-400' :
                        sup.leadTime.includes('28') ? 'bg-blue-300' :
                          sup.leadTime.includes('38') ? 'bg-orange-400' :
                            'bg-red-500'
                      }`}></div>
                    <span className="text-gray-700 dark:text-gray-300">{sup.leadTime}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.region}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{sup.audit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
