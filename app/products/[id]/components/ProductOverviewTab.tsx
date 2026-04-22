import React from 'react';

interface ProductOverviewTabProps {
  product: any;
}

export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Description & Features */}
      <div className="lg:col-span-8 min-w-0">
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-400 mb-4 ">Product Description</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm whitespace-pre-wrap">
            {product.description}
          </p>
          {product.subDescription && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
              {product.subDescription}
            </p>
          )}
        </div>

        {product.features && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-4">Key Features</h3>
            <div className="space-y-2">
              {product.features.filter((f: string) => f && f.trim() !== "").length > 0 ? (
                product.features.filter((f: string) => f && f.trim() !== "").map((feature: string, idx: number) => (
                  <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feature}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No key features listed.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Quick Specifications */}
      <div className="lg:col-span-4 min-w-0">
        <h3 className="text-xs font-bold text-gray-400 mb-4 ">Quick Specifications</h3>
        <div className="bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          {product.quickSpecs.map((spec: any, idx: number) => (
            <div
              key={idx}
              className={`flex justify-between items-center px-4 py-3 text-sm transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${idx !== product.quickSpecs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
            >
              <span className="text-gray-500 dark:text-gray-400 font-medium mr-4">{spec.label}</span>
              <span className="text-gray-900 dark:text-white font-bold text-right break-words">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
