import { useState, useEffect } from "react";
import { FileData } from "@/app/orders/types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { useSortableData } from "../../../../hooks/useSortableData";
import { formatFileSize } from "@/lib/utils/formatting";
import { useToast } from "@/components/ui/Toast";

interface FilesTabProps {
    orderId: string;
    accountId: string;
    contactId: string;
    isEditing?: boolean;
    onFilesCountChange?: (count: number) => void;
}

export default function FilesTab({ orderId, accountId, contactId, isEditing = false, onFilesCountChange }: FilesTabProps) {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    const { success, error: toastError } = useToast();

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/salesforce/orders?action=files&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}`);
            if (!res.ok) throw new Error("Failed to fetch files");
            const data = await res.json();
            // Map ContentSize (Salesforce) to FileSize (UI)
            const mappedData = Array.isArray(data) ? data.map((f: any) => ({
                ...f,
                FileSize: f.FileSize ?? f.ContentSize ?? 0
            })) : [];
            setFiles(mappedData);
            onFilesCountChange?.(mappedData.length);
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [orderId, accountId, contactId]);

    const { items: sortedFiles, requestSort, sortConfig } = useSortableData<FileData>(files);

    // helpers
    function decodeHtmlEntities(s: string) {
        return s ? s.replace(/&amp;/g, '&') : s;
    }

    function addDownloadParam(previewUrl: string) {
        const decoded = decodeHtmlEntities(previewUrl);
        const downloadParam = 'download=1';

        // If there's a hash fragment (#...), insert param BEFORE it
        const hashIndex = decoded.indexOf('#');
        if (hashIndex !== -1) {
            const beforeHash = decoded.slice(0, hashIndex);
            const afterHash = decoded.slice(hashIndex); // includes '#...'
            const sep = beforeHash.includes('?') ? '&' : '?';
            return `${beforeHash}${sep}${downloadParam}${afterHash}`;
        }

        // No fragment — append normally using ? or &
        const sep = decoded.includes('?') ? '&' : '?';
        return `${decoded}${sep}${downloadParam}`;
    }

    const handleDownload = async (file: FileData) => {
        // Get the content document ID from the file
        const contentVersionId = file.Id;

        if (!contentVersionId) {
            toastError("File content not available - missing content document ID");
            return;
        }

        // Set loading state for this file
        setDownloadingIds(prev => new Set(prev).add(file.Id));

        // Open a blank window immediately to avoid popup blocker
        const win = window.open('', '_blank');
        if (win) {
            win.document.write('Loading download...');
        }

        try {
            // Call the download API to get the download URL
            const res = await fetch(
                `/api/salesforce/orders?action=download&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}&contentVersionId=${encodeURIComponent(contentVersionId)}`
            );

            if (!res.ok) {
                throw new Error("Failed to get download URL");
            }

            const data = await res.json();
            const previewURL = data?.previewUrl;

            if (!previewURL) {
                throw new Error("Preview URL missing from API response");
            }

            const downloadUrl = addDownloadParam(previewURL);

            if (win) {
                win.location.href = downloadUrl;
            } else {
                window.open(downloadUrl, '_blank', 'noopener');
            }
        } catch (err) {
            console.error("Error downloading file:", err);
            if (win) win.close();
            toastError("Failed to download file");
        } finally {
            // Clear loading state for this file
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(file.Id);
                return newSet;
            });
        }
    };

    const handleDelete = async (file: FileData) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        // Use ContentDocumentId (capital C) from Salesforce API response
        const contentDocumentId = file.ContentDocumentId;
        if (!contentDocumentId) {
            toastError("Cannot delete file - missing content document ID");
            return;
        }
        try {
            const res = await fetch(`/api/salesforce/orders?orderId=${encodeURIComponent(orderId)}&contentDocumentId=${encodeURIComponent(contentDocumentId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete file");

            setFiles(prev => {
                const newFiles = prev.filter(f => f.Id !== file.Id);
                onFilesCountChange?.(newFiles.length);
                return newFiles;
            });
            setSelectedFileIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(file.Id);
                return newSet;
            });
        } catch (err) {
            console.error("Error deleting file:", err);
            toastError("Failed to delete file");
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedFileIds(new Set(files.map(f => f.Id)));
        } else {
            setSelectedFileIds(new Set());
        }
    };

    const handleSelectFile = (fileId: string) => {
        const newSet = new Set(selectedFileIds);
        if (newSet.has(fileId)) {
            newSet.delete(fileId);
        } else {
            newSet.add(fileId);
        }
        setSelectedFileIds(newSet);
    };

    const handleBulkDownload = async () => {
        const selectedFiles = files.filter(f => selectedFileIds.has(f.Id));
        for (const file of selectedFiles) {
            await handleDownload(file);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFileIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedFileIds.size} file(s)?`)) return;

        // Get contentDocumentIds for selected files - use ContentDocumentId (capital C) from Salesforce API
        const selectedFiles = files.filter(f => selectedFileIds.has(f.Id));
        const contentDocumentIds = selectedFiles.map(f => f.ContentDocumentId).join(',');

        try {
            const res = await fetch(`/api/salesforce/orders?orderId=${encodeURIComponent(orderId)}&contentDocumentId=${encodeURIComponent(contentDocumentIds)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete files");

            // Remove deleted files from list
            setFiles(prev => {
                const newFiles = prev.filter(f => !selectedFileIds.has(f.Id));
                onFilesCountChange?.(newFiles.length);
                return newFiles;
            });
            setSelectedFileIds(new Set());
            success("Files deleted successfully");
        } catch (err) {
            console.error("Error deleting files:", err);
            toastError("Failed to delete files");
        }
    };

    const handlePreview = async (file: FileData) => {
        const contentVersionId = file.Id;

        if (!contentVersionId) {
            toastError("Missing Content Version ID");
            return;
        }

        // Open blank window immediately
        const win = window.open('', '_blank');
        if (win) {
            win.document.write('Loading preview...');
        }

        try {
            const response = await fetch(
                `/api/salesforce/orders?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId)}`
            );

            if (!response.ok) {
                if (win) win.close();
                toastError("Unable to open preview.");
                return;
            }
            const result = await response.json();

            //console.log("Preview API response:", result); // will show { previewUrl: "..." }

            const previewUrl = result?.previewUrl;

            if (!previewUrl) {
                if (win) win.close();
                toastError("Preview URL missing");
                return;
            }

            // Now open preview in new tab
            if (win) {
                win.location.href = previewUrl;
            } else {
                window.open(previewUrl, "_blank", "noopener");
            }
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
            toastError("Failed to open preview");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4 min-w-0">
                <div></div>
                <div className="flex gap-2">
                    {selectedFileIds.size > 0 && (
                        <>
                            <button
                                onClick={handleBulkDownload}
                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors truncate"
                            >
                                Download Selected ({selectedFileIds.size})
                            </button>
                            {isEditing && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors truncate"
                                >
                                    Delete Selected ({selectedFileIds.size})
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12 min-w-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : sortedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                    <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                    <p className="text-sm truncate" title="There are no files associated with this order.">There are no files associated with this order.</p>
                </div>
            ) : (
                <div className="overflow-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-10">
                            <tr>
                                {isEditing && (
                                    <th className="px-2 py-3 text-left w-10 ">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={files.length > 0 && files.every(f => selectedFileIds.has(f.Id))}
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        />
                                    </th>
                                )}
                                <SortableHeader label="File Name" field="Title" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Type" field="FileExtension" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Size" field="FileSize" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Uploaded By" field="CreatedBy" sortConfig={sortConfig} requestSort={requestSort} />

                                <SortableHeader label="Date" field="CreatedDate" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="px-2 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white ">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedFiles.map(file => (
                                <tr key={file.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {isEditing && (
                                        <td className="px-2 py-3 truncate">
                                            <input
                                                type="checkbox"
                                                checked={selectedFileIds.has(file.Id)}
                                                onChange={() => handleSelectFile(file.Id)}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                        </td>
                                    )}
                                    <td className="px-2 py-3 text-sm font-medium text-gray-900 dark:text-white truncate" title={file.Title}><div className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.Title}</div></td>
                                    <td className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{file.FileExtension}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{formatFileSize(file.FileSize)}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{file.CreatedBy}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{file.CreatedDate}</td>
                                    <td className="px-2 py-3 truncate">
                                        <div>
                                            {/* View / Preview button */}
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
                                            {/* Download button */}
                                            <button
                                                onClick={() => handleDownload(file)}
                                                disabled={downloadingIds.has(file.Id)}
                                                className={`p-1 ${downloadingIds.has(file.Id) ? 'text-gray-400 cursor-wait' : 'text-primary hover:text-primary-dark'}`}
                                                title={downloadingIds.has(file.Id) ? 'Downloading...' : 'Download'}
                                            >
                                                {downloadingIds.has(file.Id) ? (
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
                                            {/* Delete button */}
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleDelete(file)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
