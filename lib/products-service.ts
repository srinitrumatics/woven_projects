import { formatCurrency } from "./utils/formatting";

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  mpn: string;
  status: string;
  onHand: number;
  warehouses: number;
  price: number;
  originalPrice: number;
  leadTime: string;
  moq: string;
  manufacturer: string;
  warranty: string;
  description: string;
  subDescription: string;
  features: string[];
  quickSpecs: Array<{ label: string; value: string }>;
  images: string[];
  specifications: Record<string, Array<{ label: string; value: string }>>;
  suppliers: any[];
  certifications: any[];
}

/**
 * Maps a raw Salesforce product record to the application's Product interface.
 * Note: This function uses DOM APIs and should be called on the client side.
 */
export function mapSalesforceProductToLocal(sfProduct: any): Product {
  const mappedProduct: Product = {
    id: sfProduct.Id,
    name: sfProduct.Name,
    category: sfProduct.Family || "UNSPECIFIED",
    sku: sfProduct.StockKeepingUnit || "N/A",
    mpn: sfProduct.productCode || "N/A",
    status: sfProduct.Availability_Status__c || "Out of Stock",
    onHand: sfProduct.Available_To_Sell__c || 0,
    warehouses: 1,
    price: sfProduct.Unit_Price__c || 0,
    originalPrice: sfProduct.List_Price__c || 0,
    leadTime: sfProduct.Lead_Time_Wks__c ? `${sfProduct.Lead_Time_Wks__c} weeks` : "Varies",
    moq: sfProduct.MOQ__c ? `${sfProduct.MOQ__c} unit(s)` : "1 unit",
    manufacturer: sfProduct.Manufacturer_Name || "Generic",
    warranty: sfProduct.Warranty_Period__c ? `${sfProduct.Warranty_Period__c} months` : "1 year",
    description: sfProduct.Description || "No description available.",
    subDescription: "",
    features: [],
    quickSpecs: [
      { label: "Cubic Volume (in)", value: sfProduct.gtherp__Unit_CV_Inches__c || sfProduct.Unit_CV_Inches__c || "N/A" },
      { label: "Length (in)", value: sfProduct.gtherp__Unit_Length__c || sfProduct.Unit_Length__c || "N/A" },
      { label: "Width (in)", value: sfProduct.gtherp__Unit_Width__c || sfProduct.Unit_Width__c || "N/A" },
      { label: "Height (in)", value: sfProduct.gtherp__Unit_Height__c || sfProduct.Unit_Height__c || "N/A" },
      { label: "Net Weight (lbs)", value: sfProduct.gtherp__Unit_Net_Weight__c || sfProduct.Unit_Net_Weight__c || "N/A" },
      { label: "Gross Weight (lbs)", value: sfProduct.gtherp__Unit_Gross_Weight__c || sfProduct.Unit_Gross_Weight__c || "N/A" },
      { label: "Voltage", value: sfProduct.Voltage__c || "N/A" },
      { label: "Amperage (A)", value: sfProduct.Amperage__c || "N/A" },
      { label: "Refrigerant", value: sfProduct.Refrigerant__c || "N/A" },
      { label: "Compressor Type", value: sfProduct.Compressor_Type__c || "N/A" },
      { label: "Noise Level", value: sfProduct.Noise_Level__c || "N/A" },
    ],
    images: ["/assets/product-placeholder.png"],
    specifications: {
      "Physical Dimensions": [
        { label: "Case Cubic Volume (in)", value: sfProduct.gtherp__Case_CV_Inches__c || "N/A" },
        { label: "Case Length (in)", value: sfProduct.gtherp__Case_Length__c || "N/A" },
        { label: "Case Width (in)", value: sfProduct.gtherp__Case_Width__c || "N/A" },
        { label: "Case Height (in)", value: sfProduct.gtherp__Case_Height__c || "N/A" },
        { label: "Case Net Weight (lbs)", value: sfProduct.gtherp__Case_Net_Weight__c || "N/A" },
        { label: "Case Gross Weight (lbs)", value: sfProduct.gtherp__Case_Gross_Weight__c || "N/A" },
        { label: "Shipping Weight DW 139 (lbs)", value: sfProduct.gtherp__Case_DW_139__c || "N/A" },
        { label: "Shipping Weight DW 166 (lbs)", value: sfProduct.gtherp__Case_DW_166__c || "N/A" },
        { label: "Shipping Dimensions (L x W x H)", value: sfProduct.Shipping_Dimensions__c || "N/A" },
        { label: "ECCN", value: sfProduct.gtherp__ECCN__c || "N/A" },
        { label: "HTS Code", value: sfProduct.gtherp__HTS_Code__c || "N/A" },
        { label: "GTIN", value: sfProduct.gtherp__GTIN__c || "N/A" },
        { label: "UPC", value: sfProduct.gtherp__UPC__c || "N/A" },
      ],
      "Electrical & Power": [
        { label: "Voltage Rating", value: sfProduct.Voltage_Rating__c || "N/A" },
        { label: "Running Amperage (A)", value: sfProduct.Running_Amperage__c || "N/A" },
        { label: "Connected Load (kW)", value: sfProduct.Connected_Load_kW__c || "N/A" },
        { label: "Annual Energy Consumption (kWh/yr)", value: sfProduct.Annual_Energy_kWh__c || "N/A" },
        { label: "Plug Type", value: sfProduct.Plug_Type__c || "N/A" },
        { label: "Cord Length", value: sfProduct.Cord_Length__c || "N/A" },
      ],
      "Sustainability": [
        { label: "Product Availability", value: sfProduct.gtherp__Product_Availability__c || "N/A" },
        { label: "Energy Consumption", value: sfProduct.gtherp__Energy_Consumption__c || "N/A" },
        { label: "End-of-Life Management", value: sfProduct.gtherp__End_of_Life_Management__c || "N/A" },
        { label: "Manufacturing Process", value: sfProduct.gtherp__Manufacturing_Process__c || "N/A" },
        { label: "Packaging Materials", value: sfProduct.gtherp__Packaging_Materials__c || "N/A" },
        { label: "Product Longevity", value: sfProduct.gtherp__Product_Longevity__c || "N/A" },
        { label: "Product Use Emissions", value: sfProduct.gtherp__Product_Use_Emissions__c || "N/A" },
        { label: "Water Usage", value: sfProduct.gtherp__Water_Usage__c || "N/A" },
      ],
      "Connectivity": [
        { label: "BMS Protocol", value: sfProduct.BMS_Protocol__c || "N/A" },
        { label: "Network Interface", value: sfProduct.Network_Interface__c || "N/A" },
        { label: "Wireless", value: sfProduct.Wireless__c || "N/A" },
        { label: "Display Type", value: sfProduct.Display_Type__c || "N/A" },
        { label: "Alarm Outputs", value: sfProduct.Alarm_Outputs__c || "N/A" },
        { label: "Data Logging", value: sfProduct.Data_Logging__c || "N/A" },
      ],
    },
    suppliers: [],
    certifications: []
  };

  // Handle HTML in Key_Features__c
  if (typeof document !== 'undefined' && sfProduct.Key_Features__c) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sfProduct.Key_Features__c;
    const items = Array.from(tempDiv.querySelectorAll('li, p'))
      .map(el => el.textContent?.trim())
      .filter(Boolean) as string[];

    mappedProduct.features = items.length > 0 ? items : [tempDiv.textContent?.trim() || ""];
  }

  return mappedProduct;
}

/**
 * Client-side function to fetch product details via the API proxy.
 */
export async function getProductDetails(accountId: string, contactId: string, productId: string, tabName: string = "product"): Promise<any> {
  const response = await fetch(`/api/salesforce/product-details?accountId=${accountId}&contactId=${contactId}&productId=${productId}&tabName=${tabName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product details for tab: ${tabName}`);
  }
  return response.json();
}
