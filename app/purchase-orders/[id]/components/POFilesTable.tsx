"use client";

import React, { useState, useMemo } from 'react';
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useSortableData } from "@/hooks/useSortableData";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { formatFileSize, formatDate } from "@/lib/utils/formatting";

interface POFile {
    id: string;
    fileName: string;
    fileType: string;
    sizeInBytes: number;
    uploadedBy: string;
    uploadedDate: string;
}

interface POFilesTableProps {
    files: POFile[];
    poId: string;
}

const ITEMS_PER_PAGE = 10;

export default function POFilesTable({ files, poId }: POFilesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    const { items: sortedData, requestSort, sortConfig } = useSortableData<POFile>(files);

    const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "";
    const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID ?? "";

    const initialWidths = {
        fileName: 300,
        fileType: 120,
        sizeInBytes: 120,
        uploadedBy: 180,
        uploadedDate: 150,
        action: 100
    };

    const { widths: columnWidths, handleResize } = useResizableColumns(initialWidths);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toUpperCase();
        if (type === "PDF") {
            return (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                </svg>
            );
        } else if (["XLSX", "XLS", "CSV"].includes(type)) {
            return (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" />
                </svg>
            );
        } else if (["JPG", "JPEG", "PNG", "GIF"].includes(type)) {
            return (
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" />
            </svg>
        );
    };

    const handleAction = async (file: POFile, action: 'preview' | 'download') => {
        const contentVersionId = file.id;
        if (!contentVersionId) return;

        const win = window.open('', '_blank');
        if (win) win.document.write(`Loading ${action}...`);

        if (action === 'download') {
            setDownloadingIds(prev => new Set(prev).add(file.id));
        }

        try {
            const res = await fetch(
                `/api/salesforce/purchase-orders?action=${action}&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&objectName=Purchase_Order__c`
            );

            if (!res.ok) throw new Error("Failed to get URL");

            const result = await res.json();
            let url = result?.previewUrl || result?.downloadUrl;

            if (!url) throw new Error("URL missing from response");

            if (action === 'download' && !url.includes('download=1')) {
                url += (url.includes('?') ? '&' : '?') + 'download=1';
            }

            if (win) {
                win.location.href = url;
            } else {
                window.open(url, '_blank', 'noopener');
            }
        } catch (err) {
            console.error(`${action} error:`, err);
            if (win) win.close();
            alert(`Failed to ${action} file`);
        } finally {
            if (action === 'download') {
                setDownloadingIds(prev => {
                    const next = new Set(prev);
                    next.delete(file.id);
                    return next;
                });
            }
        }
    };

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm">There are no files attached to this purchase order.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Files ({files.length})</h3>
            </div>
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                        <tr>
                            <SortableHeader
                                label="File Name"
                                field="fileName"
                                sortConfig={sortConfig}
                                requestSort={requestSort}
                                width={columnWidths.fileName}
                                onResize={handleResize}
                                className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30"
                            />
                            <SortableHeader
                                label="Type"
                                field="fileType"
                                sortConfig={sortConfig}
                                requestSort={requestSort}
                                width={columnWidths.fileType}
                                onResize={handleResize}
                            />
                            <SortableHeader
                                label="Size"
                                field="sizeInBytes"
                                sortConfig={sortConfig}
                                requestSort={requestSort}
                                width={columnWidths.sizeInBytes}
                                onResize={handleResize}
                            />
                            <SortableHeader
                                label="Uploaded By"
                                field="uploadedBy"
                                sortConfig={sortConfig}
                                requestSort={requestSort}
                                width={columnWidths.uploadedBy}
                                onResize={handleResize}
                            />
                            <SortableHeader
                                label="Date"
                                field="uploadedDate"
                                sortConfig={sortConfig}
                                requestSort={requestSort}
                                width={columnWidths.uploadedDate}
                                onResize={handleResize}
                            />
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedData.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 border-r border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.fileType)}
                                        <div className="truncate" title={file.fileName}>{file.fileName}</div>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    {file.fileType}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    {formatFileSize(file.sizeInBytes)}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <div className="truncate" title={file.uploadedBy}>{file.uploadedBy}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    {file.uploadedDate ? formatDate(file.uploadedDate) : '-'}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleAction(file, 'preview')}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Preview"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleAction(file, 'download')}
                                            disabled={downloadingIds.has(file.id)}
                                            className={`${downloadingIds.has(file.id) ? 'text-gray-400 cursor-wait' : 'text-primary hover:text-primary-dark'} transition-colors`}
                                            title="Download"
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
            </div>

            {files.length > ITEMS_PER_PAGE && (
                <div className="mt-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-left">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={files.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        itemName="Files"
                    />
                </div>
            )}
        </div>
    );
}
