import React from 'react';
import { formatCurrency } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface AuthorizedSuppliersTabProps {
  suppliers: any[];
  isLoading?: boolean;
}

export const AuthorizedSuppliersTab: React.FC<AuthorizedSuppliersTabProps> = ({ suppliers, isLoading }) => {
  if (isLoading) {
    return <TableLoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-400 ">Approved Supplier Network</h3>

      </div>

      {/* Important Note Alert */}


      <div className="rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {!suppliers || suppliers.length === 0 ? (
          <TableEmptyState message="No authorized suppliers found for this product." />
        ) : (
          <Table className="text-left border-separate border-spacing-0">
            <THead>
              <tr>
                <Th>Supplier</Th>
                <Th>Status</Th>
                <Th>Default</Th>
                <Th className="whitespace-nowrap">Onboarded</Th>
                <Th>ID</Th>
              </tr>
            </THead>
            <TBody>
              {suppliers.map((sup: any, idx: number) => (
                <Tr key={sup.Id || idx}>
                  <Td>
                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">{sup.Supplier_Name || sup.name}</div>
                    <div className="text-xs text-gray-400 uppercase">{sup.Supplier_DBA__c}</div>
                  </Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded-md font-bold ${sup.Relationship_Status__c === 'Strategic' ? 'bg-green-50 text-green-600' :
                      sup.Relationship_Status__c === 'Key' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                      {sup.Relationship_Status__c}
                    </span>
                  </Td>
                  <Td>
                    {sup.Default_Supplier__c ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yes
                      </span>
                    ) : 'No'}
                  </Td>
                  <Td>{sup.Onboarded_Date__c}</Td>
                  <Td className="font-mono text-xs">{sup.Name}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
      </div>
    </div>
  );
};
