import { ProposalElement, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

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
    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof ProposalElement);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (elements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                <p className="text-lg font-medium truncate" title="No records found">No records found</p>
                <p className="text-sm truncate" title="There are no Elements associated with this proposal.">
                    There are no Elements associated with this proposal.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed">
                <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                        <SortableHeader label="WBS" field="wbs" sortConfig={sortConfig} requestSort={requestSort} width={widths.wbs} onResize={onResize} />
                        <SortableHeader label="Proposal Element" field="proposalElement" sortConfig={sortConfig} requestSort={requestSort} width={widths.proposalElement} onResize={onResize} />
                        <SortableHeader label="Description" field="description" sortConfig={sortConfig} requestSort={requestSort} width={widths.description} onResize={onResize} />
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {elements.map(element => (
                        <tr key={element.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 ">
                            <td className="px-3 py-2 text-left truncate">
                                <span className="inline-block px-1  text-sm  font-semibold  rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 truncate">
                                    {element.wbs}
                                </span>
                            </td>
                            <td className="px-3 py-2 truncate" title={element.proposalElement}>
                                <div className="truncate text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{element.proposalElement}</div>
                                </div>
                            </td>
                            <td className="px-3 py-2 truncate" title={element.description}>
                                <div className="truncate text-left">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{element.description}</div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
