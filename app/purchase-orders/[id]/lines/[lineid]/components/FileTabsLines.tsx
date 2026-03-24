"use client";

import POFilesTable from "@/app/purchase-orders/[id]/components/POFilesTable";

export default function FileTabsLines({ files, poLineId }: { files: any[], poLineId: string }) {
    return (
        <div className="space-y-4">
            <POFilesTable files={files} poId={poLineId} />
        </div>
    );
}
