"use client";

import React, { useState } from 'react';
import PODebitMemoTable from './PODebitMemoTable';
import PORTVTable from './PORTVTable';

interface POReturnsTabProps {
    debitMemos: any[];
    rtv: any[];
}

export default function POReturnsTab({ debitMemos, rtv }: POReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'debit' | 'rtv'>('debit');

    const tabs = [
        { id: 'debit', label: 'Debit Memos', count: debitMemos.length },
        { id: 'rtv', label: 'RTVs', count: rtv.length },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Sub-tabs design from Proposal */}
            <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <button
                    onClick={() => setActiveSubTab('debit')}
                    className={`text-xs font-bold  pb-1 transition-all border-b-2 ${activeSubTab === 'debit'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                >
                    Debit Memos ({debitMemos.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('rtv')}
                    className={`text-xs font-bold  pb-1 transition-all border-b-2 ${activeSubTab === 'rtv'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                >
                    RTVs ({rtv.length})
                </button>
            </div>

            <div className="text-[10px] text-gray-400 italic mb-2">
                {activeSubTab === 'debit' ?
                    "* Debit Memos (Not Visible to Client ONLY to Client-Partner or Partner)" :
                    "* RTVs (Not Visible to Client ONLY to Client-Partner or Partner)"
                }
            </div>

            {/* Content Area */}
            <div className="mt-2">
                {activeSubTab === 'debit' ? (
                    <PODebitMemoTable debitMemos={debitMemos} />
                ) : (
                    <PORTVTable rtv={rtv} />
                )}
            </div>
        </div>
    );
}
