import { Project, SortDirection } from "../types";
import { SortableHeader } from "../../../../components/ui/SortableHeader";

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

    const sortConfig = { key: sortField as string, direction: sortDirection };
    const requestSort = (key: string) => onSort(key as keyof Project);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <table className="w-full ">
                <thead className="bg-primary-light dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <SortableHeader label="Project Number" field="projectNumber" sortConfig={sortConfig} requestSort={requestSort} width={widths.projectNumber} onResize={onResize} className="sticky left-0 bg-primary-light dark:bg-gray-900 z-10" />
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
                    {projects.length === 0 ? (
                        <tr>
                            <td colSpan={13} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-lg font-medium">No projects found</p>
                                    <p className="text-sm">There are no projects associated with this proposal.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        projects.map((project) => (
                            <tr key={project.id} className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium sticky left-0 bg-white dark:bg-gray-800 text-left">
                                    <div className="line-clamp-2" title={project.projectNumber}> {project.projectNumber} </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${project.status === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                project.status === 'On Hold' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white font-medium" title={project.name}><div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{project.name}</div></td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={project.customerAccountName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{project.customerAccountName}</div></td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={project.customerContactName}><div className="text-sm text-gray-900 dark:text-white line-clamp-2">{project.customerContactName}</div></td>
                                <td className="px-3 py-2">
                                    <span className="inline-block px-2 py-1 text-sm font-medium rounded bg-primary/10 text-primary">
                                        {project.billingType}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white" title={project.projectManagerName}>
                                    <div className="text-sm text-gray-900 dark:text-white line-clamp-1">{project.projectManagerName}</div></td>
                                <td className="px-3 py-2 text-sm text-left text-gray-900 dark:text-white font-semibold min-w-[172px]">
                                    ${project.estimatedBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-3 py-2 text-left text-sm text-gray-900 dark:text-white min-w-[147px]">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                                        {project.totalMilestones}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-left text-sm text-gray-900 dark:text-white">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">
                                        {project.totalTasks}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-left min-w-[137px]">
                                    {project.percentCompleted !== null ? (
                                        <div className="flex gap-2">
                                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${project.percentCompleted}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{project.percentCompleted}%</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[175px]">{project.estimatedStartDate}</td>
                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[175px]">{project.estimatedEndDate}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
