import { Proposal } from "../types";

interface SignaturesTabProps {
    proposal: Proposal;
}

export default function SignaturesTab({ proposal }: SignaturesTabProps) {
    return (
        <div>
            <div className="overflow-x-auto flex justify-center">
                <table className="w-full w-[70%]">
                    <thead className="bg-primary-light dark:bg-gray-900">
                        <tr>
                            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">&nbsp;</th>
                            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Client</th>
                            <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2">
                                <div className="flex gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Signed By</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-left" title={proposal.clientSignedBy || "-"}><div className="line-clamp-2"><span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.clientSignedBy || "-"}</span></div></td>
                            <td className="px-3 py-2 text-left" title={proposal.companySignedBy || "-"}><div className="line-clamp-2"><span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.companySignedBy || "-"}</span></div></td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2">
                                <div className="flex gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Signed Title</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-left" title={proposal.clientSignedTitle || "-"}><div className="line-clamp-2"><span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.clientSignedTitle || "-"}</span></div></td>
                            <td className="px-3 py-2 text-left" title={proposal.companySignedTitle || "-"}><div className="line-clamp-2"><span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.companySignedTitle || "-"}</span></div></td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-3 py-2">
                                <div className="flex gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Signed Date</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-left">
                                <span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.clientSignedDate || "-"}</span>
                            </td>
                            <td className="px-3 py-2 text-left">
                                <span className="text-sm text-gray-900 dark:text-white font-medium">{proposal.companySignedDate || "-"}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
