interface DetailInputProps {
    label: string;
    value: any;
}

export default function DetailInput({ label, value }: DetailInputProps) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 truncate">
                {label}
            </label>
            <input
                type="text"
                disabled
                value={value || ''}
                className="w-full h-11 px-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-0 truncate"
                title={String(value ?? '')}
            />
        </div>
    );
}
