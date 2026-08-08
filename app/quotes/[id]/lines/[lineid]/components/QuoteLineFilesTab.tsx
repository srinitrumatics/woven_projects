import { useState, useMemo } from "react";
import { formatDate, formatFileSize, displayCell } from "@/lib/utils/formatting";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import Pagination from "@/components/ui/Pagination";
import { Table, THead, TBody, Tr, Th, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

interface QuoteLineFile {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    sizeInBytes: number;
    uploadedDate: string;
    uploadedBy: string;
    contentDocumentId: string;
}

interface QuoteLineFilesTabProps {
    lineId: string;
    accountId: string;
    contactId: string;
    files: QuoteLineFile[];
    loading: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function QuoteLineFilesTab({ lineId, accountId, contactId, files, loading }: QuoteLineFilesTabProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof QuoteLineFile; direction: 'asc' | 'desc' } | null>({ key: 'fileName', direction: 'desc' });
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

    const { widths, handleResize } = useResizableColumns({
        fileName: 300,
        fileType: 100,
        fileSize: 120,
        uploadedBy: 200,
        uploadedDate: 150,
        action: 120
    });

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: key as keyof QuoteLineFile, direction });
    };

    const sortedFiles = useMemo(() => {
        if (!sortConfig) return files;
        return [...files].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
    }, [files, sortConfig]);

    const paginatedFiles = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedFiles, currentPage]);

    const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

    // Helpers from parents
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

    const handleDownload = async (file: QuoteLineFile) => {
        const contentVersionId = file.id;
        if (!contentVersionId) return;

        setDownloadingIds(prev => new Set(prev).add(file.id));
        const win = window.open('', '_blank');
        try {
            const res = await fetch(
                `/api/salesforce/quotes?action=download&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&quoteId=${encodeURIComponent(lineId)}&contentVersionId=${encodeURIComponent(contentVersionId)}&objectName=Customer_Quote_Line__c`
            );
            if (!res.ok) throw new Error("Failed to get download URL");
            const data = await res.json();
            const previewURL = data?.previewUrl;
            if (!previewURL) throw new Error("Preview URL missing");

            const downloadUrl = addDownloadParam(previewURL);
            if (win) win.location.href = downloadUrl;
            else window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error("Error downloading file:", error);
            if (win) win.close();
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(file.id);
                return newSet;
            });
        }
    };

    const handlePreview = async (file: QuoteLineFile) => {
        const contentVersionId = file.id;
        if (!contentVersionId) return;

        const win = window.open('', '_blank');
        try {
            const response = await fetch(
                `/api/salesforce/quotes?action=preview&contentVersionId=${encodeURIComponent(contentVersionId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`
            );
            if (!response.ok) {
                if (win) win.close();
                return;
            }
            const result = await response.json();
            const previewUrl = result?.previewUrl;
            if (!previewUrl) {
                if (win) win.close();
                return;
            }
            if (win) win.location.href = previewUrl;
            else window.open(previewUrl, "_blank");
        } catch (err) {
            console.error("Preview error:", err);
            if (win) win.close();
        }
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType?.toUpperCase()) {
            case "PDF":
                return <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>;
            case "XLSX": case "XLS": case "CSV":
                return <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 13h8v2H8v-2zm0 4h8v2H8v-2z" /></svg>;
            case "JPG": case "JPEG": case "PNG":
                return <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm10.5 7.5H5l4-8 3 4 2-3 5 7z" /></svg>;
            default:
                return <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z" /></svg>;
        }
    };

    if (loading) {
        return <TableLoadingState />;
    }

    return (
        <div>
            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            {files.length === 0 ? (
                <TableEmptyState message="No records found" description="There are no files associated with this quote line." />
            ) : (
                <>
                    <Table>
                        <THead>
                            <tr>
                                <SortableHeader label="File Name" field="fileName" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileName} onResize={handleResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
                                <SortableHeader label="Type" field="fileType" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileType} onResize={handleResize} />
                                <SortableHeader label="Size" field="fileSize" sortConfig={sortConfig} requestSort={requestSort} width={widths.fileSize} onResize={handleResize} />
                                <SortableHeader label="Uploaded By" field="uploadedBy" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedBy} onResize={handleResize} />
                                <SortableHeader label="Date" field="uploadedDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.uploadedDate} onResize={handleResize} />
                                <Th className="px-2" style={{ width: widths.action }}>
                                    Action
                                </Th>
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedFiles.map((file) => (
                                <Tr key={file.id}>
                                    <Td className="sticky left-0 bg-white dark:bg-gray-800 z-10 truncate" style={{ width: widths.fileName }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            {getFileIcon(file.fileType)}
                                            <span
                                                className="font-semibold text-gray-900 dark:text-white  cursor-pointer hover:text-primary hover:underline"
                                                title={file.fileName}
                                                onClick={() => handlePreview(file)}
                                            >
                                                {file.fileName}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.fileType }}>
                                        {displayCell(file.fileType?.toUpperCase())}
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.fileSize }}>
                                        {formatFileSize(file.sizeInBytes)}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.uploadedBy }}>
                                        <div className="text-sm text-gray-900 dark:text-white" title={file.uploadedBy}>
                                            {displayCell(file.uploadedBy)}
                                        </div>
                                    </Td>
                                    <Td className="text-gray-600 dark:text-gray-400 truncate" style={{ width: widths.uploadedDate }}>
                                        {formatDate(file.uploadedDate, 'numeric-dash')}
                                    </Td>
                                    <Td className="truncate" style={{ width: widths.action }}>
                                        <div className="flex gap-2">
                                            <button onClick={() => handlePreview(file)} className="p-1 text-blue-600 hover:text-blue-800" title="Preview File">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDownload(file)}
                                                disabled={downloadingIds.has(file.id)}
                                                className={`p-1 ${downloadingIds.has(file.id) ? 'text-gray-400 cursor-wait' : 'text-primary hover:text-primary-dark'}`}
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
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>

                </>
            )}
            </div>
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={files.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

