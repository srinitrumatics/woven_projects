import React from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DatasheetsTabProps {
  datasheets: any[];
  isLoading: boolean;
}

export const DatasheetsTab: React.FC<DatasheetsTabProps> = ({ datasheets, isLoading }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-gray-400 mb-6 px-2">Available Documents</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full">
            <LoadingSpinner size="sm" text="Loading datasheets..." />
          </div>
        ) : datasheets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No datasheets available for this product.</div>
        ) : (
          datasheets.map((doc: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow group cursor-pointer">
              {/* Type Icon Square */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${doc.Name.includes('Manual') ? 'bg-blue-50 text-blue-600' :
                doc.Name.includes('BOM') ? 'bg-green-50 text-green-600' :
                  doc.Name.includes('3D') ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                }`}>
                {doc.Name.includes('Drawing') ? 'DWG' :
                  doc.Name.includes('BOM') ? 'XLSX' :
                    doc.Name.includes('3D') ? 'STEP' : 'PDF'}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white  mb-1" title={doc.Name}>
                  {doc.Name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-400 font-medium">
                  <span className="truncate">{doc.Manufacturer_Name || 'Manufacturer'}</span>
                  <span>•</span>
                  <span>Rev {doc.Version__c || '1.0'}</span>
                  {doc.isEOL__c && (
                    <>
                      <span>•</span>
                      <span className="text-red-500 font-bold  text-xs">EOL</span>
                    </>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <div className="w-8 h-8 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-primary transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
