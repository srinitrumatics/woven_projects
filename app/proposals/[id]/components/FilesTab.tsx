import { useState } from "react";
import { ProposalFile, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import { formatFileSize } from "@/lib/utils/formatting";

interface FilesTabProps {
    files: ProposalFile[];
    loading: boolean;
    selectedFiles: Set<string>;
    onFileSelect: (id: string) => void;
    onSelectAll: () => void;
    sortField: keyof ProposalFile;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposalFile) => void;
    proposalId: string;
    accountId: string;
    contactId: string;
}

export default function FilesTab({
    files,
    loading,
    selectedFiles,
    onFileSelect,
    onSelectAll,
    sortField,
    sortDirection,
    onSort,
    proposalId,
    accountId,
    contactId
}: FilesTabProps) {
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof ProposalFile);

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

    const handleDownload = async (file: ProposalFile) => {
        const contentVersionId = file.id;

        if (!contentVersionId) {
            alert("File content not available - missing content document ID");
            return;
        }

        // Open a blank window immediately to avoid popup blocker
        const win = window.open('', '_blank');
        if (win) {
            win.document.write('Loading download...');
        }

        // Set loading state for this file
        setDownloadingIds(prev => new Set(prev).add(file.id));

        try {
            // Call the download API to get the download URL
            const res = await fetch(
                `/api/salesforce/proposals?action=download&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&proposalId=${encodeURIComponent(proposalId)}&contentVersionId=${encodeURIComponent(contentVersionId)}`
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
                // Fallback for popup blocker
                window.open(downloadUrl, '_blank', 'noopener');
            }

        } catch (error) {
            console.error("Error downloading file:", error);
            if (win) win.close();
            alert("Failed to download file");
        } finally {
            // Clear loading state for this file
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(file.id);
                return newSet;
            });
        }
    };

    const handlePreview = async (file: ProposalFile) => {
        const contentVersionId = file.id;

        if (!contentVersionId) {
            alert("Missing Content Version ID");
            return;
        }

        // Open blank window immediately
        const win = window.open('', '_blank');
        if (win) {
            win.document.write('Loading preview...');
        }

        try {
            const response = await fetch(
                `/api/salesforce/proposals?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`
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
                window.open(previewUrl, "_blank", "noopener");
            }
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
            alert("Failed to open preview");
        }
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType?.toUpperCase()) {
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
        <div className="overflow-x-auto p-4">
            {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">There are no files attached to this proposal.</p>
                </div>
            ) : (
                <table className="w-full ">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white w-[50px]">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={selectedFiles.size === files.length && files.length > 0}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <SortableHeader label="File Name" field="fileName" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Type" field="fileType" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Size" field="sizeInBytes" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Uploaded By" field="uploadedBy" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Date" field="uploadedDate" sortConfig={sortConfig} requestSort={requestSort} />
                            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {files.map(file => (
                            <tr
                                key={file.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${selectedFiles.has(file.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                onClick={() => onFileSelect(file.id)}
                            >
                                <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.has(file.id)}
                                        onChange={() => onFileSelect(file.id)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex gap-3">
                                        {getFileIcon(file.fileType)}
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.fileName}>{file.fileName}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-left">
                                    <span className="text-sm  text-gray-600 dark:text-gray-400">{file.fileType}</span>
                                </td>
                                <td className="px-3 py-2 text-left text-sm text-gray-900 dark:text-white">{formatFileSize(file.sizeInBytes)}</td>
                                <td className="px-3 py-2 text-left text-sm text-gray-900 dark:text-white " title={file.uploadedBy}><div className="text-sm text-gray-900 dark:text-white truncate">{file.uploadedBy}</div></td>
                                <td className="px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 ">{file.uploadedDate}</td>
                                <td className="px-3 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
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
                                            disabled={downloadingIds.has(file.id)}
                                            className={`p-1 ${downloadingIds.has(file.id) ? 'text-gray-400 cursor-wait' : 'text-primary hover:text-primary-dark'}`}
                                            title={downloadingIds.has(file.id) ? 'Downloading...' : 'Download'}
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
