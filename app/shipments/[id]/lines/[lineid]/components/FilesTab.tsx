"use client";

import { useState, useEffect } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatDate, formatFileSize } from "@/lib/utils/formatting";

interface FileData {
    Id: string;
    Title: string;
    FileExtension: string;
    FileSize: number;
    CreatedBy: string;
    CreatedDate: string;
    ContentDocumentId?: string;
    [key: string]: any;
}

interface FilesTabProps {
    accountId: string;
    contactId: string;
    lineId: string;
}

export default function FilesTab({ accountId, contactId, lineId }: FilesTabProps) {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<FileData[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

    const fetchFiles = async () => {
        try {
            setLoading(true);
            // Using /api/salesforce/shipments with action=files
            // objectId = lineId, objectName = Shipping_Manifest_Line__c
            const queryParams = new URLSearchParams({
                accountId,
                contactId,
                objectId: lineId,
                objectName: "Shipping_Manifest_Line__c",
                action: "files"
            });
            const response = await fetch(`/api/salesforce/shipments?${queryParams}`);
            if (response.ok) {
                const result = await response.json();
                // Match the mapping from other FilesTab implementations
                const mappedData = Array.isArray(result) ? result.map((f: any) => ({
                    ...f,
                    FileSize: f.FileSize ?? f.ContentSize ?? 0,
                    CreatedBy: f.CreatedBy || f.OwnerName || "Unknown",
                    CreatedDate: f.CreatedDate || f.LastModifiedDate || ""
                })) : [];
                setFiles(mappedData);
            }
        } catch (error) {
            console.error("Fetch files error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId && contactId && lineId) {
            fetchFiles();
        }
    }, [accountId, contactId, lineId]);

    const { items: sortedFiles, requestSort, sortConfig } = useSortableData<FileData>(files);

    const { widths, handleResize } = useResizableColumns({
        fileName: 300,
        type: 100,
        size: 120,
        uploadedBy: 180,
        date: 150,
        action: 100
    });

    const handleDownload = async (file: FileData) => {
        const contentVersionId = file.Id;
        if (!contentVersionId) {
            alert("File content not available");
            return;
        }

        setDownloadingIds(prev => new Set(prev).add(file.Id));
        const win = window.open('', '_blank');
        if (win) win.document.write('Loading download...');

        try {
            const res = await fetch(
                `/api/salesforce/shipments?action=download&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&objectId=${encodeURIComponent(lineId)}&contentVersionId=${encodeURIComponent(contentVersionId)}`
            );

            if (!res.ok) throw new Error("Failed to get download URL");

            const data = await res.json();
            const previewURL = data?.previewUrl;

            if (!previewURL) throw new Error("Preview URL missing");

            // Add download param
            const sep = previewURL.includes('?') ? '&' : '?';
            const downloadUrl = `${previewURL}${sep}download=1`;

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
                newSet.delete(file.Id);
                return newSet;
            });
        }
    };

    const handlePreview = async (file: FileData) => {
        const contentVersionId = file.Id;
        if (!contentVersionId) return;

        const win = window.open('', '_blank');
        if (win) win.document.write('Loading preview...');

        try {
            const response = await fetch(
                `/api/salesforce/shipments?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`
            );
            if (!response.ok) {
                if (win) win.close();
                alert("Unable to open preview.");
                return;
            }
            const result = await response.json();
            const previewUrl = result?.previewUrl;

            if (previewUrl) {
                if (win) {
                    win.location.href = previewUrl;
                } else {
                    window.open(previewUrl, "_blank", "noopener");
                }
            } else {
                if (win) win.close();
                alert("Preview URL missing");
            }
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Files associated with this Shipment manifest line">There are no Files associated with this Shipment manifest line</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto mt-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-medium">
                    <tr>
                        <SortableHeader label="File Name" field="Title" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileName} onResize={handleResize} />
                        <SortableHeader label="Type" field="FileExtension" sortConfig={sortConfig} requestSort={requestSort} width={widths.type} onResize={handleResize} />
                        <SortableHeader label="Size" field="FileSize" sortConfig={sortConfig} requestSort={requestSort} width={widths.size} onResize={handleResize} />
                        <SortableHeader label="Uploaded By" field="CreatedBy" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedBy} onResize={handleResize} />
                        <SortableHeader label="Date" field="CreatedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.date} onResize={handleResize} />
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white truncate" style={{ width: widths.action }}>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedFiles.map((file) => (
                        <tr key={file.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate" title={file.Title}>
                                {file.Title}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={file.FileExtension}>
                                {file.FileExtension}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                                {formatFileSize(file.FileSize)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={file.CreatedBy}>
                                {file.CreatedBy}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate" title={file.CreatedDate ? formatDate(file.CreatedDate) : ""}>
                                {file.CreatedDate ? formatDate(file.CreatedDate) : ""}
                            </td>
                            <td className="px-3 py-2 text-sm truncate">
                                <div className="flex items-center gap-2 min-w-0">
                                    <button
                                        onClick={() => handlePreview(file)}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                        title="Preview File"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
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
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
