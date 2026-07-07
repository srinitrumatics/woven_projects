"use client";

import { useEffect, useState } from "react";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { formatFileSize, displayCell } from "@/lib/utils/formatting";
import { useToast } from "@/components/ui/Toast";

interface LineFile {
    id: string;
    fileName: string;
    fileType: string;
    sizeInBytes: number;
    uploadedBy: string;
    uploadedDate: string;
}

interface InvoiceLineFilesTabProps {
    lineId: string;
    accountId?: string;
    contactId?: string;
}

export default function InvoiceLineFilesTab({ lineId, accountId, contactId }: InvoiceLineFilesTabProps) {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<LineFile[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    const { error: toastError } = useToast();

    useEffect(() => {
        async function fetchFiles() {
            if (!accountId || !contactId || !lineId) return;
            try {
                setLoading(true);
                const res = await fetch(
                    `/api/salesforce/invoices?accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&invoiceId=${encodeURIComponent(lineId)}&action=files&objectName=Invoice_Line__c`
                );
                if (!res.ok) throw new Error("Failed to fetch files");
                const data = await res.json();

                // Handle array or object response
                const rawFiles = Array.isArray(data) ? data : data?.files || data?.ContentVersion || [];
                setFiles(rawFiles.map((item: any) => ({
                    id: item.Id || item.ContentVersionId || item.id || "",
                    fileName: item.Title || item.PathOnClient || item.fileName || item.FileName || "",
                    fileType: item.FileExtension || item.fileType || item.FileType || "",
                    sizeInBytes: item.ContentSize || item.sizeInBytes || item.FileSize || 0,
                    uploadedBy: item.Owner?.Name || item.CreatedBy?.Name || item.uploadedBy || "",
                    uploadedDate: item.ContentModifiedDate || item.CreatedDate || item.uploadedDate || "",
                })));
            } catch (err) {
                console.error("Error fetching invoice line files:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFiles();
    }, [lineId, accountId, contactId]);

    const { items: sortedFiles, requestSort, sortConfig } = useSortableData<LineFile>(files);
    const { widths, handleResize } = useResizableColumns({
        name: 300,
        type: 120,
        size: 120,
        uploadedBy: 200,
        date: 160,
        action: 100,
    });

    function decodeHtmlEntities(s: string) {
        return s ? s.replace(/&amp;/g, "&") : s;
    }

    function addDownloadParam(previewUrl: string) {
        const decoded = decodeHtmlEntities(previewUrl);
        const downloadParam = "download=1";
        const hashIndex = decoded.indexOf("#");
        if (hashIndex !== -1) {
            const beforeHash = decoded.slice(0, hashIndex);
            const afterHash = decoded.slice(hashIndex);
            const sep = beforeHash.includes("?") ? "&" : "?";
            return `${beforeHash}${sep}${downloadParam}${afterHash}`;
        }
        const sep = decoded.includes("?") ? "&" : "?";
        return `${decoded}${sep}${downloadParam}`;
    }

    const handlePreview = async (file: LineFile) => {
        const contentVersionId = file.id;
        if (!contentVersionId) return;
        const win = window.open("", "_blank");
        if (win) win.document.write("Loading preview...");
        try {
            const response = await fetch(
                `/api/salesforce/invoices?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId || "")}&contactId=${encodeURIComponent(contactId || "")}`
            );
            if (!response.ok) {
                if (win) win.close();
                toastError("Unable to open preview.");
                return;
            }
            const result = await response.json();
            const previewUrl = result?.previewUrl;
            if (previewUrl) {
                if (win) win.location.href = previewUrl;
            } else {
                if (win) win.close();
            }
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
        }
    };

    const handleDownload = async (file: LineFile) => {
        const contentVersionId = file.id;
        if (!contentVersionId) return;
        const win = window.open("", "_blank");
        if (win) win.document.write("Loading download...");
        setDownloadingIds((prev) => new Set(prev).add(file.id));
        try {
            const res = await fetch(
                `/api/salesforce/invoices?action=download&accountId=${encodeURIComponent(accountId || "")}&contactId=${encodeURIComponent(contactId || "")}&invoiceId=${encodeURIComponent(lineId)}&contentVersionId=${encodeURIComponent(contentVersionId)}`
            );
            if (!res.ok) throw new Error("Failed to get download URL");
            const data = await res.json();
            const previewURL = data?.previewUrl;
            if (previewURL) {
                const downloadUrl = addDownloadParam(previewURL);
                if (win) win.location.href = downloadUrl;
            } else {
                if (win) win.close();
            }
        } catch (err) {
            console.error("Error downloading file:", err);
            if (win) win.close();
            toastError("Failed to download file");
        } finally {
            setDownloadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(file.id);
                return newSet;
            });
        }
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toUpperCase();
        if (type === "PDF") return <span className="text-red-500 font-bold text-xs truncate">PDF</span>;
        if (type === "XLSX" || type === "XLS") return <span className="text-green-600 font-bold text-xs truncate">XLS</span>;
        if (type === "PNG" || type === "JPG" || type === "JPEG") return <span className="text-blue-500 font-bold text-xs truncate">IMG</span>;
        return <span className="text-gray-500 font-bold text-xs truncate">FILE</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight text-lg truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no files associated with this invoice line.">There are no files associated with this invoice line.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="File Name" field="fileName" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={handleResize} />
                        <SortableHeader label="Type" field="fileType" sortConfig={sortConfig} requestSort={requestSort} width={widths.type} onResize={handleResize} />
                        <SortableHeader label="Size" field="sizeInBytes" sortConfig={sortConfig} requestSort={requestSort} width={widths.size} onResize={handleResize} />
                        <SortableHeader label="Uploaded By" field="uploadedBy" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedBy} onResize={handleResize} />
                        <SortableHeader label="Date" field="uploadedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.date} onResize={handleResize} />
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white " style={{ width: widths.action }}>Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">
                                <div className="flex items-center gap-2 min-w-0">
                                    {getFileIcon(file.fileType)}
                                    <span className="truncate" title={file.fileName}>{file.fileName}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(file.fileType)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">{formatFileSize(file.sizeInBytes)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={file.uploadedBy}>{displayCell(file.uploadedBy)}</td>
                            <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(file.uploadedDate)}</td>
                            <td className="px-3 py-2 text-left truncate">
                                <div className="flex items-center gap-2 min-w-0">
                                    <button onClick={() => handlePreview(file)} className="text-blue-600 hover:text-blue-800 p-1" title="Preview">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDownload(file)}
                                        disabled={downloadingIds.has(file.id)}
                                        className={`p-1 ${downloadingIds.has(file.id) ? "text-gray-400 cursor-wait" : "text-primary hover:text-primary-dark"}`}
                                        title="Download"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
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
