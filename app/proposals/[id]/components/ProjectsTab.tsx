import { useState, useMemo } from "react";
import { Project, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";
import Pagination from "../../../../components/ui/Pagination";
import { displayCell } from "@/lib/utils/formatting";

const ITEMS_PER_PAGE = 10;

interface ProjectsTabProps {
    projects: Project[];
    loading: boolean;
    sortField: keyof Project;
    sortDirection: SortDirection;
    onSort: (field: keyof Project) => void;
    widths: Record<string, number>;
    onResize: (field: string, width: number) => void;
}

export default function ProjectsTab({ projects, loading, sortField, sortDirection, onSort, widths, onResize }: ProjectsTabProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => {
        onSort(key as keyof Project);
        setCurrentPage(1);
    };

    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [projects, currentPage]);

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-w-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm  overflow-hidden">
            <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400 min-w-0">
                        <p className="text-lg font-medium" title="No records found">No records found</p>
                        <p className="text-sm" title="There are no projects associated with this proposal.">There are no projects associated with this proposal.</p>
                    </div>
                ) : (
                    <table className="w-full border-separate border-spacing-0 table-fixed">
                        <thead className="bg-primary-light dark:bg-gray-900 sticky top-0 z-20">
                            <tr>
                                <SortableHeader label="Project Number" field="projectNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.projectNumber} onResize={onResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-30" />
                                <SortableHeader label="Status" field="status" sortConfig={sortConfig} requestSort={requestSort} width={widths.status} onResize={onResize} />
                                <SortableHeader label="Project Name" field="name" sortConfig={sortConfig} requestSort={requestSort} width={widths.name} onResize={onResize} />
                                <SortableHeader label="Customer Account" field="customerAccountName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerAccountName} onResize={onResize} />
                                <SortableHeader label="Customer Contact" field="customerContactName" sortConfig={sortConfig} requestSort={requestSort} width={widths.customerContactName} onResize={onResize} />
                                <SortableHeader label="Billing Type" field="billingType" sortConfig={sortConfig} requestSort={requestSort} width={widths.billingType} onResize={onResize} />
                                <SortableHeader label="Project Manager" field="projectManagerName" sortConfig={sortConfig} requestSort={requestSort} width={widths.projectManagerName} onResize={onResize} />
                                <SortableHeader label="Estimated Budget" field="estimatedBudget" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedBudget} onResize={onResize} />
                                <SortableHeader label="Total Milestones" field="totalMilestones" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalMilestones} onResize={onResize} />
                                <SortableHeader label="Total Task" field="totalTasks" sortConfig={sortConfig} requestSort={requestSort} width={widths.totalTasks} onResize={onResize} />
                                <SortableHeader label="% Completed" field="percentCompleted" sortConfig={sortConfig} requestSort={requestSort} width={widths.percentCompleted} onResize={onResize} />
                                <SortableHeader label="Estimated Start Date" field="estimatedStartDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedStartDate} onResize={onResize} />
                                <SortableHeader label="Estimated End Date" field="estimatedEndDate" sortConfig={sortConfig} requestSort={requestSort} width={widths.estimatedEndDate} onResize={onResize} />
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate">
                                        {displayCell(project.projectNumber)}
                                    </td>
                                    <td className="px-3 py-2 truncate">
                                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${project.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    project.status === 'On Hold' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={project.name}>{displayCell(project.name)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={project.customerAccountName}>{displayCell(project.customerAccountName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={project.customerContactName}>{displayCell(project.customerContactName)}</td>
                                    <td className="px-3 py-2 truncate">
                                        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary truncate">
                                            {project.billingType}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate" title={project.projectManagerName}>{displayCell(project.projectManagerName)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium truncate">
                                        ${project.estimatedBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                                            {project.totalMilestones}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white truncate">
                                        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                                            {project.totalTasks}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 truncate">
                                        {project.percentCompleted !== null ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-primary h-1.5 rounded-full"
                                                        style={{ width: `${project.percentCompleted}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">{project.percentCompleted}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 truncate font-medium">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(project.estimatedStartDate)}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">{displayCell(project.estimatedEndDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="px-3 py-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={projects.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="Projects"
                />
            </div>
        </div>
    );
}
