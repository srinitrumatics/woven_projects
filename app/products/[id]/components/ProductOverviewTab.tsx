import React from 'react';

interface ProductOverviewTabProps {
  product: any;
}

export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Description & Features */}
      <div className="lg:col-span-8">
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 mb-4 ">Product Description</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
            {product.description}
          </p>
          {product.subDescription && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              {product.subDescription}
            </p>
          )}
        </div>

        {product.features.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-4">Key Features</h3>
            <ul className="space-y-3">
              {product.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-snug">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right Column: Quick Specifications */}
      <div className="lg:col-span-4">
        <h3 className="text-xs font-bold text-gray-400 mb-4 ">Quick Specifications</h3>
        <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {product.quickSpecs.map((spec: any, idx: number) => (
            <div
              key={idx}
              className={`flex justify-between items-center px-4 py-3 text-sm ${idx !== product.quickSpecs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
            >
              <span className="text-gray-500 dark:text-gray-400 font-medium">{spec.label}</span>
              <span className="text-gray-900 dark:text-white font-bold text-right">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
