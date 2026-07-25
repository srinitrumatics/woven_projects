import { useState, useMemo } from "react";
import { ProposalElement, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { displayCell } from "@/lib/utils/formatting";
import { Table, THead, TBody, Tr, Td, TableEmptyState, TableLoadingState } from "@/components/ui/DataTable";

const ITEMS_PER_PAGE = 10;

interface ElementsTabProps {
    elements: ProposalElement[];
    sortField: keyof ProposalElement;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposalElement) => void;
    loading: boolean;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function ElementsTab({ elements, sortField, sortDirection, onSort, loading, widths, onResize }: ElementsTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => {
        onSort(key as keyof ProposalElement);
        setCurrentPage(1);
    };

    const paginatedElements = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return elements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [elements, currentPage]);

    const totalPages = Math.ceil(elements.length / ITEMS_PER_PAGE);

    if (loading) {
        return <TableLoadingState />;
    }

    if (elements.length === 0) {
        return (
            <TableEmptyState message="No records found" description="There are no Elements associated with this proposal." />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Table className="border-separate border-spacing-0 table-fixed">
                    <THead className="sticky top-0 z-20">
                        <tr>
                            <SortableHeader label="WBS" field="wbs" sortConfig={sortConfig} requestSort={requestSort} width={widths.wbs} onResize={onResize} className="bg-primary-light dark:bg-gray-900" />
                            <SortableHeader label="Proposal Element" field="proposalElement" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalElement} onResize={onResize} />
                            <SortableHeader label="Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} />
                        </tr>
                    </THead>
                    <TBody>
                        {paginatedElements.map(element => (
                            <Tr key={element.id} className="transition-colors">
                                <Td className="text-left truncate">
                                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 truncate">
                                        {displayCell(element.wbs)}
                                    </span>
                                </Td>
                                <Td className="truncate" title={element.proposalElement}>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayCell(element.proposalElement)}</div>
                                </Td>
                                <Td className="truncate" title={element.description}>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(element.description)}</div>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={elements.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}
