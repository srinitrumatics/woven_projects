import { Order, OrderStats } from "./types";

export const mockOrders: Order[] = [
  {
    id: "1002",
    status: "Pending",
    proposal: "PRO-2024-001",
    cpo: "PO-12345",
    billTo: "Acme Corp",
    shipTo: "Warehouse A - Los Angeles",
    items: 2,
    total: 1250.00
  },
  {
    id: "1004",
    status: "Success",
    proposal: "PRO-2024-002",
    cpo: "PO-12346",
    billTo: "TechStart Inc",
    shipTo: "Distribution Center - San Francisco",
    items: 3,
    total: 2180.00
  },
  {
    id: "1007",
    status: "Draft",
    proposal: "PRO-2024-003",
    cpo: "PO-12347",
    billTo: "Global Retail LLC",
    shipTo: "Store #42 - New York",
    items: 1,
    total: 850.00
  },
  {
    id: "1009",
    status: "Success",
    proposal: "PRO-2024-004",
    cpo: "PO-12348",
    billTo: "MediCare Solutions",
    shipTo: "Clinic - Chicago",
    items: 5,
    total: 3420.00
  },
  {
    id: "1011",
    status: "Pending",
    proposal: "PRO-2024-005",
    cpo: "PO-12349",
    billTo: "FreshMart",
    shipTo: "Store #15 - Seattle",
    items: 4,
    total: 2890.00
  },
  {
    id: "1013",
    status: "Success",
    proposal: "PRO-2024-006",
    cpo: "PO-12350",
    billTo: "HealthPlus",
    shipTo: "Warehouse B - Portland",
    items: 3,
    total: 1975.00
  },
  {
    id: "1015",
    status: "Cancelled",
    proposal: "PRO-2024-007",
    cpo: "PO-12351",
    billTo: "QuickStop",
    shipTo: "Store #8 - Denver",
    items: 2,
    total: 1120.00
  },
  {
    id: "1018",
    status: "Success",
    proposal: "PRO-2024-008",
    cpo: "PO-12352",
    billTo: "Premium Wellness",
    shipTo: "Distribution Center - Austin",
    items: 6,
    total: 4250.00
  },
  {
    id: "1020",
    status: "Pending",
    proposal: "PRO-2024-009",
    cpo: "PO-12353",
    billTo: "Urban Dispensary",
    shipTo: "Store #3 - Miami",
    items: 3,
    total: 1680.00
  },
  {
    id: "1022",
    status: "Success",
    proposal: "PRO-2024-010",
    cpo: "PO-12354",
    billTo: "Green Leaf Co",
    shipTo: "Warehouse C - Boston",
    items: 7,
    total: 5120.00
  },
  {
    id: "1025",
    status: "Draft",
    proposal: "PRO-2024-011",
    cpo: "PO-12355",
    billTo: "Wellness Center",
    shipTo: "Clinic - Phoenix",
    items: 2,
    total: 980.00
  },
  {
    id: "1027",
    status: "Success",
    proposal: "PRO-2024-012",
    cpo: "PO-12356",
    billTo: "Natural Remedies",
    shipTo: "Store #22 - Dallas",
    items: 4,
    total: 2340.00
  },
  {
    id: "1030",
    status: "Pending",
    proposal: "PRO-2024-013",
    cpo: "PO-12357",
    billTo: "HealthFirst",
    shipTo: "Distribution Center - Atlanta",
    items: 5,
    total: 3890.00
  },
  {
    id: "1032",
    status: "Success",
    proposal: "PRO-2024-014",
    cpo: "PO-12358",
    billTo: "Vitality Shops",
    shipTo: "Store #11 - Las Vegas",
    items: 3,
    total: 1560.00
  },
  {
    id: "1035",
    status: "Pending",
    proposal: "PRO-2024-015",
    cpo: "PO-12359",
    billTo: "Care Plus",
    shipTo: "Warehouse D - Philadelphia",
    items: 6,
    total: 4780.00
  },
  {
    id: "1038",
    status: "Draft",
    proposal: "PRO-2024-016",
    cpo: "PO-12360",
    billTo: "Organic Living",
    shipTo: "Store #5 - Detroit",
    items: 2,
    total: 1050.00
  },
  {
    id: "1040",
    status: "Success",
    proposal: "PRO-2024-017",
    cpo: "PO-12361",
    billTo: "WellBeing Inc",
    shipTo: "Clinic - Houston",
    items: 4,
    total: 2670.00
  },
  {
    id: "1043",
    status: "Cancelled",
    proposal: "PRO-2024-018",
    cpo: "PO-12362",
    billTo: "Nature's Best",
    shipTo: "Store #28 - San Diego",
    items: 1,
    total: 720.00
  },
  {
    id: "1045",
    status: "Success",
    proposal: "PRO-2024-019",
    cpo: "PO-12363",
    billTo: "Holistic Health",
    shipTo: "Distribution Center - Minneapolis",
    items: 5,
    total: 3210.00
  },
  {
    id: "1048",
    status: "Pending",
    proposal: "PRO-2024-020",
    cpo: "PO-12364",
    billTo: "Pure Life",
    shipTo: "Store #17 - Tampa",
    items: 3,
    total: 1890.00
  }
];

export const mockStats: OrderStats = {
  totalOrders: 21,
  totalOrdersChange: 26.2,
  orderItems: 15,
  orderItemsChange: 18.2,
  returnsOrders: 0,
  returnsOrdersChange: -1.2,
  fulfilledOrders: 12,
  fulfilledOrdersChange: 12.2
};
