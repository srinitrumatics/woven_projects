export type DeliveryWindowStatus = "Active" | "Inactive";

export interface DeliveryWindow {
    id: string;
    name: string;
    shipToLocation: string;
    dayOfWeek: string;
    windowStart: string;
    windowEnd: string;
    open24Hours: boolean;
    receiveOnFederalHolidays: boolean;
    closedForDeliveries: boolean;
    deliveryNotes: string;
    active: boolean;
}
