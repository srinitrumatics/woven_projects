import { ProposalElement, SortDirection } from "../types";

interface ElementsTabProps {
    elements: ProposalElement[];
    sortField: keyof ProposalElement;
    sortDirection: SortDirection;
    onSort: (field: keyof ProposalElement) => void;
    loading: boolean;
}

export default function ElementsTab({ elements, sortField, sortDirection, onSort, loading }: ElementsTabProps) {
    const SortIcon = ({ field }: { field: keyof ProposalElement }) => (
        <svg
            className={`w-4 h-4 ml-1 transition-opacity ${sortField === field ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            {sortField === field && sortDirection === "asc" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
        </svg>
    );

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
                        <th
                            className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group"
                            onClick={() => onSort("wbs")}
                        >
                            <div className="flex items-center">
                                WBS:
                                <SortIcon field="wbs" />
                            </div>
                        </th>
                        <th
                            className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer group"
                            onClick={() => onSort("proposalElement")}
                        >
                            <div className="flex items-center">
                                PROPOSAL ELEMENT:
                                <SortIcon field="proposalElement" />
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            <div className="flex items-center">
                                DESCRIPTION:
                                <SortIcon field="proposalElement" />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {elements.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <p className="text-lg font-medium">No elements found</p>
                                    <p className="text-sm">There are no breakdown elements for this proposal.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        elements.map(element => (
                            <tr key={element.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-4">
                                    <span className="inline-block px-3 py-1 text-sm font-mono font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                        {element.wbs}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{element.proposalElement}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{element.description}</div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
