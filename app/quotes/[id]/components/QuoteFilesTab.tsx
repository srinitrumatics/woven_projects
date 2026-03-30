import { useState } from "react";
import { QuoteFile } from "@/app/quotes/types";
import { formatDate, formatFileSize } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";

interface QuoteFilesTabProps {
    quoteId: string;
    accountId: string;
    contactId: string;
    files: QuoteFile[];
    loading: boolean;
}

export default function QuoteFilesTab({ quoteId, accountId, contactId, files, loading }: QuoteFilesTabProps) {
    const [sortField, setSortField] = useState<keyof QuoteFile>("fileName");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

    const { widths, handleResize } = useResizableColumns({
        fileName: 300,
        fileType: 100,
        fileSize: 120,
        uploadedBy: 200,
        uploadedDate: 150,
        action: 120
    });

    const handleSort = (field: keyof QuoteFile) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => handleSort(key as keyof QuoteFile);

    // Helpers from orders/FilesTab.tsx
    function decodeHtmlEntities(s: string) {
        return s ? s.replace(/&amp;/g, '&') : s;
    }

    function addDownloadParam(previewUrl: string) {
        const decoded = decodeHtmlEntities(previewUrl);
        const downloadParam = 'download=1';

        const hashIndex = decoded.indexOf('#');
        if (hashIndex !== -1) {
            const beforeHash = decoded.slice(0, hashIndex);
            const afterHash = decoded.slice(hashIndex);
            const sep = beforeHash.includes('?') ? '&' : '?';
            return `${beforeHash}${sep}${downloadParam}${afterHash}`;
        }

        const sep = decoded.includes('?') ? '&' : '?';
        return `${decoded}${sep}${downloadParam}`;
    }

    const handleDownload = async (file: QuoteFile) => {
        const contentVersionId = file.id;

        if (!contentVersionId) {
            alert("File content not available - missing content version ID");
            return;
        }

        setDownloadingIds(prev => new Set(prev).add(file.id));

        const win = window.open('', '_blank');
        if (win) win.document.write('Loading download...');

        try {
            const res = await fetch(
                `/api/salesforce/quotes?action=download&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&quoteId=${encodeURIComponent(quoteId)}&contentVersionId=${encodeURIComponent(contentVersionId)}`
            );

            if (!res.ok) throw new Error("Failed to get download URL");

            const data = await res.json();
            const previewURL = data?.previewUrl;

            if (!previewURL) throw new Error("Preview URL missing from API response");

            const downloadUrl = addDownloadParam(previewURL);
            if (win) {
                win.location.href = downloadUrl;
            } else {
                window.open(downloadUrl, '_blank', 'noopener');
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            if (win) win.close();
            alert("Failed to download file");
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(file.id);
                return newSet;
            });
        }
    };

    const handlePreview = async (file: QuoteFile) => {
        const contentVersionId = file.id;

        if (!contentVersionId) {
            alert("Missing Content Version ID");
            return;
        }

        const win = window.open('', '_blank');
        if (win) win.document.write('Loading preview...');

        try {
            const response = await fetch(
                `/api/salesforce/quotes?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`
            );

            if (!response.ok) {
                if (win) win.close();
                alert("Unable to open preview.");
                return;
            }
            const result = await response.json();
            const previewUrl = result?.previewUrl;

            if (!previewUrl) {
                if (win) win.close();
                alert("Preview URL missing");
                return;
            }

            if (win) {
                win.location.href = previewUrl;
            } else {
                window.open(previewUrl, "_blank");
            }
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
            alert("Failed to open preview");
        }
    };

    const getFileIcon = (fileType: string) => {
        // ... (rest of the getFileIcon function)
        switch (fileType?.toUpperCase()) {
            case "PDF":
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                    </svg>
                );
            case "XLSX":
            case "XLS":
            case "CSV":
                return (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" />
                    </svg>
                );
            case "ZIP":
            case "RAR":
                return (
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 6h2v2h-2v2h2v2h-2v2h2v2h-2v-2H8v-2h2v-2H8v-2h2v-2H8v-2h2v-2H8v-2h2z" />
                    </svg>
                );
            case "JPG":
            case "JPEG":
            case "PNG":
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm10.5 7.5H5l4-8 3 4 2-3 5 7z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
                    </svg>
                );
        }
    };

    const sortedFiles = [...files].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            {sortedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no files associated with this quote.">There are no files associated with this quote.</p>
                </div>
            ) : (
                <table className="w-full table-fixed">
                    <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <SortableHeader label="File Name" field="fileName" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                            <SortableHeader label="Type" field="fileType" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileType} onResize={handleResize} />
                            <SortableHeader label="Size" field="fileSize" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileSize} onResize={handleResize} />
                            <SortableHeader label="Uploaded By" field="uploadedBy" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedBy} onResize={handleResize} />
                            <SortableHeader label="Date" field="uploadedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedDate} onResize={handleResize} />
                            <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white truncate" style={{ width: widths.action, minWidth: widths.action, maxWidth: widths.action }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 py-2 text-sm sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.fileName }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        {getFileIcon(file.fileType)}
                                        <span
                                            className="font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary hover:underline"
                                            title={file.fileName}
                                            onClick={() => handlePreview(file)}
                                        >
                                            {file.fileName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.fileType }}>
                                    {file.fileType?.toUpperCase() || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.fileSize }}>
                                    {formatFileSize(file.sizeInBytes)}
                                </td>
                                <td className="px-3 py-2 truncate" style={{ width: widths.uploadedBy }}>
                                    <div className="text-sm text-gray-900 dark:text-white truncate" title={file.uploadedBy}>
                                        {file.uploadedBy}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.uploadedDate }}>
                                    {formatDate(file.uploadedDate, 'numeric-dash')}
                                </td>
                                <td className="px-3 py-2 text-sm truncate" style={{ width: widths.action }}>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePreview(file)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                            title="Preview File"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            disabled={downloadingIds.has(file.id)}
                                            className={`p-1 ${downloadingIds.has(file.id) ? 'text-gray-400 cursor-wait' : 'text-primary hover:text-primary-dark'}`}
                                            title={downloadingIds.has(file.id) ? "Downloading..." : "Download"}
                                        >
                                            {downloadingIds.has(file.id) ? (
                                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
