// app/inventory/types.ts
export type InventoryStatus = "Available" | "Reserved" | "In Transit";

export interface InventoryPosition {
    id: string;
    productId?: string;
    name: string;
    receivedDate: string;
    daysInInventory: number;
    productName: string;
    productDescription: string;
    productFamily?: string;
    manufacturerDBA: string;
    manufacturerName?: string;
    supplierName: string;
    purchaseOrder: string;
    qtyOnHand: number;
    qtyAvailable: number;
    unitCost: number;
    totalPrice?: number;
    totalUnitCVInches?: number;
    totalUnitCVSQFT?: number;
    avgInventoryAge?: number;
    totalPositions?: number;
    countSites?: number;
    moq?: number;
    availableToSell?: number;
    inventoryLocation: string;
    rack: string;
    bay: string;
    levelPosition: string;
    salesOrder: string;
    shippingManifest: string;
    shipConfirmedDate: string;
    status: InventoryStatus;
}

