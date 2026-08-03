"use client";

import React, { useState } from 'react';
import PODebitMemoLinesTab from './PODebitMemoLinesTab';
import PORtvLinesTab from './PORtvLinesTab';
import SubTabs from '@/components/ui/SubTabs';

interface POReturnsTabProps {
    debitMemos: any[];
    rtv: any[];
}

export default function POReturnsTab({ debitMemos, rtv }: POReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"debitMemo"| "rtv">("debitMemo");

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub-tabs Header */}
            <SubTabs
                tabs={[
                    { key: "debitMemo", label: "Debit Memo Lines", count: debitMemos.length },
                    { key: "rtv", label: "RTV Lines", count: rtv.length },
                ]}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as "debitMemo" | "rtv")}
                className="flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto pb-2"
            />

            {/* Sub-tab Content */}
            <div className="flex-1 min-h-0">
                {activeSubTab === "debitMemo"&& (
                    <PODebitMemoLinesTab lines={debitMemos} />
                )}
                {activeSubTab === "rtv"&& (
                    <PORtvLinesTab lines={rtv} />
                )}
            </div>


        </div >
    );
}
