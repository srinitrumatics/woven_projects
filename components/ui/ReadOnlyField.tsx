import Link from "next/link";

interface ReadOnlyFieldProps {
    label: string;
    value: any;
    href?: string;
    className?: string;
    valueClassName?: string;
}

const FIELD_BASE = "w-full h-11 px-3 flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm truncate";

export default function ReadOnlyField({ label, value, href, className = "", valueClassName }: ReadOnlyFieldProps) {
    const displayValue = value ?? "";
    const titleText = String(displayValue);
    const resolvedValueClassName = valueClassName ?? (href ? "text-primary hover:underline" : "text-gray-900 dark:text-white");

    return (
        <div className={className}>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate whitespace-nowrap" title={label}>
                {label}
            </label>
            {href ? (
                <Link href={href} className={`${FIELD_BASE} ${resolvedValueClassName}`} title={titleText}>
                    {displayValue}
                </Link>
            ) : (
                <div className={`${FIELD_BASE} ${resolvedValueClassName}`} title={titleText}>
                    {displayValue}
                </div>
            )}
        </div>
    );
}
