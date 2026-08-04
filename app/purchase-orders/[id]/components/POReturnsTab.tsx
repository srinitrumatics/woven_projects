"use client";

import React, { useState } from 'react';
import PODebitMemoTable from './PODebitMemoTable';
import PORTVTable from './PORTVTable';
import SubTabs from '@/components/ui/SubTabs';

interface POReturnsTabProps {
    rtv: any[];
    debitMemos: any[];
}

export default function POReturnsTab({ debitMemos, rtv }: POReturnsTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<'rtv' | 'debit'>('rtv');

    const tabs = [
        { key: 'rtv', label: 'RTVs', count: rtv.length },
        { key: 'debit', label: 'Debit Memos', count: debitMemos.length },
    ];

    return (
        <div className="flex flex-col gap-4 min-w-0">
            {/* Sub-tabs */}
            <SubTabs
                tabs={tabs}
                activeKey={activeSubTab}
                onChange={(key) => setActiveSubTab(key as 'rtv' | 'debit')}
            />

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
