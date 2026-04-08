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
      { label: "Voltage", value: sfProduct.Voltage__c || "N/A" },
      { label: "Amperage", value: sfProduct.Amperage__c ? `${sfProduct.Amperage__c}A` : "N/A" },
      { label: "Refrigerant", value: sfProduct.Refrigerant__c || "N/A" },
      { label: "Compressor", value: sfProduct.Compressor_Type__c || "N/A" },
      { label: "Noise Level", value: sfProduct.Noise_Level__c || "N/A" },
    ],
    images: ["/assets/product-placeholder.png"],
    specifications: {
      Dimensions: [
        { label: "Unit Height", value: sfProduct.Unit_Height__c ? `${sfProduct.Unit_Height__c} in` : "N/A" },
        { label: "Unit Width", value: sfProduct.Unit_Width__c ? `${sfProduct.Unit_Width__c} in` : "N/A" },
        { label: "Unit Length", value: sfProduct.Unit_Length__c ? `${sfProduct.Unit_Length__c} in` : "N/A" },
        { label: "Unit Net Weight", value: sfProduct.Unit_Net_Weight__c ? `${sfProduct.Unit_Net_Weight__c} lbs` : "N/A" },
        { label: "Unit Gross Weight", value: sfProduct.Unit_Gross_Weight__c ? `${sfProduct.Unit_Gross_Weight__c} lbs` : "N/A" },
        { label: "Unit CV", value: sfProduct.Unit_CV_Inches__c ? `${sfProduct.Unit_CV_Inches__c} cu in` : "N/A" },
      ],
      "Features & Tech": [
        { label: "Alarm Outputs", value: sfProduct.Alarm_Outputs__c || "N/A" },
        { label: "Display Type", value: sfProduct.Display_Type__c || "N/A" },
        { label: "Wireless", value: sfProduct.Wireless__c || "N/A" },
        { label: "Network Interface", value: sfProduct.Network_Interface__c || "N/A" },
        { label: "BMS Protocol", value: sfProduct.BMS_Protocol__c || "N/A" },
        { label: "Data Logging", value: sfProduct.Data_Logging__c || "N/A" },
        { label: "Noise Level", value: sfProduct.Noise_Level__c || "N/A" },
        { label: "Compressor Type", value: sfProduct.Compressor_Type__c || "N/A" },
        { label: "Refrigerant", value: sfProduct.Refrigerant__c || "N/A" },
      ],
      "Sustainability": [
        { label: "Water Usage", value: sfProduct.Water_Usage__c || "N/A" },
        { label: "Product Use Emissions", value: sfProduct.product_Use_Emissions__c || "N/A" },
        { label: "Product Longevity", value: sfProduct.product_Longevity__c || "N/A" },
        { label: "Packaging Materials", value: sfProduct.Packaging_Materials__c || "N/A" },
        { label: "Manufacturing Process", value: sfProduct.Manufacturing_Process__c || "N/A" },
        { label: "End of Life Management", value: sfProduct.End_of_Life_Management__c || "N/A" },
        { label: "Energy Consumption", value: sfProduct.Energy_Consumption__c || "N/A" },
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
