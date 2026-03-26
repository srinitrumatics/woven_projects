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
        <div className="flex flex-col gap-4 min-w-0">
            {/* Sub-tabs design from Proposal */}
            <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <button
                    onClick={() => setActiveSubTab('debit')}
                    className={`text-sm font-bold pb-1 transition-all border-b-2 truncate max-w-[150px] ${activeSubTab === 'debit'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    title={`Debit Memos (${debitMemos.length})`}
                >
                    Debit Memos ({debitMemos.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('rtv')}
                    className={`text-sm font-bold pb-1 transition-all border-b-2 truncate max-w-[150px] ${activeSubTab === 'rtv'
                        ? "text-primary border-primary"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    title={`RTVs (${rtv.length})`}
                >
                    RTVs ({rtv.length})
                </button>
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
