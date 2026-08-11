import { formatCurrency } from "./utils/formatting";
import { parsePhotoUrls } from "./utils/product-images";

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  mpn: string;
  status: string; // Inventory status (e.g. In Stock, Out of Stock)
  productAvailability?: string; // Lifecycle status (e.g. Draft, Available)
  onHand: number;
  warehouses: number;
  price: number;
  originalPrice: number;
  leadTime: string;
  moq: string;
  brand: string;
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

const PRODUCT_PLACEHOLDER_IMAGE = "/assets/product-placeholder.png";

/**
 * Maps a raw Salesforce product record to the application's Product interface.
 * Note: This function uses DOM APIs and should be called on the client side.
 */
export function mapSalesforceProductToLocal(sfProduct: any): Product {
  const photoUrls = parsePhotoUrls(sfProduct.gtherp__Image_URL__c ?? sfProduct.Image_URL__c);

  const mappedProduct: Product = {
    id: sfProduct.Id,
    name: sfProduct.Name,
    category: sfProduct.Family || "UNSPECIFIED",
    sku: sfProduct.StockKeepingUnit || "N/A",
    mpn: sfProduct.productCode || "N/A",
    status: sfProduct.Availability_Status__c || "Out of Stock",
    productAvailability: sfProduct.Product_Availability__c || sfProduct.product_availability__c || "Draft",
    onHand: sfProduct.Available_To_Sell__c || 0,
    warehouses: 1,
    price: sfProduct.Unit_Price__c || 0,
    originalPrice: sfProduct.List_Price__c || 0,
    leadTime: sfProduct.Lead_Time_Wks__c ? `${sfProduct.Lead_Time_Wks__c} weeks` : "Varies",
    moq: sfProduct.MOQ__c ? `${sfProduct.MOQ__c} unit(s)` : "1 unit",
    brand: sfProduct.gtherp__Brand_Name__r?.Name ?? sfProduct.gtherp__Brand_Name__c ?? sfProduct.Brand_Name__c ?? "—",
    warranty: sfProduct.Warranty_Period__c ? `${sfProduct.Warranty_Period__c} months` : "1 year",
    description: sfProduct.Description || "No description available.",
    subDescription: "",
    features: [],
    quickSpecs: [
      { label: "Cubic Volume (in)", value: sfProduct.Unit_CV_Inches__c || sfProduct.Unit_CV_Inches__c || "0" },
      { label: "Length (in)", value: sfProduct.Unit_Length__c || sfProduct.Unit_Length__c || "0" },
      { label: "Width (in)", value: sfProduct.Unit_Width__c || sfProduct.Unit_Width__c || "0" },
      { label: "Height (in)", value: sfProduct.Unit_Height__c || sfProduct.Unit_Height__c || "0" },
      { label: "Net Weight (lbs)", value: sfProduct.Unit_Net_Weight__c || sfProduct.Unit_Net_Weight__c || "0" },
      { label: "Gross Weight (lbs)", value: sfProduct.Unit_Gross_Weight__c || sfProduct.Unit_Gross_Weight__c || "0" },
      { label: "Voltage", value: sfProduct.Voltage__c || "0" },
      { label: "Amperage (A)", value: sfProduct.Amperage__c || "0" },
      { label: "Refrigerant", value: sfProduct.Refrigerant__c || "0" },
      { label: "Compressor Type", value: sfProduct.Compressor_Type__c || "0" },
      { label: "Noise Level", value: sfProduct.Noise_Level__c || "0" },
    ],
    images: photoUrls.length > 0 ? photoUrls : [PRODUCT_PLACEHOLDER_IMAGE],
    specifications: {
      "Physical Dimensions": [
        { label: "Case Cubic Volume (in)", value: sfProduct.Case_CV_Inches__c || "0" },
        { label: "Case Length (in)", value: sfProduct.Case_Length__c || "0" },
        { label: "Case Width (in)", value: sfProduct.Case_Width__c || "0" },
        { label: "Case Height (in)", value: sfProduct.Case_Height__c || "0" },
        { label: "Case Net Weight (lbs)", value: sfProduct.Case_Net_Weight__c || "0" },
        { label: "Case Gross Weight (lbs)", value: sfProduct.Case_Gross_Weight__c || "0" },
        { label: "Shipping Weight DW 139 (lbs)", value: sfProduct.Case_DW_139__c || "0" },
        { label: "Shipping Weight DW 166 (lbs)", value: sfProduct.Case_DW_166__c || "0" },
        { label: "Shipping Dimensions (L x W x H)", value: sfProduct.Shipping_Dimensions__c || "0" },
        { label: "ECCN", value: sfProduct.ECCN__c || "" },
        { label: "HTS Code", value: sfProduct.HTS_Code__c || "" },
        { label: "GTIN", value: sfProduct.GTIN__c || "" },
        { label: "UPC", value: sfProduct.UPC__c || "" },
      ],
      "Electrical & Power": [
        { label: "Voltage Rating", value: sfProduct.Voltage_Rating__c || "0" },
        { label: "Running Amperage (A)", value: sfProduct.Running_Amperage__c || "0" },
        { label: "Connected Load (kW)", value: sfProduct.Connected_Load_kW__c || "0" },
        { label: "Annual Energy Consumption (kWh/yr)", value: sfProduct.Annual_Energy_kWh__c || "0" },
        { label: "Plug Type", value: sfProduct.Plug_Type__c || "0" },
        { label: "Cord Length", value: sfProduct.Cord_Length__c || "0" },
      ],
      "Sustainability": [
        { label: "Product Availability", value: sfProduct.product_Availability__c || "" },
        { label: "Energy Consumption", value: sfProduct.Energy_Consumption__c || "" },
        { label: "End-of-Life Management", value: sfProduct.End_of_Life_Management__c || "" },
        { label: "Manufacturing Process", value: sfProduct.Manufacturing_Process__c || "" },
        { label: "Packaging Materials", value: sfProduct.Packaging_Materials__c || "" },
        { label: "Product Longevity", value: sfProduct.product_Longevity__c || "" },
        { label: "Product Use Emissions", value: sfProduct.product_Use_Emissions__c || "" },
        { label: "Water Usage", value: sfProduct.Water_Usage__c || "" },
      ],
      "Connectivity": [
        { label: "BMS Protocol", value: sfProduct.BMS_Protocol__c || "" },
        { label: "Network Interface", value: sfProduct.Network_Interface__c || "" },
        { label: "Wireless", value: sfProduct.Wireless__c || "" },
        { label: "Display Type", value: sfProduct.Display_Type__c || "" },
        { label: "Alarm Outputs", value: sfProduct.Alarm_Outputs__c || "" },
        { label: "Data Logging", value: sfProduct.Data_Logging__c || "" },
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
