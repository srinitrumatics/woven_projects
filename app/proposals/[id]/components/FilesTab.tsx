import { ProposalFile, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

interface FilesTabProps {
    files: ProposalFile[];
    loading: boolean;
    selectedFiles: Set<string>;
    onFileSelect: (id: string) => void;
    onSelectAll: () => void;
    sortField: keyof ProposalFile;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposalFile) => void;
}

export default function FilesTab({
    files,
    loading,
    selectedFiles,
    onFileSelect,
    onSelectAll,
    sortField,
    sortDirection,
    onSort
}: FilesTabProps) {

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof ProposalFile);

    const getFileIcon = (fileType: string) => {
        switch (fileType.toUpperCase()) {
            case "PDF":
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                    </svg>
                );
            case "XLSX":
            case "XLS":
                return (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" />
                    </svg>
                );
            case "ZIP":
                return (
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 6h2v2h-2v2h2v2h-2v2h2v2h-2v-2H8v-2h2v-2H8v-2h2v-2H8v-2h2v-2H8v-2h2z" />
                    </svg>
                );
            case "DWG":
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 14l3 3-3 3m4-3h5" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-8">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                checked={selectedFiles.size === files.length && files.length > 0}
                                onChange={onSelectAll}
                            />
                        </th>
                        <SortableHeader label="File Name" field="fileName" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Category" field="category" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Type" field="fileType" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Size" field="sizeInBytes" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Uploaded By" field="uploadedBy" sortConfig={sortConfig} requestSort={requestSort} />
                        <SortableHeader label="Date" field="uploadedDate" sortConfig={sortConfig} requestSort={requestSort} />
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {files.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No files found</p>
                                    <p className="text-sm">There are no files attached to this proposal.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        files.map(file => (
                            <tr
                                key={file.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${selectedFiles.has(file.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                onClick={() => onFileSelect(file.id)}
                            >
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.has(file.id)}
                                        onChange={() => onFileSelect(file.id)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.fileType)}
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.fileName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {file.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{file.fileType}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{file.fileSize}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{file.uploadedBy}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.uploadedDate}</td>
                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="px-4 py-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium"
                                        onClick={() => file.downloadUrl && window.open(file.downloadUrl, '_blank')}
                                        title="Download File"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
