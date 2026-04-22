import React from 'react';
import Link from 'next/link';

interface DetailInputProps {
    label: string;
    value: any;
    href?: string;
    className?: string;
}

export default function DetailInput({ label, value, href, className = "" }: DetailInputProps) {
    const isLink = !!href;
    const commonClasses = "w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-0 transition-all shadow-sm active:scale-[0.98]";

    return (
        <div className={className}>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate whitespace-nowrap" title={label}>
                {label}
            </label>

            <input
                type="text"
                readOnly
                value={value || ''}
                className={`${commonClasses} bg-gray-50 dark:bg-gray-700`}
                title={String(value ?? '')}
            />

        </div>
    );
}
