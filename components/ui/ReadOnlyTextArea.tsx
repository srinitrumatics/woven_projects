interface ReadOnlyTextAreaProps {
    value: any;
    className?: string;
}

export default function ReadOnlyTextArea({ value, className = "" }: ReadOnlyTextAreaProps) {
    return (
        <div className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white whitespace-pre-wrap ${className}`}>
            {value}
        </div>
    );
}
