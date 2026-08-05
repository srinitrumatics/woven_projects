interface ReadOnlyFieldProps {
    label: string;
    value: any;
    href?: string;
    className?: string;
    valueClassName?: string;
}

const INPUT_BASE = "w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm truncate cursor-text focus:ring-2 focus:ring-primary outline-none";

export default function ReadOnlyField({ label, value, className = "", valueClassName }: ReadOnlyFieldProps) {
    const displayValue = value ?? "";
    const titleText = String(displayValue);
    const resolvedValueClassName = valueClassName ?? "text-gray-900 dark:text-white";

    return (
        <div className={className}>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 truncate whitespace-nowrap" title={label}>
                {label}
            </label>
            <input
                type="text"
                value={displayValue}
                readOnly
                title={titleText}
                className={`${INPUT_BASE} ${resolvedValueClassName}`}
            />
        </div>
    );
}
