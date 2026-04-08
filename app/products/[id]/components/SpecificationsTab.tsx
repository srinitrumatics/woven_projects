import React from 'react';

interface SpecificationsTabProps {
  specifications: Record<string, any[]>;
}

export const SpecificationsTab: React.FC<SpecificationsTabProps> = ({ specifications }) => {
  return (
    <div className="space-y-10">
      {Object.entries(specifications).map(([section, specs], groupIdx) => (
        <div key={groupIdx}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{section}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {specs.map((spec: any, idx: number) => (
              <div key={idx} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500 dark:text-gray-400">{spec.label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
