import re

with open('/media/trumatics/New Volume/wovn/woven_projects-main/app/proposals/[id]/components/FulfillmentsTab.tsx', 'r') as f:
    content = f.read()

# 1. Main wrapper
content = content.replace('<div className="space-y-4 h-full flex flex-col">', '<div>')

# 2. Table empty state and table wrappers
# Replace the top part where Customer Quotes starts
top_part = """            <div className="rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {/* Customer Quotes Table */}
                    {activeTab === "quotes" && (
                        sortedData.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <TableEmptyState message="No records found" description="There are no Customer Quotes associated with this proposal." />
                            </div>
                        ) : (
                            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                <Table className="border-separate border-spacing-0 table-fixed">
                                    <THead className="sticky top-0 z-20">"""

new_top_part = """            <div className="rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                {sortedData.length === 0 ? (
                    <TableEmptyState 
                        message="No records found" 
                        description={`There are no ${activeTab === 'quotes' ? 'Customer Quotes' : activeTab === 'sales' ? 'Sales Orders' : activeTab === 'shipping' ? 'Shipping Manifests' : 'Invoices'} associated with this proposal.`} 
                    />
                ) : (
                    <>
                    {/* Customer Quotes Table */}
                    {activeTab === "quotes" && (
                        <Table className="table-fixed">
                            <THead>"""

content = content.replace(top_part, new_top_part)

# 3. For the other tabs (Sales Orders, Invoices, Shipping Manifests)
# They have similar blocks. We can use regex to replace them.

regex_tab_start = r"""                    \{\/\* (.*?) Table \*\/\}
                    \{activeTab === "(.*?)" && \(
                        sortedData\.length === 0 \? \(
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <TableEmptyState message="No records found" description="There are no (.*?) associated with this proposal\." \/>
                            </div>
                        \) : \(
                            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">(?:
                                <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">)?
                                    <Table className="border-separate border-spacing-0 table-fixed">
                                        <THead className="sticky top-0 z-20">"""

def repl_tab_start(m):
    return f"""                    {{/* {m.group(1)} Table */}}
                    {{activeTab === "{m.group(2)}" && (
                        <Table className="table-fixed">
                            <THead>"""

content = re.sub(regex_tab_start, repl_tab_start, content)

# 4. Remove the pagination and closing divs for each tab
regex_tab_end = r"""                                    </Table>(?:
                                </div>)?
                                <div className="px-3 py-2">
                                    <Pagination
                                        currentPage=\{currentPage\}
                                        totalPages=\{totalPages\}
                                        onPageChange=\{setCurrentPage\}
                                        totalItems=\{activeData\.length\}
                                        itemsPerPage=\{ITEMS_PER_PAGE\}
                                        itemName=""
                                    \/>
                                </div>
                            </div>
                        \)
                    \}"""

repl_tab_end = r"""                                    </Table>
                    )}"""

content = re.sub(regex_tab_end, repl_tab_end, content)

# 5. Fix row styles
content = content.replace('className="group transition-colors"', 'className="transition-colors"')
content = content.replace('className="font-medium sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors z-10 truncate"', 'className="font-medium sticky left-0 bg-white dark:bg-gray-800 text-left truncate z-10"')

# 6. Add pagination at the end of the file
# Currently, it ends with:
#                 </div>
#             </div>
#         </div>
#     );
# }

# But we need to add the closing tags for the new structure:
#                 )}
#             </div>
#             </div>
#             <div className="px-4 py-3">
#                 <Pagination ... />
#             </div>
#         </div>

# Let's find the end of the file
end_regex = r"""                </div>
            </div>
        </div>
    \);
\}"""

# In the original, because we replaced the inner endings with just </Table> )}, 
# the outermost wrapper `</div> </div>` are still there, but we need to add `</>` for the fragment, and then Pagination.

# Actually, the original file has:
#                     )}
#                 </div>
#             </div>
#         </div>
#     );
# }

# Let's just find the last `)}` which corresponds to the last tab (shipping) and replace everything after it.
# Wait, because we added `<>` at the top `) : ( \n <>`, we need `</>` before `)}` closing the `sortedData.length === 0 ? ... : ...`.

# Let's replace the last `)}` and everything after it.
last_part_regex = r"""                    \)\}
                </div>
            </div>
        </div>
    \);
\}"""

new_last_part = """                    )}
                    </>
                )}
            </div>
            </div>
            <div className="px-4 py-3">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={activeData.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName=""
                />
            </div>
        </div>
    );
}"""

content = re.sub(last_part_regex, new_last_part, content)

with open('/media/trumatics/New Volume/wovn/woven_projects-main/app/proposals/[id]/components/FulfillmentsTab.tsx', 'w') as f:
    f.write(content)

print("Done")
