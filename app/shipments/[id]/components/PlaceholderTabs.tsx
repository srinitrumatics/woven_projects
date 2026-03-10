function EmptyTab({ label }: { label: string }) {
    return (
        <div className="p-12 text-center text-gray-400 italic">
            {label} content will appear here.
        </div>
    );
}



export function ShipmentFilesTab() {
    return <EmptyTab label="Files" />;
}

export function TrackingTimelineTab() {
    return <EmptyTab label="Tracking Timeline" />;
}
