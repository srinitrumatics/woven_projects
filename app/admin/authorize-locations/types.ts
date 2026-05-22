// app/admin/authorize-locations/types.ts
export type LocationStatus = "Active" | "Inactive" | "Pending";

export interface AuthorizeLocation {
    id: string;
    name: string;
    accountName: string;
    addressType: string;
    locationId: string;
    locationType: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    liftGate: boolean;
    insideDelivery: boolean;
    deliveryNotes: string;
    status: LocationStatus;

    // Optional properties for older references or card view
    contactName?: string;
    contactEmail?: string;
    createdAt?: string;
    code?: string;
    address?: string; // used in card
}
