import { Product } from "../orders/types";

// Helper function to generate random prices
const randomPrice = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Helper function to generate random quantities
const randomQty = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Raw product data - parsed from your table
const rawProducts = [
  { sku: "HUM10093", name: "Room Display License - 3 Year", description: "Room Display License - 3 Year", productFamily: "AV Equipment", manufacturer: "Humanly Solutions AB", brand: "Humanly", moq: 1 },
  { sku: "Command-Hub", name: "Command Hub License, Perpetual", description: "Command Hub License, Perpetual", productFamily: "Software and Licenses", manufacturer: "Imagination LLC", brand: "Imagination", moq: 1 },
  { sku: "Reflect-Plus", name: "Reflect Plus Cloud monitoring", description: "Reflect Plus Cloud monitoring and management, up to 5 systems (monthly price)", productFamily: "Software and Licenses", manufacturer: "QSC, LLC", brand: "QSC", moq: 1 },
  { sku: "CyberGenius", name: "CyberGenius Enterprise Subscription", description: "CyberGenius Enterprise Subscription, Annual", productFamily: "Security Software", manufacturer: "Ubiquiti Inc", brand: "Ubiquiti", moq: 1 },
  { sku: "TPL-SCREEN-RD SW", name: "Remote screen controller", description: "Remote screen controller per screen license", productFamily: "Operating Systems", manufacturer: "Univision", brand: "Univision", moq: 1 },
  { sku: "CAT5-EXTPK5", name: "ADDER CAT5 CATXUSB Extend Package", description: "ADDER CAT5 CATXUSB Extend Package 5 Pack, Black", productFamily: "AV Equipment", manufacturer: "Adderco Inc", brand: "Adder", moq: 1 },
  { sku: "4K-C5SERV-WHI10", name: "CAT6 10Gb Keystone Vertical", description: "ADTPRO 4K-C5SERV-WHI10 CAT6 10Gb Keystone Vertical 8P8C, 10 Pack, White", productFamily: "AV Equipment", manufacturer: "Adderco Inc", brand: "Adder", moq: 1 },
  { sku: "4K-C6PPK5", name: "CAT6 24-Port Patch Panel", description: "ADTPRO 4K-C6PPK5 CAT6 24-Port Patch Panel", productFamily: "AV Equipment", manufacturer: "Adderco Inc", brand: "Adder", moq: 1 },
  { sku: "4K-CAT6RBL", name: "CAT6 Riser Cable", description: "ADTPRO 4K-CAT6RBL CAT6 Riser Cable, 23/4 Solid BC, Unshielded, UTP, CM/PH, 1000' [305.8m] Reel in Blue", productFamily: "AV Equipment", manufacturer: "Adderco Inc", brand: "Adder", moq: 1 },
  { sku: "AL336", name: "AL20 Wall Camera Mount", description: "D336: AL20 Wall Camera Mount with Media Storage", productFamily: "Mounting Solutions", manufacturer: "Allseeu Media, LLC", brand: "Allseeu", moq: 1 },
  { sku: "FAS-CL-NFB", name: "Alcanza AI Cloud Hosted Brick", description: "Alcanza AI Cloud Hosted Brick", productFamily: "AV Equipment", manufacturer: "Alcanza AI", brand: "Alcanza", moq: 1 },
  { sku: "BCP-POE+-INJ", name: "PoE+ Power Injector 30W", description: "PoE+ Power Injector 30W capability", productFamily: "AV Equipment", manufacturer: "Alcanza AI", brand: "Alcanza", moq: 1 },
  { sku: "CBL-POE-MLS-12", name: "CBL-POE-MLS-12 LAUNCH 2 METER", description: "CBL-POE-MLS-12 LAUNCH 2 METER", productFamily: "Cables", manufacturer: "Allen Tel Products, Inc", brand: "Allen Tel", moq: 1 },
  { sku: "CBL-E2 DT-02", name: "DUM-DLE-C 12-BNCP LAUNCH 2 METER", description: "DUM-DLE-C 12-BNCP LAUNCH 2 METER", productFamily: "Cables and Connectivity", manufacturer: "Allen Tel Products, Inc", brand: "Allen Tel", moq: 1 },
  { sku: "10PHPRD10VKZ", name: "10 Pack Eco-friendly Foam Tape", description: "10 Pack Eco-friendly 4mm Foam Mounting and Filleted Tape", productFamily: "Spare Parts and Accessories", manufacturer: "AmexMan", brand: "AmexMan", moq: 1 },
  { sku: "AI052", name: "Anker 10ft Power Strip", description: "Anker 10ft Power Strip (2DOS), Surge Protection 12 Outlets", productFamily: "Cables", manufacturer: "Anker Innovations Limited", brand: "Anker", moq: 1 },
  { sku: "Mac-Mini", name: "Apple M2 Pro Mac Mini", description: "Apple M2 Pro with 10-core CPU, 16-core GPU, 16-core Neural Engine", productFamily: "AV Equipment", manufacturer: "Apple Inc.", brand: "Apple", moq: 1 },
  { sku: "MNBB1LL/A", name: "Apple TV 4K Wi-Fi + Ethernet", description: "Apple TV 4K Wi-Fi + Ethernet", productFamily: "Streaming and Recording Devices", manufacturer: "Apple Inc.", brand: "Apple", moq: 1 },
  { sku: "MU9D3LL/A", name: "Apple Mac mini with M4 Chip", description: "Apple Mac mini with M4 Chip", productFamily: "Streaming and Recording Devices", manufacturer: "Apple Inc.", brand: "Apple", moq: 1 },
  { sku: "MN6B1LL/A", name: "Apple iPad mini 8.3 inch", description: "Apple 8.3'' iPad mini (7th Gen, 128GB, Wi-Fi Only, Starlight)", productFamily: "Control Systems", manufacturer: "Apple Inc.", brand: "Apple", moq: 1 },
  { sku: "4E-HD04-03", name: "3' HAD 4K HDMI Cable", description: "3' HAD 4K HDMI Cable with Ethernet", productFamily: "AV Equipment", manufacturer: "AVA2BRO", brand: "AVA2BRO", moq: 1 },
  { sku: "PTV5221V2", name: "PTZ 4K NDI Box with PoE", description: "PTZ 4K NDI Box with PoE", productFamily: "AV Equipment", manufacturer: "AVeo Information Inc", brand: "AVeo", moq: 1 },
  { sku: "PTB221NV2", name: "2TX 4K NDI PTZ Camera", description: "2TX 4K NDI PTZ live streaming camera", productFamily: "Cameras", manufacturer: "AVeo Information Inc", brand: "AVeo", moq: 1 },
  { sku: "COM-WPRODE", name: "AVeo COM-WPRODE Adapter", description: "AVeo COM-WPRODE 1 Port PoE+ USB Adapter, 30W", productFamily: "Cables and Connectivity", manufacturer: "AVeo Information Inc", brand: "AVeo", moq: 1 },
  { sku: "1000", name: "PLA Basic - 8kg - White", description: "PLA Basic - 8kg - White", productFamily: "AV Equipment", manufacturer: "Bambulab USA Inc", brand: "Bambulab", moq: 1 },
  { sku: "1001", name: "PLA Basic - 8kg - Black", description: "PLA Basic - 8kg - Black", productFamily: "AV Equipment", manufacturer: "Bambulab USA Inc", brand: "Bambulab", moq: 1 },
  { sku: "1102", name: "PLA Matte - 8kg - Matte Charcoal", description: "PLA Matte - 8kg - Matte Charcoal", productFamily: "AV Equipment", manufacturer: "Bambulab USA Inc", brand: "Bambulab", moq: 1 },
  { sku: "6100", name: "Support for PLA - 8kg - Black", description: "Support for PLA - 8kg - Black", productFamily: "AV Equipment", manufacturer: "Bambulab USA Inc", brand: "Bambulab", moq: 1 },
  { sku: "BL-P1S00-R-USAUS-US", name: "Bambu-Lab Kit Combo", description: "Bambu-Lab Kit Combo", productFamily: "AV Equipment", manufacturer: "Bambulab USA Inc", brand: "Bambulab", moq: 1 },
  { sku: "1502ASUBK019", name: "Multi-channel Multimedia Control Cable", description: "Multi-channel Multimedia Control Cable 1-1hr 22 AWG TC D3xny3 Coml HAWA/C TC Power - Black - 500 Feet", productFamily: "AV Equipment", manufacturer: "Beldniu Inc.", brand: "Beldniu", moq: 1 },
];

// Generate full product array with random prices and quantities
export const mockProducts: Product[] = rawProducts.map((raw, index) => ({
  id: (index + 1).toString(),
  name: raw.name,
  description: raw.description,
  manufacturer: raw.manufacturer,
  productFamily: raw.productFamily,
  brand: raw.brand,
  sku: raw.sku,
  availableQty: randomQty(50, 1000),
  moq: raw.moq,
  listPrice: randomPrice(100, 5000),
  unitPrice: randomPrice(50, 4500),
  orderQty: 0,
  subtotal: 0,
}));
