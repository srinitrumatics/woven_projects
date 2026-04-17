"use client";

import React, { useState } from 'react';
import PODebitMemoLinesTab from './PODebitMemoLinesTab';
import PORtvLinesTab from './PORtvLinesTab';

interface POReturnsTabProps {
    debitMemos: any[];
    rtv: any[];
}

export default function POReturnsTab({ debitMemos, rtv }: POReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"debitMemo"| "rtv">("debitMemo");

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Sub-tabs Header */}
            <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <button
                    onClick={() => setActiveSubTab("debitMemo")}
                    className={`text-sm font-bold  pb-1 transition-all border-b-2 ${activeSubTab === "debitMemo"
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                >
                    Debit Memo Lines ({debitMemos.length})
                </button>
                <button
                    onClick={() => setActiveSubTab("rtv")}
                    className={`text-sm font-bold  pb-1 transition-all border-b-2 ${activeSubTab === "rtv"
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                >
                    RTV Lines ({rtv.length})
                </button>
            </div>

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
